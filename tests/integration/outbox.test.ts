import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { disconnectDb, getDb } from "@/server/db/client";
import { processOutbox } from "@/server/notifications/outbox";
import { submitInquiry } from "@/server/services/inquiries";
import { inquiryFieldsSchema } from "@/features/inquiries/schema";
import { FakeTransport } from "../support/fake-transport";
import { resetDatabase } from "../support/db";

const fields = inquiryFieldsSchema.parse({
  fullName: "Asha Gurung",
  email: "asha@example.com",
  category: "not_sure",
  description: "Not sure where to start with our online presence.",
  contactMethod: "online_meeting",
});

async function makeAllDue() {
  await getDb().notificationOutbox.updateMany({ data: { nextAttemptAt: new Date(Date.now() - 1000) } });
}

beforeEach(resetDatabase);
afterAll(disconnectDb);

describe("processOutbox", () => {
  it("sends acknowledgement and staff alerts, then marks them sent", async () => {
    const { reference } = await submitInquiry(fields, randomUUID());
    const transport = new FakeTransport();

    const summary = await processOutbox(transport);
    expect(summary).toMatchObject({ claimed: 3, sent: 3, failed: 0 });

    const ack = transport.sent.find((m) => m.to === "asha@example.com");
    expect(ack?.subject).toContain(reference);
    expect(ack?.text).toContain("received");
    expect(ack?.text).toContain("no meeting is booked yet");
    expect(ack?.text).not.toMatch(/\b(accepted|assigned|confirmed)\b/i);

    const alert = transport.sent.find((m) => m.to === "staff-one@example.com");
    expect(alert?.text).toContain("Not sure where to start");

    expect(await getDb().notificationOutbox.count({ where: { status: "sent" } })).toBe(3);
    expect((await processOutbox(transport)).claimed).toBe(0); // nothing re-sent
  });

  it("keeps the lead and retries when email delivery fails", async () => {
    await submitInquiry(fields, randomUUID());
    const transport = new FakeTransport();
    transport.failWith = "smtp_ECONNECTION";

    const summary = await processOutbox(transport);
    expect(summary).toMatchObject({ claimed: 3, sent: 0, retrying: 3 });
    expect(await getDb().lead.count()).toBe(1);

    const row = await getDb().notificationOutbox.findFirstOrThrow();
    expect(row).toMatchObject({ status: "pending", attempts: 1, lastErrorCode: "smtp_ECONNECTION" });
    expect(row.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());

    // Not due yet: nothing claimed.
    expect((await processOutbox(transport)).claimed).toBe(0);

    // Provider recovers.
    transport.failWith = null;
    await makeAllDue();
    expect((await processOutbox(transport)).sent).toBe(3);
  });

  it("marks rows failed once retries are exhausted", async () => {
    await submitInquiry(fields, randomUUID());
    const transport = new FakeTransport();
    transport.failWith = "smtp_EAUTH";
    for (let i = 0; i < 3; i += 1) {
      await makeAllDue();
      await processOutbox(transport, { maxAttempts: 3 });
    }
    expect(await getDb().notificationOutbox.count({ where: { status: "failed", attempts: 3 } })).toBe(3);
    await makeAllDue();
    expect((await processOutbox(transport, { maxAttempts: 3 })).claimed).toBe(0);
  });

  it("reclaims rows left in sending by a crashed worker", async () => {
    await submitInquiry(fields, randomUUID());
    await getDb().notificationOutbox.updateMany({ data: { status: "sending", lockedUntil: new Date(Date.now() - 1000), attempts: 1 } });
    const summary = await processOutbox(new FakeTransport());
    expect(summary.sent).toBe(3);
  });

  it("fails permanently when the target record is missing", async () => {
    await getDb().notificationOutbox.create({
      data: { targetType: "lead", targetId: randomUUID(), template: "lead_acknowledgement", recipient: "x@example.com" },
    });
    const summary = await processOutbox(new FakeTransport());
    expect(summary.failed).toBe(1);
    expect((await getDb().notificationOutbox.findFirstOrThrow()).lastErrorCode).toBe("target_missing");
  });

  it("does not let two workers send the same row", async () => {
    await submitInquiry(fields, randomUUID());
    const a = new FakeTransport();
    const b = new FakeTransport();
    await Promise.all([processOutbox(a), processOutbox(b)]);
    expect(a.sent.length + b.sent.length).toBe(3);
  });
});
