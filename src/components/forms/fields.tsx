"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const control =
  "mt-2 block w-full rounded-control border bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-ink-muted/70 focus-visible:border-primary";

function describedBy(id: string, hint?: string, error?: string) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

function Label({ htmlFor, label, optional }: { htmlFor: string; label: string; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block font-semibold">
      {label}
      {optional ? <span className="ml-1.5 font-normal text-ink-muted">(optional)</span> : null}
    </label>
  );
}

function Hint({ id, children }: { id: string; children?: ReactNode }) {
  return children ? (
    <p id={`${id}-hint`} className="mt-1 text-[0.9375rem] text-ink-muted">
      {children}
    </p>
  ) : null;
}

function FieldError({ id, error }: { id: string; error?: string }) {
  return error ? (
    <p id={`${id}-error`} className="mt-2 text-[0.9375rem] font-medium text-danger">
      <span className="sr-only">Error: </span>
      {error}
    </p>
  ) : null;
}

type Base = { id: string; label: string; error?: string; hint?: ReactNode; optional?: boolean };

export function TextField({
  id,
  label,
  error,
  hint,
  optional,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  maxLength,
}: Base & {
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "url";
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "url";
  maxLength?: number;
}) {
  return (
    <div>
      <Label htmlFor={id} label={label} optional={optional} />
      <Hint id={id}>{hint}</Hint>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint ? "y" : undefined, error)}
        className={cn(control, error ? "border-danger" : "border-line-strong")}
      />
      <FieldError id={id} error={error} />
    </div>
  );
}

export function TextArea({
  id,
  label,
  error,
  hint,
  optional,
  value,
  onChange,
  maxLength,
  rows = 6,
}: Base & { value: string; onChange: (value: string) => void; maxLength: number; rows?: number }) {
  return (
    <div>
      <Label htmlFor={id} label={label} optional={optional} />
      <Hint id={id}>{hint}</Hint>
      <textarea
        id={id}
        name={id}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint ? "y" : undefined, error)}
        className={cn(control, "resize-y", error ? "border-danger" : "border-line-strong")}
      />
      <p className="mt-1 text-right text-sm text-ink-muted" aria-live="off">
        {value.length.toLocaleString()} / {maxLength.toLocaleString()}
      </p>
      <FieldError id={id} error={error} />
    </div>
  );
}

export function SelectField<T extends string>({
  id,
  label,
  error,
  hint,
  value,
  onChange,
  options,
  placeholder,
}: Base & { value: T | ""; onChange: (value: T) => void; options: readonly { value: T; label: string }[]; placeholder: string }) {
  return (
    <div>
      <Label htmlFor={id} label={label} />
      <Hint id={id}>{hint}</Hint>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint ? "y" : undefined, error)}
        className={cn(control, "appearance-auto", error ? "border-danger" : "border-line-strong")}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError id={id} error={error} />
    </div>
  );
}

export function RadioGroup<T extends string>({
  id,
  label,
  error,
  hint,
  value,
  onChange,
  options,
}: Base & { value: T; onChange: (value: T) => void; options: readonly { value: T; label: string }[] }) {
  return (
    <fieldset id={id} aria-describedby={describedBy(id, hint ? "y" : undefined, error)}>
      <legend className="font-semibold">{label}</legend>
      <Hint id={id}>{hint}</Hint>
      <div className="mt-3 flex flex-wrap gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-control border px-4 py-2",
              value === option.value ? "border-primary bg-primary-soft" : "border-line-strong",
            )}
          >
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="size-4 accent-[var(--bl-primary)]"
            />
            {option.label}
          </label>
        ))}
      </div>
      <FieldError id={id} error={error} />
    </fieldset>
  );
}

export function CheckboxGroup<T extends string>({
  id,
  label,
  error,
  hint,
  values,
  onChange,
  options,
}: Base & { values: T[]; onChange: (values: T[]) => void; options: readonly { value: T; label: string }[] }) {
  const toggle = (option: T) =>
    onChange(values.includes(option) ? values.filter((item) => item !== option) : [...values, option]);
  return (
    <fieldset id={id} aria-describedby={describedBy(id, hint ? "y" : undefined, error)}>
      <legend className="font-semibold">{label}</legend>
      <Hint id={id}>{hint}</Hint>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option.value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-control px-1 py-1.5">
            <input
              type="checkbox"
              name={id}
              value={option.value}
              checked={values.includes(option.value)}
              onChange={() => toggle(option.value)}
              className="size-5 accent-[var(--bl-primary)]"
            />
            {option.label}
          </label>
        ))}
      </div>
      <FieldError id={id} error={error} />
    </fieldset>
  );
}

/** Hidden from people and assistive technology; bots that fill every field reveal themselves. */
export function Honeypot({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
      <label htmlFor="hp_reference">Leave this field empty</label>
      <input id="hp_reference" name="hp_reference" tabIndex={-1} autoComplete="off" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

export function ErrorSummary({
  errors,
  labels,
  summaryRef,
}: {
  errors: Record<string, string>;
  labels: Record<string, string>;
  summaryRef: React.RefObject<HTMLDivElement | null>;
}) {
  const entries = Object.entries(errors).filter(([key]) => key !== "form");
  if (entries.length === 0) return null;
  return (
    <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-panel border-2 border-danger bg-danger-soft p-5">
      <h2 className="heading-3 text-danger">
        {entries.length === 1 ? "There is a problem with 1 field" : `There are problems with ${entries.length} fields`}
      </h2>
      <ul className="mt-3 list-disc space-y-1 pl-5">
        {entries.map(([key, message]) => (
          <li key={key}>
            <a href={`#${key}`} className="font-medium text-danger underline">
              {labels[key] ? `${labels[key]}: ` : ""}
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
