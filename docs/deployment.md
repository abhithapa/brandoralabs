# Deployment

Nothing in this repository creates cloud resources, sends real email or publishes the site. Every step below is run deliberately by a person with authority to do so.

## Target (default, decision D3)
| Need | AWS service |
|---|---|
| Web app | App Runner or ECS Fargate running the `web` image target |
| Database | RDS for PostgreSQL 16, private subnet, automated backups on |
| Email | Amazon SES via SMTP (`EMAIL_TRANSPORT=smtp`) |
| Worker | EventBridge Scheduler → ECS task (`tools` target) every minute, running `npm run notifications:process` |
| Migrations | One-off ECS task (`tools` target) running `npx prisma migrate deploy` |
| Secrets | Secrets Manager / SSM → task environment |
| Logs & alerts | CloudWatch Logs; alarm on `outbox.failed_backlog` and on `/api/health` failures |

## Environments
Separate `development`, `staging` and `production` databases. Staging must sit behind authentication (e.g. App Runner + IP allowlist or basic auth at the load balancer); `ALLOW_INDEXING=false` is not access control.

## Production environment
See `.env.example`. In production set `APP_ENV=production`; the app then refuses to start without a real email transport and at least one `LEAD_NOTIFICATION_RECIPIENTS` address. Set `ALLOW_INDEXING=true` only on production. Set `TRUSTED_PROXY_HOPS` to the number of proxies in front of the app (1 for a single load balancer).

## Email deliverability (launch blocker)
Before production, on the sending domain:
1. Verify the domain in SES and publish the three **DKIM** CNAME records SES provides.
2. **SPF:** `TXT @ "v=spf1 include:amazonses.com ~all"` (merge with any existing SPF record — only one SPF record is allowed). For best alignment configure a custom MAIL FROM subdomain in SES and publish its MX and SPF records.
3. **DMARC:** start with `TXT _dmarc "v=DMARC1; p=none; rua=mailto:<reporting address>"`, move to `quarantine` once reports are clean.
4. Request SES production access (new accounts are sandboxed and can only send to verified addresses).

## Release order
1. CI green on the commit (lint, types, migrations + drift check, unit, integration, build, e2e, audit).
2. Build images once; tag with the commit SHA.
3. **Staging:** run migrations task → deploy `web` → smoke checks (`/api/health`, home, one solution page, submit a test inquiry, worker run shows `sent`).
4. Run the CI workflow manually with **production_readiness** ticked — `launch:check` must pass.
5. **Production:** run migrations task once → deploy the *same* image → smoke checks.

## Migrations
- Run `prisma migrate deploy` exactly once per release, before the new app version takes traffic.
- Write backward-compatible migrations (add, backfill, then remove in a later release) so the previous app version keeps working during rollout.
- **Rolling back the app does not roll back the schema.** If a migration must be undone, write and apply a new forward migration.
- Never run `prisma/seed.ts` in production (it refuses when `APP_ENV=production`).

## Rollback
1. Redeploy the previous image tag (App Runner/ECS keeps it).
2. If the failed release included a migration, confirm the previous version is compatible with the new schema (it should be, by the rule above). If not, apply a corrective forward migration.
3. Check the outbox: `SELECT status, count(*) FROM notification_outbox GROUP BY 1;` — `pending` rows will be sent by the worker; nothing is lost.

## Backup and restore
- RDS automated backups with point-in-time recovery; retention per the business's policy (D7).
- **Before launch, perform one restore drill:** restore a snapshot to a new instance, point a staging app at it, confirm leads are readable. Record the date and time taken.

## Failed notifications
Rows with `status = 'failed'` exhausted 6 attempts. The worker logs `outbox.failed_backlog` on every run while any exist.
```sql
SELECT id, template, recipient, attempts, last_error_code, created_at
FROM notification_outbox WHERE status = 'failed' ORDER BY created_at DESC;
-- after fixing the cause, retry:
UPDATE notification_outbox SET status = 'pending', attempts = 0, next_attempt_at = now() WHERE status = 'failed';
```
The lead itself is always stored; a failed email never means a lost inquiry.

## Data deletion (manual, administrators only)
Until the admin exists, deletion requests are handled in SQL by an authorised administrator:
```sql
BEGIN;
DELETE FROM notification_outbox WHERE target_type = 'lead' AND target_id = '<lead id>';
DELETE FROM leads WHERE id = '<lead id>';
COMMIT;
```
Record who did it and when outside the database. Retention periods are pending owner decision (D7).
