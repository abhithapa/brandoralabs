import "server-only";

/** The same idempotency key was reused with different form content. */
export class IdempotencyConflictError extends Error {
  constructor() {
    super("idempotency_conflict");
  }
}

export function isUniqueViolation(error: unknown, field?: string): boolean {
  if (typeof error !== "object" || error === null || !("code" in error) || error.code !== "P2002") return false;
  if (!field) return true;
  const text = JSON.stringify((error as { meta?: unknown }).meta ?? {});
  return text.includes(field);
}
