import "server-only";
import { getEnv } from "@/config/env";
import { getDb } from "@/server/db/client";
import { hmacHex } from "@/server/security/crypto";

export type RateLimitRule = { scope: string; limit: number; windowSeconds: number };

export const RATE_LIMITS = {
  inquiry: { scope: "inquiry", limit: 5, windowSeconds: 600 },
  partnerApplication: { scope: "partner", limit: 3, windowSeconds: 600 },
} satisfies Record<string, RateLimitRule>;

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

/**
 * Fixed-window counter stored in PostgreSQL, so every app instance shares it.
 * One atomic upsert per request: the window resets when it has expired.
 * Only an HMAC of the address is stored, and rows expire with their window.
 */
export async function consumeRateLimit(rule: RateLimitRule, clientAddress: string): Promise<RateLimitResult> {
  const key = hmacHex(getEnv().RATE_LIMIT_SECRET, `${rule.scope}:${clientAddress}`);
  const windowMs = rule.windowSeconds * 1000;

  const rows = await getDb().$queryRaw<{ count: number; window_start: Date }[]>`
    INSERT INTO "rate_limit_buckets" ("key", "window_start", "count", "expires_at")
    VALUES (${key}, now(), 1, now() + (${windowMs} * interval '1 millisecond'))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "rate_limit_buckets"."expires_at" <= now() THEN 1 ELSE "rate_limit_buckets"."count" + 1 END,
      "window_start" = CASE WHEN "rate_limit_buckets"."expires_at" <= now() THEN now() ELSE "rate_limit_buckets"."window_start" END,
      "expires_at" = CASE WHEN "rate_limit_buckets"."expires_at" <= now()
        THEN now() + (${windowMs} * interval '1 millisecond') ELSE "rate_limit_buckets"."expires_at" END
    RETURNING "count", "window_start"
  `;

  const row = rows[0];
  if (!row) return { allowed: true, retryAfterSeconds: 0 };
  const elapsed = Date.now() - new Date(row.window_start).getTime();
  const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - elapsed) / 1000));
  return { allowed: row.count <= rule.limit, retryAfterSeconds };
}

export async function purgeExpiredRateLimits(): Promise<number> {
  const result = await getDb().rateLimitBucket.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return result.count;
}
