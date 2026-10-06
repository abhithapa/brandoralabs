# ADR 0004 — Release 1a scope and deferred items

**Status:** Accepted · 6 October 2026

## Decision
This delivery implements **Release 1a** (prompt v1.1 §19, phases 1–4): public site, both forms, persistence, transactional outbox, worker, SEO, tests, CI and container files.

**Release 1b (staff admin) is not started.** Until it ships, every submission is emailed in full to `LEAD_NOTIFICATION_RECIPIENTS`, and staff work from those emails.

## Schema prepared for 1b
`leads` already has `status` and `first_contacted_at`, and partner applications have `status`, so 1b adds tables (`staff_users`, `internal_notes`, `audit_events`) and a nullable `assigned_to_id` column — additive migrations only.

## Deviations from the prompt, and why
| Prompt | Implemented | Reason |
|---|---|---|
| "Partnership & Collaboration" as an inquiry category | Link to the partner form above the category field | Prompt v1.1 §8 — avoids moving entered data between forms |
| Optional marketing opt-in | Not built | Source does not mention marketing communications; adding a consent flow without a use would be speculative |
| Challenge verification | Adapter interface only (`src/server/security/challenge.ts`) | Honeypot + rate limit ship now; add a provider only if spam appears |
| Analytics events | Not wired | Depends on D8 (tool and consent approach). First-touch attribution is captured server-side on every lead without cookies |
| FAQ sections | Hidden | No approved FAQ content exists |
| Vision / mission / values | Hidden on About page | In the source document, which was not supplied |
