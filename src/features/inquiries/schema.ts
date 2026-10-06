import { z } from "zod";
import { CONTACT_METHODS, INQUIRY_CATEGORIES } from "@/features/categories";
import { attributionSchema } from "@/features/attribution/schema";
import {
  emailField,
  honeypotField,
  idempotencyKeyField,
  optionalPhone,
  optionalText,
  requiredText,
} from "@/features/validation";

/** Fields the visitor fills in. Shared by the browser form and the server. */
export const inquiryFieldsSchema = z
  .object({
    fullName: requiredText("Full name", 2, 120),
    company: optionalText("Company or organisation", 160),
    email: emailField,
    phone: optionalPhone,
    category: z.enum(INQUIRY_CATEGORIES, { error: "Choose the service you need, or “Not sure yet”." }),
    description: requiredText("Requirement description", 20, 5000),
    budget: optionalText("Estimated budget", 120),
    contactMethod: z.enum(CONTACT_METHODS).default("email"),
  })
  // `when` makes these run even if unrelated fields are invalid, so every error shows at once.
  .refine((value) => value.contactMethod !== "phone" || Boolean(value.phone), {
    path: ["phone"],
    message: "Enter your phone number so we can call you.",
    when: phoneRuleApplies,
  })
  .refine((value) => value.contactMethod !== "whatsapp" || Boolean(value.phone), {
    path: ["phone"],
    message: "Enter your WhatsApp number so we can contact you there.",
    when: phoneRuleApplies,
  });

function phoneRuleApplies(payload: { issues: readonly { path?: readonly PropertyKey[] }[] }): boolean {
  return !payload.issues.some((issue) => issue.path?.[0] === "phone" || issue.path?.[0] === "contactMethod");
}

/** Full request body accepted by POST /api/inquiries. */
export const inquiryRequestSchema = z.object({
  fields: inquiryFieldsSchema,
  idempotencyKey: idempotencyKeyField,
  attribution: attributionSchema.optional(),
  hp: honeypotField,
});

export type InquiryFields = z.infer<typeof inquiryFieldsSchema>;
export type InquiryRequest = z.infer<typeof inquiryRequestSchema>;
