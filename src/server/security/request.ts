import "server-only";
import { getEnv } from "@/config/env";

export const MAX_BODY_BYTES = 32 * 1024;

export class RequestRejected extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Rejects cross-site form posts. Browsers always send Origin on POST fetches;
 * a missing Origin is treated as a non-browser client and rejected too.
 */
export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  const allowed = new URL(getEnv().SITE_URL).origin;
  const requestOrigin = new URL(request.url).origin;
  if (!origin || (origin !== allowed && origin !== requestOrigin)) {
    throw new RequestRejected(403, "forbidden_origin", "This form can only be submitted from the Brandora Labs website.");
  }
}

/** Reads and parses a JSON body with a hard size limit. */
export async function readJsonBody(request: Request, maxBytes = MAX_BODY_BYTES): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new RequestRejected(415, "unsupported_media_type", "Send the form as JSON.");
  }
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxBytes) {
    throw new RequestRejected(413, "payload_too_large", "The submission is too large.");
  }
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > maxBytes) {
    throw new RequestRejected(413, "payload_too_large", "The submission is too large.");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new RequestRejected(400, "invalid_json", "The submission could not be read.");
  }
}

/**
 * Client address for throttling only. With N trusted proxies, the client is the
 * Nth entry from the right of X-Forwarded-For; anything further left is
 * client-supplied and could be forged.
 */
export function getClientAddress(request: Request): string {
  const hops = getEnv().TRUSTED_PROXY_HOPS;
  const forwarded = request.headers.get("x-forwarded-for");
  if (hops > 0 && forwarded) {
    const chain = forwarded.split(",").map((part) => part.trim()).filter(Boolean);
    const candidate = chain[chain.length - hops];
    if (candidate) return candidate;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
