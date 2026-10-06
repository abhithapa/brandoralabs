# Architecture

## Shape
One Next.js application, one PostgreSQL database, one scheduled worker process using the same codebase.

```
Browser ──► Next.js (App Router)
              ├─ (marketing) pages — Server Components, prerendered from typed content files
              ├─ /api/inquiries, /api/partner-applications — thin route handlers
              │     origin check → size-bounded JSON → rate limit → Zod → honeypot → service
              └─ /api/health
                          │
                          ▼
                     PostgreSQL ◄──── notification worker (scripts/process-notifications.ts)
                 leads, partner_applications,        claims due outbox rows (SKIP LOCKED),
                 notification_outbox,                renders plain-text email, sends via SMTP,
                 rate_limit_buckets                  retries with backoff, purges rate-limit rows
```

## Folder map
| Path | Responsibility |
|---|---|
| `src/app/(marketing)` | Public routes. Route group adds no URL segment; has its own layout so the 1b admin can use a different one |
| `src/app/api` | Route handlers. Each is a few lines delegating to `createSubmissionHandler` |
| `src/components` | `ui` primitives, `layout` (header, nav, footer, banner), `marketing` sections, `forms` |
| `src/features` | Client-safe domain code: categories, Zod schemas, attribution capture |
| `src/server` | Server-only code (`import "server-only"`): db client, services, security, notifications |
| `src/content` | Typed, Zod-validated marketing content |
| `src/config` | `env.ts` (validated, server-only), `site.ts` (public identity + launch checks), navigation |
| `prisma` | Schema, migrations, seed |

## Key flows

**Submission.** The browser validates with the same Zod schema the server uses, then posts JSON with a client-generated idempotency key (UUID, one per filled-in form). The service hashes the normalised fields, inserts the record and its outbox rows in **one transaction**, and returns `201` with a public reference. A retry with the same key and content returns `200` and the original reference; the same key with different content returns `409`. Concurrent retries are resolved by the unique constraint on `idempotency_key`.

**Notifications.** Outbox rows: one acknowledgement to the submitter, one full-detail alert per staff recipient. The worker claims rows with `FOR UPDATE SKIP LOCKED`, so multiple workers are safe. Failures back off exponentially (1, 2, 4… minutes, capped at 1 hour) for up to 6 attempts, then the row is marked `failed`. Rows stuck in `sending` after a crash are reclaimed when their 5-minute lock expires — delivery is at-least-once, with a stable `Message-ID` per row.

**Attribution.** On first page view per session, UTM parameters, landing path and external referrer **domain** are stored in `sessionStorage` (no cookies). The inquiry form sends them with the submission; the server validates and truncates them, dropping anything malformed rather than rejecting the inquiry.

## Rendering
All marketing pages are statically prerendered except `/contact`, which reads `?service=` to preselect a category. Client JavaScript is limited to the navigation menu, the two forms, and the attribution capture.

## Security summary
Server-side validation on every field; Prisma parameterised queries (raw SQL uses tagged templates); same-origin check on public POSTs; 32 KB body limit; shared rate limit; honeypot; plain-text emails with subjects that never include visitor text; security headers and CSP (ADR 0002); secrets only in `src/config/env.ts`, which is server-only and reports invalid keys without values.
