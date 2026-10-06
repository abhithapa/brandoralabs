import "server-only";
import type { Lead, PartnerApplication } from "@/generated/prisma/client";
import { CATEGORY_LABELS, CONTACT_METHOD_LABELS, PROVIDER_TYPE_LABELS } from "@/features/categories";
import { siteConfig } from "@/config/site";

/**
 * Plain-text emails only: submitted content is never interpreted as HTML.
 * Subjects contain the reference, never visitor-supplied text.
 * Wording says "received" — not accepted, assigned or booked.
 */

type Rendered = { subject: string; text: string };

function formatDate(date: Date, timeZone: string): string {
  // dateStyle/timeStyle cannot be combined with timeZoneName, so fields are explicit.
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(date);
}

function lines(...parts: (string | false | null | undefined)[]): string {
  return parts.filter((part): part is string => typeof part === "string").join("\n");
}

export function leadAcknowledgement(lead: Lead): Rendered {
  const followUp =
    lead.contactMethod === "online_meeting"
      ? "You asked for an online meeting. We will email you to arrange a time — no meeting is booked yet."
      : `We will review it and contact you by ${CONTACT_METHOD_LABELS[lead.contactMethod].toLowerCase()}.`;
  return {
    subject: `We've received your requirement (${lead.publicRef})`,
    text: lines(
      `Hello ${lead.fullName},`,
      "",
      `Thank you for contacting ${siteConfig.name}. We have received your requirement.`,
      followUp,
      "",
      `Your reference: ${lead.publicRef}`,
      `Service: ${CATEGORY_LABELS[lead.category]}`,
      "",
      "Please quote your reference if you contact us about this request.",
      "",
      siteConfig.name,
    ),
  };
}

export function leadInternalAlert(lead: Lead, timeZone: string): Rendered {
  return {
    subject: `New lead ${lead.publicRef} — ${CATEGORY_LABELS[lead.category]}`,
    text: lines(
      `New requirement received ${formatDate(lead.createdAt, timeZone)}`,
      "",
      `Reference: ${lead.publicRef}`,
      `Name: ${lead.fullName}`,
      lead.company ? `Company: ${lead.company}` : null,
      `Email: ${lead.email}`,
      lead.phone ? `Phone: ${lead.phone}` : null,
      `Preferred contact: ${CONTACT_METHOD_LABELS[lead.contactMethod]}`,
      `Service: ${CATEGORY_LABELS[lead.category]}`,
      lead.budget ? `Estimated budget: ${lead.budget}` : null,
      "",
      "Requirement:",
      lead.description,
      "",
      "Source:",
      `  Landing page: ${lead.landingPath ?? "unknown"}`,
      `  Submitted from: ${lead.submittedFromPath ?? "unknown"}`,
      `  Referrer: ${lead.referrerDomain ?? "direct / unknown"}`,
      lead.utmSource ? `  Campaign: ${[lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" / ")}` : null,
    ),
  };
}

export function partnerAcknowledgement(application: PartnerApplication): Rendered {
  return {
    subject: `We've received your partnership application (${application.publicRef})`,
    text: lines(
      `Hello ${application.contactName},`,
      "",
      `Thank you for your interest in partnering with ${siteConfig.name}. We have received your application and will review it.`,
      "",
      `Your reference: ${application.publicRef}`,
      "",
      siteConfig.name,
    ),
  };
}

export function partnerInternalAlert(application: PartnerApplication, timeZone: string): Rendered {
  return {
    subject: `New partner application ${application.publicRef}`,
    text: lines(
      `New partner application received ${formatDate(application.createdAt, timeZone)}`,
      "",
      `Reference: ${application.publicRef}`,
      `Name: ${application.contactName}`,
      application.organization ? `Organisation: ${application.organization}` : null,
      `Email: ${application.email}`,
      application.phone ? `Phone: ${application.phone}` : null,
      `Provider type: ${PROVIDER_TYPE_LABELS[application.providerType]}`,
      `Expertise: ${application.expertise.map((item) => CATEGORY_LABELS[item]).join(", ")}`,
      application.websiteUrl ? `Website (not verified): ${application.websiteUrl}` : null,
      "",
      "Capabilities:",
      application.capabilities,
    ),
  };
}
