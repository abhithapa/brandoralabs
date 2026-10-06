import { z } from "zod";

/** Required single-line text: NFC-normalised, trimmed, length-bounded. */
export function requiredText(label: string, min: number, max: number) {
  return z
    .string({ error: `Enter your ${label.toLowerCase()}.` })
    .normalize("NFC")
    .trim()
    .min(min, { error: min <= 1 ? `Enter your ${label.toLowerCase()}.` : `${label} must be at least ${min} characters.` })
    .max(max, { error: `${label} must be ${max} characters or fewer.` });
}

/** Optional text: empty strings become undefined so they are stored as NULL. */
export function optionalText(label: string, max: number) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z
      .string()
      .normalize("NFC")
      .trim()
      .max(max, { error: `${label} must be ${max} characters or fewer.` })
      .optional(),
  );
}

export const emailField = z
  .string({ error: "Enter your email address." })
  .trim()
  .toLowerCase()
  .min(1, { error: "Enter your email address." })
  .max(254, { error: "Email address must be 254 characters or fewer." })
  .pipe(z.email({ error: "Enter an email address in the format name@example.com." }));

/**
 * International phone numbers: digits with optional leading +, spaces, dots,
 * dashes and brackets. 7–15 digits (E.164 maximum is 15).
 */
export const PHONE_PATTERN = /^\+?[0-9 ().-]+$/;

export function isValidPhone(value: string): boolean {
  if (!PHONE_PATTERN.test(value)) return false;
  const digits = value.replace(/\D/g, "").length;
  return digits >= 7 && digits <= 15;
}

export const optionalPhone = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z
    .string()
    .trim()
    .max(32, { error: "Phone number must be 32 characters or fewer." })
    .refine(isValidPhone, { error: "Enter a phone number with country code, for example +977 98XXXXXXXX." })
    .optional(),
);

/** Client-generated key that makes a submission safe to retry. */
export const idempotencyKeyField = z.uuid({ error: "Missing submission key. Reload the page and try again." });

/** Honeypot: must be empty. Real visitors never see this field. */
export const honeypotField = z.string().max(0).optional();
