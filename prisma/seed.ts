/**
 * Development seed. Refuses to run in production. Contains no real personal data:
 * names are obviously fictional and emails use the reserved example.com domain.
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { getEnv } from "@/config/env";
import { disconnectDb, getDb } from "@/server/db/client";
import { submitInquiry } from "@/server/services/inquiries";
import { submitPartnerApplication } from "@/server/services/partners";

async function main() {
  if (getEnv().APP_ENV === "production") throw new Error("Refusing to seed a production database");
  const db = getDb();
  if ((await db.lead.count()) > 0) {
    console.info("Database already has leads; seed skipped.");
    return;
  }

  await submitInquiry(
    {
      fullName: "Sample Visitor",
      company: "Example Trading Co.",
      email: "sample.visitor@example.com",
      category: "website_software_development",
      description: "Sample inquiry: we need a new website with an online catalogue. (Seed data — not a real request.)",
      contactMethod: "email",
    },
    randomUUID(),
    { landingPath: "/solutions/website-software-development", submittedFromPath: "/contact", utmSource: "seed" },
  );

  await submitInquiry(
    {
      fullName: "Second Sample",
      email: "second.sample@example.com",
      phone: "+977 9800000000",
      category: "not_sure",
      description: "Sample inquiry: unsure where to start with marketing and branding. (Seed data.)",
      contactMethod: "whatsapp",
    },
    randomUUID(),
  );

  await submitPartnerApplication(
    {
      contactName: "Sample Partner",
      email: "sample.partner@example.com",
      providerType: "agency",
      expertise: ["digital_marketing", "branding_creative"],
      websiteUrl: "https://example.com",
      capabilities: "Sample partner application: social media campaigns and brand identity. (Seed data.)",
    },
    randomUUID(),
  );

  console.info("Seeded 2 leads and 1 partner application.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => disconnectDb());
