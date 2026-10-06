/**
 * Public site identity and launch configuration. Safe for client components:
 * contains no secrets. Values marked `null` are unconfirmed launch inputs
 * (prompt §21) and are never rendered as if they were real.
 */

export type ContentStatus = "draft" | "approved";

export const siteConfig = {
  name: "Brandora Labs",
  tagline: "Grow Beyond Limits.",
  positioning: "Your Trusted Partner for Business Growth, Technology & Digital Solutions.",

  /** Overall content approval (decision D6). Flip to "approved" only after owner sign-off. */
  contentStatus: "draft" as ContentStatus,
  /** Logo is a provisional text wordmark until brand assets are supplied (see docs/assumptions.md). */
  logo: { kind: "provisional-wordmark" as const, src: null as string | null },

  /** Legal entity name for footer and legal pages. Unconfirmed. */
  legalEntityName: null as string | null,

  contact: {
    /** Source lists an incomplete `hello@` address — deliberately not used. */
    email: null as string | null,
    phone: null as string | null,
    whatsapp: null as string | null,
    address: null as string | null,
    /** From the source; timezone unconfirmed, so shown as draft. */
    hours: { text: "Sunday–Friday, 9 AM–6 PM", timezoneLabel: "Nepal time (to be confirmed)", confirmed: false },
  },

  /** Only verified accounts belong here. */
  social: [] as { label: string; href: string }[],

  legal: { privacyStatus: "draft" as ContentStatus, termsStatus: "draft" as ContentStatus },
} as const;

/**
 * Launch inputs still missing. Shown in the preview banner and enforced by
 * `npm run launch:check`, which CI runs before production promotion.
 */
export function getLaunchIssues(): string[] {
  const issues: string[] = [];
  if (siteConfig.contentStatus !== "approved") issues.push("Page copy is draft and awaits owner approval (D6)");
  if (siteConfig.logo.kind === "provisional-wordmark") issues.push("Brand logo, colours and fonts not supplied");
  if (!siteConfig.legalEntityName) issues.push("Legal entity name not confirmed");
  if (!siteConfig.contact.email) issues.push("Public contact email not confirmed (source address is incomplete)");
  if (!siteConfig.contact.phone) issues.push("Public phone number not confirmed");
  if (!siteConfig.contact.address) issues.push("Office address not confirmed");
  if (!siteConfig.contact.hours.confirmed) issues.push("Business hours timezone not confirmed");
  if (siteConfig.legal.privacyStatus !== "approved") issues.push("Privacy notice not approved (D7)");
  if (siteConfig.legal.termsStatus !== "approved") issues.push("Terms not approved (D7)");
  return issues;
}
