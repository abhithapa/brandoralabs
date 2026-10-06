import "server-only";
import type { InquiryFields } from "@/features/inquiries/schema";
import type { Attribution } from "@/features/attribution/schema";
import { getEnv } from "@/config/env";
import { getDb } from "@/server/db/client";
import { generatePublicRef, hashPayload } from "@/server/security/crypto";
import { leadNotifications } from "@/server/notifications/outbox";
import { IdempotencyConflictError, isUniqueViolation } from "@/server/services/errors";

export type SubmissionReceipt = { reference: string; replayed: boolean };

/**
 * Persists a lead and its notification rows in one transaction, so an email
 * problem can never lose an inquiry. Retrying with the same idempotency key and
 * the same content returns the original reference; reusing the key with
 * different content is rejected. The same email may submit many inquiries.
 */
export async function submitInquiry(
  fields: InquiryFields,
  idempotencyKey: string,
  attribution: Attribution = {},
): Promise<SubmissionReceipt> {
  const db = getDb();
  const payloadHash = hashPayload(fields);

  const existing = await db.lead.findUnique({ where: { idempotencyKey }, select: { publicRef: true, payloadHash: true } });
  if (existing) return replay(existing, payloadHash);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const lead = await db.$transaction(async (tx) => {
        const created = await tx.lead.create({
          data: {
            ...fields,
            ...attribution,
            publicRef: generatePublicRef(),
            idempotencyKey,
            payloadHash,
            noticeVersion: getEnv().PRIVACY_NOTICE_VERSION,
          },
          select: { id: true, publicRef: true, email: true },
        });
        await tx.notificationOutbox.createMany({ data: leadNotifications(created.id, created.email) });
        return created;
      });
      return { reference: lead.publicRef, replayed: false };
    } catch (error) {
      if (isUniqueViolation(error, "idempotency_key") || isUniqueViolation(error, "idempotencyKey")) {
        // A concurrent request with the same key won the race.
        const winner = await db.lead.findUnique({ where: { idempotencyKey }, select: { publicRef: true, payloadHash: true } });
        if (winner) return replay(winner, payloadHash);
      }
      if (isUniqueViolation(error, "public_ref") || isUniqueViolation(error, "publicRef")) continue; // astronomically rare
      throw error;
    }
  }
  throw new Error("Could not allocate a unique public reference");
}

function replay(existing: { publicRef: string; payloadHash: string }, payloadHash: string): SubmissionReceipt {
  if (existing.payloadHash !== payloadHash) throw new IdempotencyConflictError();
  return { reference: existing.publicRef, replayed: true };
}
