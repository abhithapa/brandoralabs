import "server-only";
import type { PartnerFields } from "@/features/partners/schema";
import { getEnv } from "@/config/env";
import { getDb } from "@/server/db/client";
import { generatePublicRef, hashPayload } from "@/server/security/crypto";
import { partnerNotifications } from "@/server/notifications/outbox";
import { IdempotencyConflictError, isUniqueViolation } from "@/server/services/errors";
import type { SubmissionReceipt } from "@/server/services/inquiries";

/** Same guarantees as submitInquiry. Approval later is internal only — nothing is published. */
export async function submitPartnerApplication(fields: PartnerFields, idempotencyKey: string): Promise<SubmissionReceipt> {
  const db = getDb();
  const payloadHash = hashPayload(fields);

  const existing = await db.partnerApplication.findUnique({ where: { idempotencyKey }, select: { publicRef: true, payloadHash: true } });
  if (existing) return replay(existing, payloadHash);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const application = await db.$transaction(async (tx) => {
        const created = await tx.partnerApplication.create({
          data: {
            ...fields,
            publicRef: generatePublicRef("BP"),
            idempotencyKey,
            payloadHash,
            noticeVersion: getEnv().PRIVACY_NOTICE_VERSION,
          },
          select: { id: true, publicRef: true, email: true },
        });
        await tx.notificationOutbox.createMany({ data: partnerNotifications(created.id, created.email) });
        return created;
      });
      return { reference: application.publicRef, replayed: false };
    } catch (error) {
      if (isUniqueViolation(error, "idempotency_key") || isUniqueViolation(error, "idempotencyKey")) {
        const winner = await db.partnerApplication.findUnique({ where: { idempotencyKey }, select: { publicRef: true, payloadHash: true } });
        if (winner) return replay(winner, payloadHash);
      }
      if (isUniqueViolation(error, "public_ref") || isUniqueViolation(error, "publicRef")) continue;
      throw error;
    }
  }
  throw new Error("Could not allocate a unique public reference");
}

function replay(existing: { publicRef: string; payloadHash: string }, payloadHash: string): SubmissionReceipt {
  if (existing.payloadHash !== payloadHash) throw new IdempotencyConflictError();
  return { reference: existing.publicRef, replayed: true };
}
