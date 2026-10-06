import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { getDb, disconnectDb } from "@/server/db/client";
import { submitInquiry } from "@/server/services/inquiries";
import { submitPartnerApplication } from "@/server/services/partners";
import { IdempotencyConflictError } from "@/server/services/errors";
import { inquiryFieldsSchema } from "@/features/inquiries/schema";
import { partnerFieldsSchema } from "@/features/partners/schema";
import { resetDatabase } from "../support/db";

const fields = inquiryFieldsSchema.parse({
  fullName: "Asha Gurung",
  email: "asha@example.com",
  category: "branding_creative",
  description: "We are launching a new product line and need a brand.",
});

beforeEach(resetDatabase);
afterAll(disconnectDb);

describe("submitInquiry", () => {
  it("persists the lead with attribution and creates one outbox row per recipient", async () => {
    const receipt = await submitInquiry(fields, randomUUID(), { utmSource: "newsletter", landingPath: "/solutions/branding-creative" });
    expect(receipt.replayed).toBe(false);

    const lead = await getDb().lead.findUniqueOrThrow({ where: { publicRef: receipt.reference } });
    expect(lead).toMatchObject({ status: "new", category: "branding_creative", utmSource: "newsletter", noticeVersion: "test-v1" });

    const outbox = await getDb().notificationOutbox.findMany({ where: { targetId: lead.id }, orderBy: { recipient: "asc" } });
    expect(outbox.map((row) => [row.template, row.recipient])).toEqual([
      ["lead_acknowledgement", "asha@example.com"],
      ["lead_internal_alert", "staff-one@example.com"],
      ["lead_internal_alert", "staff-two@example.com"],
    ]);
    expect(outbox.every((row) => row.status === "pending")).toBe(true);
  });

  it("returns the original reference on retry without creating duplicates", async () => {
    const key = randomUUID();
    const first = await submitInquiry(fields, key);
    const second = await submitInquiry(fields, key);
    expect(second).toEqual({ reference: first.reference, replayed: true });
    expect(await getDb().lead.count()).toBe(1);
    expect(await getDb().notificationOutbox.count()).toBe(3);
  });

  it("handles concurrent retries with the same key", async () => {
    const key = randomUUID();
    const results = await Promise.all([submitInquiry(fields, key), submitInquiry(fields, key), submitInquiry(fields, key)]);
    expect(new Set(results.map((r) => r.reference)).size).toBe(1);
    expect(await getDb().lead.count()).toBe(1);
  });

  it("rejects key reuse with different content", async () => {
    const key = randomUUID();
    await submitInquiry(fields, key);
    await expect(submitInquiry({ ...fields, description: "A completely different requirement text." }, key)).rejects.toBeInstanceOf(
      IdempotencyConflictError,
    );
    expect(await getDb().lead.count()).toBe(1);
  });

  it("allows several inquiries from the same email", async () => {
    await submitInquiry(fields, randomUUID());
    await submitInquiry({ ...fields, category: "cybersecurity", description: "Separate need: a security review." }, randomUUID());
    expect(await getDb().lead.count({ where: { email: "asha@example.com" } })).toBe(2);
  });
});

describe("submitPartnerApplication", () => {
  it("persists expertise selections with status new", async () => {
    const partner = partnerFieldsSchema.parse({
      contactName: "Bikash Rai",
      email: "bikash@example.com",
      providerType: "agency",
      expertise: ["digital_marketing", "branding_creative", "other"],
      capabilities: "Campaign planning, social media and brand design.",
    });
    const receipt = await submitPartnerApplication(partner, randomUUID());
    expect(receipt.reference).toMatch(/^BP-/);
    const stored = await getDb().partnerApplication.findUniqueOrThrow({ where: { publicRef: receipt.reference } });
    expect(stored.status).toBe("new");
    expect(stored.expertise).toEqual(["digital_marketing", "branding_creative", "other"]);
    expect(await getDb().notificationOutbox.count({ where: { targetId: stored.id } })).toBe(3);
  });
});
