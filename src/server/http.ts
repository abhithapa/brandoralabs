import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";

/** Consistent JSON envelopes. Error bodies never include stack traces or database detail. */
export type ApiSuccess<T> = { ok: true; data: T };
export type ApiError = { ok: false; error: { code: string; message: string; fields?: Record<string, string> } };

export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ ok: true, data }, { status, headers: { "Cache-Control": "no-store" } });
}

export function fail(
  status: number,
  code: string,
  message: string,
  extra: { fields?: Record<string, string>; headers?: Record<string, string> } = {},
): NextResponse<ApiError> {
  return NextResponse.json(
    { ok: false, error: { code, message, ...(extra.fields ? { fields: extra.fields } : {}) } },
    { status, headers: { "Cache-Control": "no-store", ...extra.headers } },
  );
}

/** First message per field, keyed by dotted path relative to `fields`. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path[0] === "fields" ? issue.path.slice(1) : issue.path;
    const key = path.join(".") || "form";
    if (!(key in result)) result[key] = issue.message;
  }
  return result;
}
