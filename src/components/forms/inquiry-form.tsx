"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORY_LABELS, CONTACT_METHOD_LABELS, CONTACT_METHODS, INQUIRY_CATEGORIES, type ContactMethod, type InquiryCategory } from "@/features/categories";
import { inquiryFieldsSchema } from "@/features/inquiries/schema";
import { readAttribution } from "@/features/attribution/client";
import { Button } from "@/components/ui/button";
import { ErrorSummary, Honeypot, RadioGroup, SelectField, TextArea, TextField } from "@/components/forms/fields";
import { SuccessPanel } from "@/components/forms/success-panel";
import { useSubmission } from "@/components/forms/use-submission";

type Fields = {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  category: InquiryCategory | "";
  description: string;
  budget: string;
  contactMethod: ContactMethod;
};

const LABELS: Record<string, string> = {
  fullName: "Full name",
  company: "Company or organisation",
  email: "Email",
  phone: "Phone",
  category: "Service",
  description: "Your requirement",
  budget: "Estimated budget",
  contactMethod: "Preferred contact method",
};

const categoryOptions = INQUIRY_CATEGORIES.map((value) => ({ value, label: CATEGORY_LABELS[value] }));
const contactOptions = CONTACT_METHODS.map((value) => ({ value, label: CONTACT_METHOD_LABELS[value] }));

export function InquiryForm({ defaultCategory }: { defaultCategory?: InquiryCategory }) {
  const empty: Fields = {
    fullName: "",
    company: "",
    email: "",
    phone: "",
    category: defaultCategory ?? "",
    description: "",
    budget: "",
    contactMethod: "email",
  };
  const [fields, setFields] = useState<Fields>(empty);
  const [hp, setHp] = useState("");
  const { state, errors, submit, reset, clearError, summaryRef } = useSubmission<Fields>("/api/inquiries", inquiryFieldsSchema);

  const set = <K extends keyof Fields>(key: K) => (value: Fields[K]) => {
    setFields((current) => ({ ...current, [key]: value }));
    clearError(key);
  };

  if (state.phase === "success") {
    return (
      <SuccessPanel
        heading="We've received your requirement"
        reference={state.reference}
        resetLabel="Send another requirement"
        onReset={() => {
          setFields(empty);
          reset();
        }}
      >
        <p>
          {fields.contactMethod === "online_meeting"
            ? "Someone from our team will review it and email you to arrange a meeting time. No meeting is booked yet."
            : `Someone from our team will review it and contact you by ${CONTACT_METHOD_LABELS[fields.contactMethod].toLowerCase()}.`}
        </p>
        <p>A confirmation email with your reference is on its way to {fields.email}.</p>
      </SuccessPanel>
    );
  }

  const pending = state.phase === "pending";
  const phoneNeeded = fields.contactMethod === "phone" || fields.contactMethod === "whatsapp";

  return (
    <form
      noValidate
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        void submit(fields, { attribution: readAttribution(), hp });
      }}
      className="relative space-y-7"
    >
      <ErrorSummary errors={errors} labels={LABELS} summaryRef={summaryRef} />

      <div className="grid gap-7 md:grid-cols-2">
        <TextField id="fullName" label="Full name" value={fields.fullName} onChange={set("fullName")} error={errors.fullName} autoComplete="name" maxLength={120} />
        <TextField id="company" label="Company or organisation" optional value={fields.company} onChange={set("company")} error={errors.company} autoComplete="organization" maxLength={160} />
        <TextField id="email" label="Email" type="email" inputMode="email" value={fields.email} onChange={set("email")} error={errors.email} autoComplete="email" maxLength={254} />
        <TextField
          id="phone"
          label="Phone"
          type="tel"
          inputMode="tel"
          optional={!phoneNeeded}
          hint="Include your country code, for example +977."
          value={fields.phone}
          onChange={set("phone")}
          error={errors.phone}
          autoComplete="tel"
          maxLength={32}
        />
      </div>

      <div>
        <p className="mb-4 text-[0.9375rem] text-ink-muted">
          Want to offer your services as a partner?{" "}
          <Link href="/partners#apply" className="text-link">
            Use the partner form instead
          </Link>
          .
        </p>
        <SelectField
          id="category"
          label="Which service do you need?"
          hint="Choose “Not sure yet” if you'd like us to help work it out."
          placeholder="Choose a service"
          value={fields.category}
          onChange={set("category")}
          options={categoryOptions}
          error={errors.category}
        />
      </div>

      <TextArea
        id="description"
        label="Your requirement"
        hint="What are you trying to achieve, and what is getting in the way? At least 20 characters."
        value={fields.description}
        onChange={set("description")}
        error={errors.description}
        maxLength={5000}
      />

      <TextField
        id="budget"
        label="Estimated budget"
        optional
        hint="A rough range in any currency is fine."
        value={fields.budget}
        onChange={set("budget")}
        error={errors.budget}
        maxLength={120}
      />

      <RadioGroup
        id="contactMethod"
        label="How should we contact you?"
        hint={fields.contactMethod === "online_meeting" ? "We'll email you to arrange a time." : undefined}
        value={fields.contactMethod}
        onChange={set("contactMethod")}
        options={contactOptions}
        error={errors.contactMethod}
      />

      <Honeypot value={hp} onChange={setHp} />

      <p className="text-[0.9375rem] text-ink-muted">
        We use these details only to respond to your request. Read our{" "}
        <Link href="/privacy" className="text-link">
          privacy notice
        </Link>
        .
      </p>

      {state.phase === "error" ? (
        <p role="alert" className="rounded-panel border border-danger bg-danger-soft p-4 font-medium text-danger">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Sending…" : "Send requirement"}
      </Button>
      <p aria-live="polite" className="sr-only">
        {pending ? "Sending your requirement" : ""}
      </p>
    </form>
  );
}
