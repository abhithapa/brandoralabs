# Assumptions

Defaults used to keep work moving. Each is reversible. Owner decisions are tracked in prompt v1.1 §23.

## Inputs missing at build time
- **Script.docx was not supplied.** Service capability lists, vision, mission, values and segment descriptions are DRAFT copy written only from facts in the development prompt. Every draft item is listed in `content-checklist.md`. The site shows a "Preview build" banner on every page until `getLaunchIssues()` returns nothing.
- **No brand assets.** The palette, type and wordmark are provisional (`src/styles/tokens.css`, `src/components/layout/wordmark.tsx`). The text wordmark is a placeholder, not a brand proposal.
- **Contact details.** The source's `hello@` address is incomplete and is not displayed. Phone, address and social links are not shown until confirmed.
- **Hours** "Sunday–Friday, 9 AM–6 PM" are shown as draft with an unconfirmed timezone. `Asia/Kathmandu` is the draft business timezone.

## Product defaults
- English only. Consultation requests are inquiries; "Online meeting" never implies a booking.
- No public response-time promise (D5).
- Segment wording: Startups, SMEs, Growing companies, Enterprises & organizations (confirm against source).
- Partner review is manual; approval publishes nothing and notifies no one automatically.
- "Not sure yet" is the first category option.
- Partnership inquiries go to the partner form via a link (not a category).

## Technical defaults
- Hosting target AWS (D3); container image and docs provided, no resources created.
- Email via SMTP (Amazon SES SMTP is the intended provider). Not tested against a real provider — no credentials available.
- Rate limiting in PostgreSQL (ADR 0003).
- `APP_ENV` (not `NODE_ENV`) controls production-only safety checks, so the production build can be tested locally and in CI.
