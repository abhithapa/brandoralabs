/**
 * Service categories shared by content, forms, validation and the database.
 * Database enum values use underscores; URL slugs use hyphens.
 * This file is safe to import from client components.
 */

export const SOLUTION_SLUGS = [
  "business-consulting",
  "digital-marketing",
  "branding-creative",
  "website-software-development",
  "ai-automation",
  "cloud-it-solutions",
  "cybersecurity",
  "digital-transformation",
] as const;

export type SolutionSlug = (typeof SOLUTION_SLUGS)[number];

export const SERVICE_CATEGORIES = [
  "business_consulting",
  "digital_marketing",
  "branding_creative",
  "website_software_development",
  "ai_automation",
  "cloud_it_solutions",
  "cybersecurity",
  "digital_transformation",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

/** Categories a visitor can choose on the requirement form. */
export const INQUIRY_CATEGORIES = ["not_sure", ...SERVICE_CATEGORIES, "other"] as const;
export type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number];

/** Expertise areas a partner can declare. */
export const EXPERTISE_CATEGORIES = [...SERVICE_CATEGORIES, "other"] as const;
export type ExpertiseCategory = (typeof EXPERTISE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<InquiryCategory, string> = {
  not_sure: "Not sure yet",
  business_consulting: "Business Consulting",
  digital_marketing: "Digital Marketing",
  branding_creative: "Branding & Creative",
  website_software_development: "Website & Software Development",
  ai_automation: "AI & Automation",
  cloud_it_solutions: "Cloud & IT Solutions",
  cybersecurity: "Cybersecurity",
  digital_transformation: "Digital Transformation",
  other: "Other",
};

export function slugToCategory(slug: string | undefined | null): ServiceCategory | undefined {
  if (!slug) return undefined;
  const index = SOLUTION_SLUGS.indexOf(slug as SolutionSlug);
  return index === -1 ? undefined : SERVICE_CATEGORIES[index];
}

export function categoryToSlug(category: ServiceCategory): SolutionSlug {
  return SOLUTION_SLUGS[SERVICE_CATEGORIES.indexOf(category)] as SolutionSlug;
}

export const CONTACT_METHODS = ["email", "phone", "whatsapp", "online_meeting"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const CONTACT_METHOD_LABELS: Record<ContactMethod, string> = {
  email: "Email",
  phone: "Phone",
  whatsapp: "WhatsApp",
  online_meeting: "Online meeting",
};

export const PROVIDER_TYPES = [
  "professional",
  "consultant",
  "developer",
  "agency",
  "technology_provider",
  "specialized_service_provider",
  "other",
] as const;
export type ProviderType = (typeof PROVIDER_TYPES)[number];

export const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  professional: "Independent professional",
  consultant: "Consultant",
  developer: "Developer",
  agency: "Agency",
  technology_provider: "Technology provider",
  specialized_service_provider: "Specialised service provider",
  other: "Other",
};
