# ADR 0002 — Security headers and Content-Security-Policy

**Status:** Accepted · 6 October 2026

## Decision
Static security headers are set for every route in `next.config.ts`: CSP, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`, and HSTS in production builds.

The CSP is static and allows `'unsafe-inline'` for scripts and styles.

## Why not a nonce-based CSP
A per-request nonce forces every page to render dynamically, which would remove static prerendering of the marketing site (a stated goal). The site loads **no third-party scripts**, renders all user content as text, and sets `connect-src 'self'`, `form-action 'self'`, `frame-ancestors 'none'` and `object-src 'none'`, so the practical exposure from `'unsafe-inline'` is low.

## Revisit when
- Analytics or any third-party script is added (decision D8), or
- the 1b admin ships — admin pages are dynamic anyway, so a nonce CSP for `/admin` via `proxy.ts` is cheap and recommended there.
