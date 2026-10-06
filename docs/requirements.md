# Requirements traceability — Release 1a

Source: *Brandora Labs — Master Website Development Prompt v1.1*. ✅ done · ◐ partial · ⏳ later release · ✋ blocked on owner input

| § | Requirement | Status | Where / note |
|---|---|---|---|
| 0 | Source document present | ✋ | Script.docx not supplied; content is draft (see `content-checklist.md`) |
| 1.1 | Lead attribution for success measures | ✅ | UTM, landing path, referrer domain, submitted-from path on every lead |
| 3 | Next.js App Router, TS, Tailwind, PostgreSQL, Prisma, Zod, Vitest, Playwright | ✅ | ADR 0001 |
| 4 | Staff roles and permissions | ⏳ 1b | |
| 5 | Public routes and real 404 for unknown slugs | ✅ | `dynamicParams = false` |
| 5 | Admin routes | ⏳ 1b | |
| 6 | Homepage sections 1–9 | ✅ | Proof sections omitted (no real evidence) |
| 6 | Eight solution pages with required sections | ◐ | FAQ hidden until approved content exists |
| 7 | Tokens, responsive, keyboard nav, skip link, focus, reduced motion | ✅ | Manual visual/a11y review still required (no browser here) |
| 8 | Requirement form fields and rules | ✅ | |
| 8 | Not sure yet; partnership via link | ✅ | |
| 8 | Preselect from service CTAs | ✅ | `/contact?service=<slug>` |
| 8 | Inline errors + summary, input preserved, pending, no duplicates | ✅ | |
| 8 | Success only after persistence; non-enumerable reference | ✅ | |
| 8 | Lead + outbox in one transaction; worker with bounded retries | ✅ | |
| 8 | "Received" wording; online meeting not a booking | ✅ | Tested |
| 8 | Privacy notice and version recorded | ✅ | Wording draft (D7) |
| 8 | Marketing opt-in | — | Not built (no source basis), ADR 0004 |
| 9 | Partner form, multi-expertise, URL validation without fetching | ✅ | |
| 10 | Admin workflow | ⏳ 1b | Staff receive full submissions by email meanwhile |
| 11 | UUIDs, UTC timestamps, enums, uniqueness, indexes | ✅ | |
| 11 | StaffUser, InternalNote, AuditEvent | ⏳ 1b | Additive migrations |
| 12 | Public endpoints, envelopes, status codes, idempotency | ✅ | `docs/api.md` |
| 13 | Validation, origin check, shared rate limit, honeypot, size limit, headers/CSP | ✅ | ADRs 0002, 0003 |
| 13 | Challenge adapter | ◐ | Interface only |
| 14 | Metadata, canonical, OG image, sitemap, robots, JSON-LD | ✅ | |
| 14 | Analytics events | ⏳ | Depends on D8 |
| 15 | Repository structure | ✅ | Adapted for Prisma 7 (`prisma.config.ts`) |
| 16 | Env validation at startup, `.env.example`, scripts, strict TS | ✅ | |
| 17 | Tests for business rules and security boundaries | ✅ | 31 unit + 25 integration passing; e2e written, not executed here |
| 18 | CI order, container, deployment and rollback docs | ✅ | |
| 21 | Launch inputs | ✋ | `npm run launch:check` lists them |
