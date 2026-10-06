"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORY_LABELS, EXPERTISE_CATEGORIES, PROVIDER_TYPE_LABELS, PROVIDER_TYPES, type ExpertiseCategory, type ProviderType } from "@/features/categories";
import { partnerFieldsSchema } from "@/features/partners/schema";
import { Button } from "@/components/ui/button";
import { CheckboxGroup, ErrorSummary, Honeypot, SelectField, TextArea, TextField } from "@/components/forms/fields";
import { SuccessPanel } from "@/components/forms/success-panel";
import { useSubmission } from "@/components/forms/use-submission";

type Fields = {
  contactName: string;
  email: string;
  organization: string;
  phone: string;
  providerType: ProviderType | "";
  expertise: ExpertiseCategory[];
  websiteUrl: string;
  capabilities: string;
};

const LABELS: Record<string, string> = {
  contactName: "Your name",
  email: "Email",
  organization: "Organisation",
  phone: "Phone",
  providerType: "What describes you best",
  expertise: "Areas of expertise",
  websiteUrl: "Website",
  capabilities: "Your capabilities",
};

const empty: Fields = { contactName: "", email: "", organization: "", phone: "", providerType: "", expertise: [], websiteUrl: "", capabilities: "" };

export function PartnerForm() {
  const [fields, setFields] = useState<Fields>(empty);
  const [hp, setHp] = useState("");
  const { state, errors, submit, reset, clearError, summaryRef } = useSubmission<Fields>("/api/partner-applications", partnerFieldsSchema);

  const set = <K extends keyof Fields>(key: K) => (value: Fields[K]) => {
    setFields((current) => ({ ...current, [key]: value }));
    clearError(key);
  };

  if (state.phase === "success") {
    return (
      <SuccessPanel
        heading="We've received your application"
        reference={state.reference}
        resetLabel="Send another application"
        onReset={() => {
          setFields(empty);
          reset();
        }}
      >
        <p>Our team will review it. A confirmation email is on its way to {fields.email}.</p>
      </SuccessPanel>
    );
  }

  const pending = state.phase === "pending";

  return (
    <form
      noValidate
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        void submit(fields, { hp });
      }}
      className="relative space-y-7"
    >
      <ErrorSummary errors={errors} labels={LABELS} summaryRef={summaryRef} />

      <div className="grid gap-7 md:grid-cols-2">
        <TextField id="contactName" label="Your name" value={fields.contactName} onChange={set("contactName")} error={errors.contactName} autoComplete="name" maxLength={120} />
        <TextField id="email" label="Email" type="email" inputMode="email" value={fields.email} onChange={set("email")} error={errors.email} autoComplete="email" maxLength={254} />
        <TextField id="organization" label="Organisation" optional value={fields.organization} onChange={set("organization")} error={errors.organization} autoComplete="organization" maxLength={160} />
        <TextField id="phone" label="Phone" optional type="tel" inputMode="tel" hint="Include your country code." value={fields.phone} onChange={set("phone")} error={errors.phone} autoComplete="tel" maxLength={32} />
      </div>

      <SelectField
        id="providerType"
        label="What describes you best?"
        placeholder="Choose one"
        value={fields.providerType}
        onChange={set("providerType")}
        options={PROVIDER_TYPES.map((value) => ({ value, label: PROVIDER_TYPE_LABELS[value] }))}
        error={errors.providerType}
      />

      <CheckboxGroup
        id="expertise"
        label="Areas of expertise"
        hint="Choose all that apply."
        values={fields.expertise}
        onChange={set("expertise")}
        options={EXPERTISE_CATEGORIES.map((value) => ({ value, label: CATEGORY_LABELS[value] }))}
        error={errors.expertise}
      />

      <TextField id="websiteUrl" label="Website" optional type="url" inputMode="url" hint="Starting with https://" value={fields.websiteUrl} onChange={set("websiteUrl")} error={errors.websiteUrl} autoComplete="url" maxLength={2048} />

      <TextArea
        id="capabilities"
        label="Your capabilities"
        hint="What services do you offer, and what kind of work do you do best? At least 20 characters."
        value={fields.capabilities}
        onChange={set("capabilities")}
        error={errors.capabilities}
        maxLength={5000}
      />

      <Honeypot value={hp} onChange={setHp} />

      <p className="text-[0.9375rem] text-ink-muted">
        We use these details only to review your application. Read our{" "}
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
        {pending ? "Sending…" : "Send application"}
      </Button>
    </form>
  );
}
