# Delivery report — Release 1a (phases 1–4)

6 October 2026

## Completed
- Next.js 16 / Prisma 7 / PostgreSQL project with pinned versions (ADR 0001) and the prompt's repository layout.
- All public routes: home, solutions index, 8 solution pages, who we serve, how we work, partners, about, contact, privacy, terms, custom 404 and error pages.
- Requirement form and partner form: shared client/server validation, error summary, inline errors, preserved input, pending state, double-submit guard, idempotent retries, success only after persistence.
- Persistence: leads, partner applications, notification outbox, rate-limit buckets; initial migration.
- Notification worker: transactional outbox, SKIP LOCKED claiming, exponential backoff, failure state, crash recovery; SMTP and development log transports.
- Abuse protection: same-origin check, 32 KB limit, shared PostgreSQL rate limit (no raw IPs stored), honeypot, challenge adapter.
- First-touch attribution on every lead without cookies.
- SEO: per-page metadata, canonical URLs, sitemap, environment-aware robots, Organization/Service/BreadcrumbList JSON-LD, OG image.
- Security headers + CSP; environment validation at startup with values never printed.
- Docs, CI workflow, Dockerfile (web + tools targets), compose stack, seed, launch check.

## Verified, and how
| Check | Result |
|---|---|
| `tsc --noEmit` (strict, `noUncheckedIndexedAccess`) | Pass, 0 errors |
| ESLint (next core-web-vitals + typescript) | Pass, 0 warnings |
| Unit tests | 31 passed |
| Integration tests against real PostgreSQL 16 | 25 passed — persistence, outbox atomicity, idempotent replay, concurrent retries, key-reuse conflict, same-email allowed, email failure keeps the lead, retry/backoff/exhaustion, crash reclaim, two workers no double-send, all API status codes, origin check, honeypot, rate limit incl. spoofed X-Forwarded-For, no raw IP stored |
| Production build | Pass — 24 routes; marketing pages static, `/contact` dynamic |
| Production server smoke test | All routes 200, unknown solution 404; security headers present; one `<h1>` per page; skip link, `lang`, `main` landmark present; service preselect works; JSON-LD present; no invented proof or incomplete email in output |
| Live submission through the running server | 201 → retry 200 same reference → cross-site 403 → invalid 422 listing all five field errors; row and attribution stored; outbox queued |
| Seed + worker against dev database | 3 records seeded, 6 emails processed, 0 failed |
| Runtime dependency audit | 0 vulnerabilities |

Two defects were found by these tests and fixed: the staff-alert date format threw at runtime, and the phone-required rule was skipped whenever another field was invalid.

## Not verified
- **Playwright e2e and visual review** — specs written (pages, 404, preselect, skip link, mobile menu + Escape, form errors/success, partner form, overflow at 360px and 1440px), **not executed**: the sandbox blocks the browser download. No screenshots were taken, so layout has not been visually reviewed.
- **Migration drift check** — the initial migration SQL was written by hand because the sandbox blocks Prisma's schema-engine download. All Prisma queries in the integration tests run against it successfully, but `prisma migrate diff` (in CI) is the authoritative check; index names are the most likely place for a difference.
- **SMTP / SES delivery** — no credentials; only the log transport ran.
- **Docker image build** — not built here (no registry access).
- **Accessibility** — structural checks only; manual keyboard/screen-reader review and an automated scan still needed (WCAG 2.2 AA target).

## Assumptions
See `docs/assumptions.md`. Main one: all page copy beyond the prompt's stated facts is draft, pending Script.docx.

## Blockers to launch
Script.docx content · brand assets · legal entity name · contact email/phone/address · hours timezone · privacy, terms and retention (D7) · copy approval (D6) · SES domain verification with SPF/DKIM/DMARC · hosting setup (D3). `npm run launch:check` lists the config-level ones.

## Decisions needed
- **D1** custom admin vs existing CRM (blocks Release 1b)
- **D2** identity provider for staff sign-in (blocks 1b)
- **D6** who approves copy
- **D7** privacy/terms/retention wording
- **D8** analytics tool and consent approach
