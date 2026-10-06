import "server-only";
import type { z } from "zod";
import { fail, fieldErrors, ok } from "@/server/http";
import { RequestRejected, assertSameOrigin, getClientAddress, readJsonBody } from "@/server/security/request";
import { consumeRateLimit, type RateLimitRule } from "@/server/security/rate-limit";
import { getChallengeVerifier } from "@/server/security/challenge";
import { IdempotencyConflictError } from "@/server/services/errors";
import type { SubmissionReceipt } from "@/server/services/inquiries";

type Options<S extends z.ZodType<{ hp?: string | undefined }>> = {
  schema: S;
  rateLimit: RateLimitRule;
  submit: (input: z.infer<S>) => Promise<SubmissionReceipt>;
  logEvent: string;
};

/**
 * Shared flow for public submissions:
 * origin check → size-bounded JSON → rate limit → validation → honeypot → persist → receipt.
 * Success (201) is only returned after the database transaction commits.
 */
export function createSubmissionHandler<S extends z.ZodType<{ hp?: string | undefined }>>(options: Options<S>) {
  return async function POST(request: Request): Promise<Response> {
    try {
      assertSameOrigin(request);
      const body = await readJsonBody(request);
      const clientAddress = getClientAddress(request);

      const limit = await consumeRateLimit(options.rateLimit, clientAddress);
      if (!limit.allowed) {
        return fail(429, "rate_limited", "Too many submissions from your connection. Wait a few minutes and try again.", {
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        });
      }

      // Honeypot is checked before full validation so bots get no field-level hints.
      if (typeof body === "object" && body !== null && "hp" in body && typeof body.hp === "string" && body.hp.length > 0) {
        return fail(400, "rejected", "The submission could not be processed.");
      }

      const parsed = options.schema.safeParse(body);
      if (!parsed.success) {
        return fail(422, "validation_failed", "Some fields need attention.", { fields: fieldErrors(parsed.error) });
      }

      const token = typeof body === "object" && body !== null && "challenge" in body ? String(body.challenge) : undefined;
      if (!(await getChallengeVerifier().verify(token, clientAddress))) {
        return fail(400, "challenge_failed", "We could not confirm the submission came from a person. Reload the page and try again.");
      }

      const receipt = await options.submit(parsed.data);
      console.info(JSON.stringify({ event: options.logEvent, reference: receipt.reference, replayed: receipt.replayed }));
      return ok({ reference: receipt.reference }, receipt.replayed ? 200 : 201);
    } catch (error) {
      if (error instanceof RequestRejected) return fail(error.status, error.code, error.message);
      if (error instanceof IdempotencyConflictError) {
        return fail(409, "idempotency_conflict", "This form was already submitted with different details. Reload the page to start a new request.");
      }
      console.error(JSON.stringify({ event: `${options.logEvent}_error`, error: error instanceof Error ? error.name : "unknown" }));
      return fail(500, "server_error", "We couldn't save your submission. Nothing was sent — please try again in a moment.");
    }
  };
}
