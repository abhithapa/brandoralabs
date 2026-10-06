import { partnerRequestSchema } from "@/features/partners/schema";
import { createSubmissionHandler } from "@/server/submission-handler";
import { RATE_LIMITS } from "@/server/security/rate-limit";
import { submitPartnerApplication } from "@/server/services/partners";

export const runtime = "nodejs";

export const POST = createSubmissionHandler({
  schema: partnerRequestSchema,
  rateLimit: RATE_LIMITS.partnerApplication,
  submit: ({ fields, idempotencyKey }) => submitPartnerApplication(fields, idempotencyKey),
  logEvent: "partner_application_submitted",
});
