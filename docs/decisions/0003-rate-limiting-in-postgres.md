# ADR 0003 — Rate limiting stored in PostgreSQL

**Status:** Accepted · 6 October 2026

## Context
The prompt requires a shared store for rate limits (per-process counters fail with several instances) and asks that IP addresses are not kept indefinitely.

## Decision
A fixed-window counter in the `rate_limit_buckets` table, updated with one atomic `INSERT … ON CONFLICT DO UPDATE` per request.

- The key is `HMAC-SHA256(RATE_LIMIT_SECRET, scope + client address)`. Raw addresses are never stored.
- Rows expire with their window and are purged by the notification worker on every run.
- Limits: 5 inquiries and 3 partner applications per address per 10 minutes.
- The client address is read from `X-Forwarded-For` using `TRUSTED_PROXY_HOPS`, so addresses a client inserts itself cannot be used to dodge the limit.

## Consequences
No extra infrastructure. Each public submission costs one extra small write — negligible at the expected volume. If traffic ever makes this a bottleneck, the `consumeRateLimit` function is the only thing to swap for Redis/ElastiCache.
