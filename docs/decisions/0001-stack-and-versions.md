# ADR 0001 — Stack and pinned versions

**Status:** Accepted · 6 October 2026

## Decision
Modular monolith: one Next.js (App Router) application, one PostgreSQL database, Prisma ORM. No separate backend, queue or cache service in release 1a.

All dependencies are pinned to exact versions (`--save-exact`) and locked in `package-lock.json`. Versions were checked against the npm registry on 6 October 2026.

| Package | Version | Note |
|---|---|---|
| Node.js | 22.22.0 (≥ 22.12 required) | Vitest 5 and Prisma 7 require ≥ 22.12 |
| next | 16.3.8 | App Router, Turbopack build, `output: "standalone"` |
| react / react-dom | 19.3.0 | |
| typescript | 6.0.3 | **Not 7.x.** TypeScript 7 (native Go compiler) was released recently; Next.js type-checking and editor plugins have not been verified against it. Revisit in a later release. |
| tailwindcss / @tailwindcss/postcss | 4.3.3 | CSS-first config; tokens in `src/styles/tokens.css` |
| prisma / @prisma/client / @prisma/adapter-pg | 7.10.0 | **Not 8.0.0-rc.** npm's `latest` tag currently points at a release candidate; 7.10.0 is the newest stable. Prisma 7 uses the `prisma-client` generator, `prisma.config.ts`, and a driver adapter (`pg`). |
| pg | 8.23.1 | Driver for the Prisma adapter |
| zod | 4.6.5 | Shared client/server validation |
| nodemailer | 10.0.15 | SMTP transport (works with Amazon SES SMTP) |
| vitest | 5.0.3 | Unit and integration tests |
| @playwright/test | 1.63.0 | Browser tests |
| eslint | 9.39.5 | **Not 10.x.** `eslint-config-next` 16 is published against ESLint 9 flat config. |
| eslint-config-next | 16.3.8 | |

### Overrides
`package.json` overrides two transitive packages pulled in by the Prisma CLI to clear high-severity advisories: `mysql2` → 3.24.5, `deepmerge-ts` → 8.0.2. `npm audit --omit=dev` reports 0 vulnerabilities. A remaining dev-only advisory (`braces`, via lint tooling) does not ship to production.

## Choices not taken
- **React Hook Form:** not used. Two forms with shared Zod schemas did not justify the dependency. Revisit if forms multiply.
- **shadcn/ui:** not used. A small set of accessible primitives in `src/components/forms/fields.tsx` covers release 1a.
- **Redis for rate limiting:** see ADR 0003.
- **Web fonts:** system font stack until brand fonts are supplied; avoids a network dependency at build time.
