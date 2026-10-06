# API

All responses are JSON with `Cache-Control: no-store`.

```ts
// success
{ "ok": true, "data": { ... } }
// error
{ "ok": false, "error": { "code": string, "message": string, "fields"?: Record<string, string> } }
```

Error messages are written for visitors. Stack traces, database errors and configuration are never returned.

## POST /api/inquiries
Public. Requires `Origin` matching `SITE_URL` (or the request's own origin) and `Content-Type: application/json`. Body ≤ 32 KB.

```json
{
  "fields": {
    "fullName": "string, 2–120, trimmed, NFC-normalised",
    "company": "string ≤160, optional",
    "email": "valid email ≤254, lower-cased",
    "phone": "optional; required when contactMethod is phone or whatsapp; 7–15 digits, + ( ) . - and spaces allowed",
    "category": "not_sure | business_consulting | digital_marketing | branding_creative | website_software_development | ai_automation | cloud_it_solutions | cybersecurity | digital_transformation | other",
    "description": "string, 20–5000",
    "budget": "string ≤120, optional, free text, no currency assumed",
    "contactMethod": "email (default) | phone | whatsapp | online_meeting"
  },
  "idempotencyKey": "UUID — one per filled-in form, reused on retry",
  "attribution": {
    "utmSource|utmMedium|utmCampaign|utmTerm|utmContent": "string ≤200, optional",
    "landingPath|submittedFromPath": "site path starting with /, query string removed, ≤300",
    "referrerDomain": "hostname only"
  },
  "hp": "honeypot — must be empty or absent"
}
```

| Status | Code | Meaning |
|---|---|---|
| 201 | — | Stored. `data.reference` e.g. `BL-7K2M-9QXD-4F` |
| 200 | — | Replay of an earlier successful submission with the same key and content |
| 400 | `invalid_json`, `rejected`, `challenge_failed` | Unreadable body, honeypot filled, or challenge failed |
| 403 | `forbidden_origin` | Cross-site or origin-less request |
| 409 | `idempotency_conflict` | Key reused with different content |
| 413 | `payload_too_large` | Body over 32 KB |
| 415 | `unsupported_media_type` | Not JSON |
| 422 | `validation_failed` | `error.fields` maps field name → first message. All field errors are returned together |
| 429 | `rate_limited` | More than 5 per address per 10 minutes. `Retry-After` header in seconds |
| 500 | `server_error` | Nothing was stored |

## POST /api/partner-applications
Same envelope, guards and status codes. Limit: 3 per address per 10 minutes. Reference prefix `BP-`.

```json
{
  "fields": {
    "contactName": "string, 2–120",
    "email": "valid email ≤254",
    "organization": "string ≤160, optional",
    "phone": "optional, same rules as above",
    "providerType": "professional | consultant | developer | agency | technology_provider | specialized_service_provider | other",
    "expertise": "array, ≥1 of the eight service categories or other; duplicates removed",
    "websiteUrl": "optional, http(s) only, ≤2048, never fetched by the server",
    "capabilities": "string, 20–5000"
  },
  "idempotencyKey": "UUID",
  "hp": ""
}
```

## GET /api/health
`200 {"status":"ok"}`. Liveness only; reveals no versions or dependency state.

## Not yet implemented (Release 1b)
`/api/admin/leads`, `/api/admin/leads/[id]`, `/api/admin/leads/[id]/notes`, partner equivalents, `/api/admin/users`.
