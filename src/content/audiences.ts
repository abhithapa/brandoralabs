/**
 * Four customer segments by business stage (from source). Descriptions and
 * example needs are DRAFT. No industry-specific pages: the source describes
 * stages, not sectors.
 */
export type Audience = { id: string; name: string; summary: string; typicalNeeds: string[] };

export const audiences: Audience[] = [
  {
    id: "startups",
    name: "Startups",
    summary: "Founders turning an idea into a working business, often with a small team and limited time.",
    typicalNeeds: ["A brand and website to launch with", "First customer acquisition", "A product built to validate the idea"],
  },
  {
    id: "smes",
    name: "SMEs",
    summary: "Established small and medium businesses that want to modernise without taking on a large internal team.",
    typicalNeeds: ["Reaching customers online", "Replacing manual processes", "Reliable IT and security basics"],
  },
  {
    id: "growing-companies",
    name: "Growing companies",
    summary: "Businesses expanding quickly, where yesterday's tools and processes start to slow things down.",
    typicalNeeds: ["Systems that scale", "Automation across teams", "Coordinated marketing across channels"],
  },
  {
    id: "enterprises-organizations",
    name: "Enterprises & organizations",
    summary: "Larger organisations that need specialist capability or an extra delivery partner for specific programmes.",
    typicalNeeds: ["Digital transformation programmes", "Cloud and security initiatives", "Specialist skills for defined projects"],
  },
];
