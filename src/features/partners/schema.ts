import { z } from "zod";
import { EXPERTISE_CATEGORIES, PROVIDER_TYPES } from "@/features/categories";
import {
  emailField,
  honeypotField,
  idempotencyKeyField,
  optionalPhone,
  optionalText,
  requiredText,
} from "@/features/validation";

/** http/https only. The server never fetches this URL. */
const websiteUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z
    .string()
    .trim()
    .max(2048, { error: "Website address must be 2,048 characters or fewer." })
    .pipe(z.url({ protocol: /^https?$/, error: "Enter a website address starting with https:// or http://." }))
    .optional(),
);

export const partnerFieldsSchema = z.object({
  contactName: requiredText("Contact name", 2, 120),
  email: emailField,
  organization: optionalText("Organisation", 160),
  phone: optionalPhone,
  providerType: z.enum(PROVIDER_TYPES, { error: "Choose the option that best describes you." }),
  expertise: z
    .array(z.enum(EXPERTISE_CATEGORIES), { error: "Choose at least one area of expertise." })
    .min(1, { error: "Choose at least one area of expertise." })
    .max(EXPERTISE_CATEGORIES.length)
    .transform((values) => [...new Set(values)]),
  websiteUrl,
  capabilities: requiredText("Description of your capabilities", 20, 5000),
});

export const partnerRequestSchema = z.object({
  fields: partnerFieldsSchema,
  idempotencyKey: idempotencyKeyField,
  hp: honeypotField,
});

export type PartnerFields = z.infer<typeof partnerFieldsSchema>;
export type PartnerRequest = z.infer<typeof partnerRequestSchema>;
