import { describe, expect, it } from "vitest";
import { inquiryFieldsSchema, inquiryRequestSchema } from "@/features/inquiries/schema";

const valid = {
  fullName: "  Asha Gurung ",
  email: "Asha@Example.com",
  category: "cybersecurity",
  description: "We need a security review of our customer portal.",
};

describe("inquiry validation", () => {
  it("accepts a minimal valid inquiry and normalises values", () => {
    const result = inquiryFieldsSchema.parse(valid);
    expect(result.fullName).toBe("Asha Gurung");
    expect(result.email).toBe("asha@example.com");
    expect(result.contactMethod).toBe("email");
    expect(result.company).toBeUndefined();
  });

  it("turns empty optional strings into undefined", () => {
    const result = inquiryFieldsSchema.parse({ ...valid, company: "  ", budget: "" });
    expect(result.company).toBeUndefined();
    expect(result.budget).toBeUndefined();
  });

  it("rejects categories outside the allowed list", () => {
    const result = inquiryFieldsSchema.safeParse({ ...valid, category: "partnership" });
    expect(result.success).toBe(false);
  });

  it("accepts Not sure yet", () => {
    expect(inquiryFieldsSchema.safeParse({ ...valid, category: "not_sure" }).success).toBe(true);
  });

  it.each(["phone", "whatsapp"] as const)("requires a phone number when contact method is %s", (contactMethod) => {
    const result = inquiryFieldsSchema.safeParse({ ...valid, contactMethod });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["phone"]);
    expect(inquiryFieldsSchema.safeParse({ ...valid, contactMethod, phone: "+977 980-000-0000" }).success).toBe(true);
  });

  it("does not require a phone number for an online meeting", () => {
    expect(inquiryFieldsSchema.safeParse({ ...valid, contactMethod: "online_meeting" }).success).toBe(true);
  });

  it.each(["12345", "call me", "+1 234 567 890 123 456 789"])("rejects invalid phone %s", (phone) => {
    expect(inquiryFieldsSchema.safeParse({ ...valid, phone }).success).toBe(false);
  });

  it("enforces length limits", () => {
    expect(inquiryFieldsSchema.safeParse({ ...valid, fullName: "A" }).success).toBe(false);
    expect(inquiryFieldsSchema.safeParse({ ...valid, fullName: "A".repeat(121) }).success).toBe(false);
    expect(inquiryFieldsSchema.safeParse({ ...valid, description: "too short" }).success).toBe(false);
    expect(inquiryFieldsSchema.safeParse({ ...valid, description: "x".repeat(5001) }).success).toBe(false);
    expect(inquiryFieldsSchema.safeParse({ ...valid, budget: "x".repeat(121) }).success).toBe(false);
    expect(inquiryFieldsSchema.safeParse({ ...valid, email: `${"a".repeat(250)}@x.co` }).success).toBe(false);
  });

  it("requires a UUID idempotency key", () => {
    expect(inquiryRequestSchema.safeParse({ fields: valid, idempotencyKey: "abc" }).success).toBe(false);
    expect(inquiryRequestSchema.safeParse({ fields: valid, idempotencyKey: crypto.randomUUID() }).success).toBe(true);
  });

  it("drops malformed attribution instead of rejecting the inquiry", () => {
    const result = inquiryRequestSchema.parse({
      fields: valid,
      idempotencyKey: crypto.randomUUID(),
      attribution: { landingPath: "https://evil.example/x", referrerDomain: "<script>", utmSource: "newsletter" },
    });
    expect(result.attribution?.landingPath).toBeUndefined();
    expect(result.attribution?.referrerDomain).toBeUndefined();
    expect(result.attribution?.utmSource).toBe("newsletter");
  });

  it("strips query strings from paths", () => {
    const result = inquiryRequestSchema.parse({ fields: valid, idempotencyKey: crypto.randomUUID(), attribution: { landingPath: "/solutions?email=a@b.c" } });
    expect(result.attribution?.landingPath).toBe("/solutions");
  });
});
