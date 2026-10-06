import { describe, expect, it } from "vitest";
import { partnerFieldsSchema } from "@/features/partners/schema";

const valid = {
  contactName: "Bikash Rai",
  email: "bikash@example.com",
  providerType: "developer",
  expertise: ["website_software_development", "ai_automation"],
  capabilities: "Full-stack web development and workflow automation.",
};

describe("partner validation", () => {
  it("accepts a valid application", () => {
    expect(partnerFieldsSchema.safeParse(valid).success).toBe(true);
  });

  it("requires at least one expertise area and de-duplicates", () => {
    expect(partnerFieldsSchema.safeParse({ ...valid, expertise: [] }).success).toBe(false);
    const result = partnerFieldsSchema.parse({ ...valid, expertise: ["cybersecurity", "cybersecurity"] });
    expect(result.expertise).toEqual(["cybersecurity"]);
  });

  it("rejects unknown expertise and provider types", () => {
    expect(partnerFieldsSchema.safeParse({ ...valid, expertise: ["not_sure"] }).success).toBe(false);
    expect(partnerFieldsSchema.safeParse({ ...valid, providerType: "reseller" }).success).toBe(false);
  });

  it.each(["javascript:alert(1)", "ftp://example.com", "example.com"])("rejects non-http(s) website %s", (websiteUrl) => {
    expect(partnerFieldsSchema.safeParse({ ...valid, websiteUrl }).success).toBe(false);
  });

  it("accepts http and https websites", () => {
    expect(partnerFieldsSchema.safeParse({ ...valid, websiteUrl: "https://example.com/about" }).success).toBe(true);
    expect(partnerFieldsSchema.safeParse({ ...valid, websiteUrl: "http://example.com" }).success).toBe(true);
  });
});
