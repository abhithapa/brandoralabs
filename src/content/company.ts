import type { SolutionSlug } from "@/features/categories";

/**
 * Company-level content. Headline facts (tagline, positioning, the five steps,
 * the advantage points, the challenges and the partner model) come from the
 * development prompt's summary of Script.docx. Explanatory sentences are DRAFT
 * copy pending the source document and owner approval — see docs/content-checklist.md.
 */

export const hero = {
  heading: "One partner for the challenges that hold your business back",
  body:
    "Brandora Labs brings strategy, creativity, marketing and technology together. Tell us what you are trying to achieve; we work out what it needs and bring in the right team, specialist or partner to deliver it.",
  primaryCta: { label: "Talk to an Expert", href: "/contact" },
  secondaryCta: { label: "Explore our solutions", href: "/solutions" },
};

export type JourneyStep = { name: string; summary: string; detail: string };

/** Understand → Analyze → Connect → Deliver → Grow (from source). Descriptions are draft. */
export const journey: JourneyStep[] = [
  {
    name: "Understand",
    summary: "We listen first",
    detail: "We start with your goals, your constraints and what has or hasn't worked so far — before recommending anything.",
  },
  {
    name: "Analyze",
    summary: "We find the real need",
    detail: "We look at the problem behind the request and decide what kind of help will actually move it forward.",
  },
  {
    name: "Connect",
    summary: "We match the right expertise",
    detail: "We assign our own team, or bring in a specialist or partner, depending on what the work needs.",
  },
  {
    name: "Deliver",
    summary: "We coordinate the work",
    detail: "You keep one point of contact while the work is planned, carried out and reviewed with you.",
  },
  {
    name: "Grow",
    summary: "We stay involved",
    detail: "After delivery we help you review results and decide what to improve or tackle next.",
  },
];

export type Challenge = { need: string; detail: string; solution: SolutionSlug };

/** Example challenges named in the prompt (§6), each linked to the closest solution. */
export const challenges: Challenge[] = [
  { need: "Establish a brand people recognise", detail: "Identity, messaging and visual materials that fit the business you are building.", solution: "branding-creative" },
  { need: "Find and reach more customers", detail: "Getting in front of the right audience and turning interest into enquiries.", solution: "digital-marketing" },
  { need: "Build a website or software product", detail: "From a first website to custom applications your team or customers use.", solution: "website-software-development" },
  { need: "Improve how work gets done", detail: "Reducing manual, repetitive work with better processes and automation.", solution: "ai-automation" },
  { need: "Scale your infrastructure", detail: "Cloud and IT foundations that keep up as the business grows.", solution: "cloud-it-solutions" },
];

/** "Brandora advantage" points (from source). Descriptions are draft. */
export const advantages = [
  { title: "One trusted contact", detail: "A single relationship instead of managing several vendors yourself." },
  { title: "The right expertise", detail: "Each need is matched to people who do that kind of work." },
  { title: "Tailored solutions", detail: "Recommendations shaped around your business, not a fixed package." },
  { title: "Coordinated delivery", detail: "Workstreams are planned together so pieces fit." },
  { title: "Ongoing support", detail: "Help continues after delivery as your needs change." },
];

export const partnerNetwork = {
  heading: "Internal teams and specialist partners",
  body:
    "Some work is delivered by Brandora's own team. Where a need calls for specialist skills, we bring in vetted partners and coordinate the work so you still deal with one contact.",
  ctaLabel: "Become a partner",
};

export const finalCta = {
  heading: "Have a challenge? Let's solve it together.",
  body: "You don't need to know which service you need. Describe the problem and we'll take it from there.",
  ctaLabel: "Talk to an Expert",
};

/**
 * Vision, mission and values exist in the source document but were not supplied.
 * They stay null until provided; the About page omits these sections rather than inventing them.
 */
export const about = {
  vision: null as string | null,
  mission: null as string | null,
  values: [] as { title: string; detail: string }[],
};
