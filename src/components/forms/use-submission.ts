"use client";

import { useCallback, useRef, useState } from "react";
import type { z } from "zod";

type State =
  | { phase: "idle" }
  | { phase: "pending" }
  | { phase: "success"; reference: string }
  | { phase: "error"; message: string };

function newKey(): string {
  return crypto.randomUUID();
}

/**
 * Client submission lifecycle. One idempotency key per filled-in form: retries
 * after a network failure reuse it, so the server never records a duplicate.
 * A new key is issued only after a confirmed success or an explicit reset.
 */
export function useSubmission<F>(endpoint: string, schema: z.ZodType) {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const keyRef = useRef<string>("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);

  const focusSummary = () => requestAnimationFrame(() => summaryRef.current?.focus());

  const submit = useCallback(
    async (fields: F, extra: Record<string, unknown> = {}) => {
      if (inFlight.current) return; // guards double clicks
      const check = schema.safeParse(fields);
      if (!check.success) {
        const next: Record<string, string> = {};
        for (const issue of check.error.issues) {
          const key = issue.path.join(".");
          if (!(key in next)) next[key] = issue.message;
        }
        setErrors(next);
        setState({ phase: "idle" });
        focusSummary();
        return;
      }

      if (!keyRef.current) keyRef.current = newKey();
      inFlight.current = true;
      setErrors({});
      setState({ phase: "pending" });
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields, idempotencyKey: keyRef.current, ...extra }),
        });
        const body = (await response.json().catch(() => null)) as
          | { ok: true; data: { reference: string } }
          | { ok: false; error: { code: string; message: string; fields?: Record<string, string> } }
          | null;

        if (response.ok && body?.ok) {
          keyRef.current = "";
          setState({ phase: "success", reference: body.data.reference });
          return;
        }
        if (body && !body.ok && body.error.fields) {
          setErrors(body.error.fields);
          setState({ phase: "idle" });
          focusSummary();
          return;
        }
        setState({ phase: "error", message: body && !body.ok ? body.error.message : "Something went wrong. Your details are still here — try again." });
      } catch {
        setState({ phase: "error", message: "We couldn't reach the server. Check your connection; your details are still here, so you can try again." });
      } finally {
        inFlight.current = false;
      }
    },
    [endpoint, schema],
  );

  const reset = useCallback(() => {
    keyRef.current = "";
    setErrors({});
    setState({ phase: "idle" });
  }, []);

  const clearError = useCallback((key: string) => {
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  return { state, errors, submit, reset, clearError, summaryRef };
}
