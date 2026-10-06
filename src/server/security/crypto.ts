import "server-only";
import { createHash, createHmac, randomBytes } from "node:crypto";

/** Crockford base32 without I, L, O, U — unambiguous when read over the phone. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * Non-sequential public reference such as `BL-7K2M-9QXD-4F`.
 * 50 bits of randomness: not guessable, not enumerable.
 */
export function generatePublicRef(prefix = "BL"): string {
  const bytes = randomBytes(10);
  let chars = "";
  for (const byte of bytes) chars += ALPHABET[byte % 32];
  return `${prefix}-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 10)}`;
}

/** Stable hash of a value, independent of object key order. */
export function hashPayload(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function canonicalJson(value: unknown): string {
  if (value === undefined) return "null";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
}

export function hmacHex(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}
