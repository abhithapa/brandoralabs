import "server-only";
import type { NotificationOutbox, Prisma } from "@/generated/prisma/client";
import { getEnv } from "@/config/env";
import { getDb } from "@/server/db/client";
import { EmailDeliveryError, type EmailTransport } from "@/server/notifications/transport";
import {
  leadAcknowledgement,
  leadInternalAlert,
  partnerAcknowledgement,
  partnerInternalAlert,
} from "@/server/notifications/templates";

export const MAX_ATTEMPTS = 6;
const LOCK_MINUTES = 5;

type OutboxInsert = Prisma.NotificationOutboxCreateManyInput;

/** Outbox rows for a new lead: one acknowledgement plus one alert per staff recipient. */
export function leadNotifications(leadId: string, visitorEmail: string): OutboxInsert[] {
  return [
    { targetType: "lead", targetId: leadId, template: "lead_acknowledgement", recipient: visitorEmail },
    ...getEnv().LEAD_NOTIFICATION_RECIPIENTS.map((recipient) => ({
      targetType: "lead" as const,
      targetId: leadId,
      template: "lead_internal_alert" as const,
      recipient,
    })),
  ];
}

export function partnerNotifications(applicationId: string, applicantEmail: string): OutboxInsert[] {
  return [
    {
      targetType: "partner_application",
      targetId: applicationId,
      template: "partner_acknowledgement",
      recipient: applicantEmail,
    },
    ...getEnv().LEAD_NOTIFICATION_RECIPIENTS.map((recipient) => ({
      targetType: "partner_application" as const,
      targetId: applicationId,
      template: "partner_internal_alert" as const,
      recipient,
    })),
  ];
}

/** Exponential backoff: 1, 2, 4, 8, 16 minutes… capped at 1 hour. */
export function backoffMs(attempts: number): number {
  return Math.min(60, 2 ** Math.max(0, attempts - 1)) * 60_000;
}

/**
 * Claims due rows with SKIP LOCKED so several workers can run safely. Rows left
 * in `sending` by a crashed worker are reclaimed once their lock expires, so
 * delivery is at-least-once; the stable Message-ID lets mail systems spot repeats.
 */
async function claimBatch(batchSize: number): Promise<NotificationOutbox[]> {
  const ids = await getDb().$queryRaw<{ id: string }[]>`
    UPDATE "notification_outbox"
    SET "status" = 'sending',
        "locked_until" = now() + (${LOCK_MINUTES} * interval '1 minute'),
        "attempts" = "attempts" + 1
    WHERE "id" IN (
      SELECT "id" FROM "notification_outbox"
      WHERE ("status" = 'pending' AND "next_attempt_at" <= now())
         OR ("status" = 'sending' AND "locked_until" < now())
      ORDER BY "next_attempt_at"
      LIMIT ${batchSize}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING "id"
  `;
  if (ids.length === 0) return [];
  return getDb().notificationOutbox.findMany({ where: { id: { in: ids.map((row) => row.id) } } });
}

async function render(row: NotificationOutbox): Promise<{ subject: string; text: string } | null> {
  const timeZone = getEnv().BUSINESS_TIMEZONE;
  if (row.targetType === "lead") {
    const lead = await getDb().lead.findUnique({ where: { id: row.targetId } });
    if (!lead) return null;
    return row.template === "lead_acknowledgement" ? leadAcknowledgement(lead) : leadInternalAlert(lead, timeZone);
  }
  const application = await getDb().partnerApplication.findUnique({ where: { id: row.targetId } });
  if (!application) return null;
  return row.template === "partner_acknowledgement"
    ? partnerAcknowledgement(application)
    : partnerInternalAlert(application, timeZone);
}

export type OutboxRunSummary = { claimed: number; sent: number; retrying: number; failed: number };

export async function processOutbox(
  transport: EmailTransport,
  options: { batchSize?: number; maxAttempts?: number } = {},
): Promise<OutboxRunSummary> {
  const batchSize = options.batchSize ?? 25;
  const maxAttempts = options.maxAttempts ?? MAX_ATTEMPTS;
  const summary: OutboxRunSummary = { claimed: 0, sent: 0, retrying: 0, failed: 0 };
  const db = getDb();

  const rows = await claimBatch(batchSize);
  summary.claimed = rows.length;

  for (const row of rows) {
    try {
      const message = await render(row);
      if (!message) throw new EmailDeliveryError("target_missing");
      await transport.send({ to: row.recipient, ...message, idempotencyKey: row.id });
      await db.notificationOutbox.update({
        where: { id: row.id },
        data: { status: "sent", sentAt: new Date(), lockedUntil: null, lastErrorCode: null },
      });
      summary.sent += 1;
    } catch (error) {
      const code = error instanceof EmailDeliveryError ? error.code : `unexpected_${error instanceof Error ? error.name : "error"}`.slice(0, 64);
      const permanent = code === "target_missing" || !(error instanceof EmailDeliveryError); // rendering bugs won't fix themselves
      const exhausted = permanent || row.attempts >= maxAttempts;
      await db.notificationOutbox.update({
        where: { id: row.id },
        data: {
          status: exhausted ? "failed" : "pending",
          lockedUntil: null,
          lastErrorCode: code,
          nextAttemptAt: new Date(Date.now() + backoffMs(row.attempts)),
        },
      });
      if (exhausted) summary.failed += 1;
      else summary.retrying += 1;
      console.error(JSON.stringify({ event: "outbox.delivery_failed", outboxId: row.id, attempts: row.attempts, code, exhausted }));
    }
  }
  return summary;
}

/** Rows whose retries are exhausted. Surfaced to staff (admin view in 1b; worker log + count in 1a). */
export async function countFailedNotifications(): Promise<number> {
  return getDb().notificationOutbox.count({ where: { status: "failed" } });
}
