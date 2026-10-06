import { inquiryRequestSchema } from "@/features/inquiries/schema";
import { createSubmissionHandler } from "@/server/submission-handler";
import { RATE_LIMITS } from "@/server/security/rate-limit";
import { submitInquiry } from "@/server/services/inquiries";

export const runtime = "nodejs";

export const POST = createSubmissionHandler({
  schema: inquiryRequestSchema,
  rateLimit: RATE_LIMITS.inquiry,
  submit: ({ fields, idempotencyKey, attribution }) => submitInquiry(fields, idempotencyKey, attribution),
  logEvent: "inquiry_submitted",
});
