# Content checklist

Everything below must be supplied or approved before launch. `npm run launch:check` fails until the config flags are cleared.

| Item | Where | Status |
|---|---|---|
| Solution pages — overview, problems, suitable for, **capabilities** (replace with source lists verbatim), approach | `src/content/solutions.ts` (`status: "draft"` on all 8) | Draft |
| Solution FAQs | `src/content/solutions.ts` → `faqs` | None (section hidden) |
| Homepage hero, challenge descriptions, advantage descriptions | `src/content/company.ts` | Draft |
| Five-step descriptions (step names are from source) | `src/content/company.ts` → `journey` | Draft |
| Audience descriptions and typical needs | `src/content/audiences.ts` | Draft |
| Vision, mission, values | `src/content/company.ts` → `about` | Missing (sections hidden) |
| Partner page "how it works" steps | `src/app/(marketing)/partners/page.tsx` | Draft |
| Logo, palette, fonts | `src/styles/tokens.css`, `wordmark.tsx`, `siteConfig.logo` | Provisional |
| Legal entity name | `src/config/site.ts` | Missing |
| Public email, phone, WhatsApp, address | `src/config/site.ts` → `contact` | Missing |
| Business hours timezone | `src/config/site.ts` → `contact.hours` | Unconfirmed |
| Social links (verified only) | `src/config/site.ts` → `social` | None |
| Privacy notice wording + retention period | `src/app/(marketing)/privacy/page.tsx`, `PRIVACY_NOTICE_VERSION` | Draft outline |
| Terms of use | `src/app/(marketing)/terms/page.tsx` | Placeholder |
| Open Graph image artwork | `src/app/opengraph-image.tsx` | Provisional |
| Proof (clients, testimonials, case studies) | — | None. Do not add until real and approved |

## Going live
1. Replace content above; set each solution's `status` to `"approved"` and `siteConfig.contentStatus` to `"approved"`.
2. Fill `siteConfig` contact/legal fields; set `legal.privacyStatus` / `termsStatus` to `"approved"`; bump `PRIVACY_NOTICE_VERSION`.
3. Run `npm run launch:check` — it must pass.
