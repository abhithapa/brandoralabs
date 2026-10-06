# Brandora Labs website

Marketing website and lead capture for Brandora Labs — *Grow Beyond Limits.*

**Status: Release 1a, preview.** Public site, requirement and partner forms, database, email outbox and worker are built and tested. Page copy is draft and brand assets are provisional until the source document and brand files are supplied — see [`docs/content-checklist.md`](docs/content-checklist.md). The staff admin is Release 1b.

## Stack
Next.js 16 (App Router) · React 19 · TypeScript 6 · Tailwind CSS 4 · PostgreSQL 16 · Prisma 7 · Zod 4 · Vitest · Playwright. Exact versions and reasons: [`docs/decisions/0001-stack-and-versions.md`](docs/decisions/0001-stack-and-versions.md).

## Prerequisites
- Node.js **22.12 or newer** (22.22.0 used in CI) and npm
- PostgreSQL 16, local or via Docker

## Quick start
```bash
npm ci                                  # also runs `prisma generate`
cp .env.example .env                    # then set RATE_LIMIT_SECRET: openssl rand -hex 32

# Database (skip if you have PostgreSQL running)
docker run -d --name brandora-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=brandora_dev postgres:16-alpine

npm run db:migrate:deploy               # apply migrations
npm run db:seed                         # optional: 2 sample leads, 1 partner application (example.com only)
npm run dev                             # http://localhost:3000
```
In a second terminal, process the email outbox (prints a redacted log line per email; nothing is sent):
```bash
npm run notifications:process -- --watch
```

Or run everything in containers: `docker compose up --build`.

## Scripts
| Command | Does |
|---|---|
| `npm run dev` / `build` / `start` | Develop, production build, serve the build |
| `npm run lint` / `typecheck` | ESLint, `tsc --noEmit` |
| `npm test` | Unit tests (no database) |
| `npm run test:integration` | Integration tests against `TEST_DATABASE_URL` (database name must end in `_test`; tables are truncated) |
| `npm run test:e2e` | Playwright on desktop and 360px mobile. Run `npx playwright install chromium` once, and `npm run build` first |
| `npm run db:migrate:dev` | Create a new migration after editing `prisma/schema.prisma` |
| `npm run db:migrate:deploy` | Apply committed migrations (the only command to use in staging/production) |
| `npm run db:seed` | Development seed; refuses when `APP_ENV=production` |
| `npm run notifications:process` | One worker pass; add `-- --watch` to poll every 30 s |
| `npm run launch:check` | Fails while launch inputs are missing. CI runs it before production promotion |

### Running the test suites
```bash
createdb brandora_test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/brandora_test npm run db:migrate:deploy
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/brandora_test npm run test:integration
```

## Administrator provisioning
There is no staff login in Release 1a. Staff receive every submission in full at the addresses in `LEAD_NOTIFICATION_RECIPIENTS`. Admin access, roles and invitations arrive with Release 1b; there will be no default administrator password.

## Changing content
- Services: `src/content/solutions.ts` (validated at build time — a missing or duplicated solution fails the build)
- Homepage, journey, advantages, partner text: `src/content/company.ts`
- Segments: `src/content/audiences.ts`
- Name, contact details, legal status: `src/config/site.ts`
- Colours and type: `src/styles/tokens.css` (components only reference tokens)

## Troubleshooting
| Symptom | Fix |
|---|---|
| Every page returns 500, log says `Invalid environment configuration` | Fix the named keys in `.env`. Values are never printed |
| `` `log` transport is not allowed in production`` | You set `APP_ENV=production`. Use `smtp`, or use `APP_ENV=staging` for non-production testing |
| Form returns "can only be submitted from the Brandora Labs website" | `SITE_URL` doesn't match the address in your browser |
| Form returns 429 while testing | Rate limit: 5 per 10 minutes per address. `DELETE FROM rate_limit_buckets;` locally |
| `prisma generate` fails downloading engines behind a locked-down proxy | Allow `binaries.prisma.sh`, or set `PRISMA_ENGINES_MIRROR` |
| Integration tests refuse to run | `TEST_DATABASE_URL` must point at a database whose name ends in `_test` |

## Documentation
[Requirements traceability](docs/requirements.md) · [Assumptions](docs/assumptions.md) · [Architecture](docs/architecture.md) · [API](docs/api.md) · [Deployment & runbooks](docs/deployment.md) · [Content checklist](docs/content-checklist.md) · [Decisions](docs/decisions/) · [Delivery report](docs/delivery-report.md)
