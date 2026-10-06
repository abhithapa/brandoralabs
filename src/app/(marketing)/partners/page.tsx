import type { Metadata } from "next";
import { partnerNetwork } from "@/content/company";
import { PageHeader } from "@/components/marketing/page-header";
import { PartnerForm } from "@/components/forms/partner-form";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Partners",
  description: "How Brandora Labs works with specialist partners — and how to apply to join the network.",
  alternates: { canonical: "/partners" },
};

const steps = [
  { title: "You apply", detail: "Tell us who you are and what you do well." },
  { title: "We review", detail: "Our team reviews each application individually." },
  { title: "We get in touch", detail: "If there's a fit, we contact you to discuss how we could work together." },
];

export default function PartnersPage() {
  return (
    <>
      <PageHeader title="Partners" lede={partnerNetwork.body} crumbs={[{ label: "Home", href: "/" }, { label: "Partners" }]} />

      <Section labelledBy="who-heading">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="prose-width">
            <h2 id="who-heading" className="heading-2">
              Who we partner with
            </h2>
            <p className="lede mt-4">
              Independent professionals, consultants, developers, agencies, technology providers and specialised service
              providers whose expertise complements our own.
            </p>
          </div>
          <div>
            <h2 className="heading-2">How it works</h2>
            <ol className="mt-6 space-y-5">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-primary text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="heading-3">{step.title}</h3>
                    <p className="mt-1 text-ink-muted">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Section tone="alt" labelledBy="apply-heading">
        <div id="apply" className="mx-auto max-w-3xl rounded-panel border border-line bg-surface p-5 sm:p-8">
          <h2 id="apply-heading" className="heading-2 mb-8">
            Apply to become a partner
          </h2>
          <PartnerForm />
        </div>
      </Section>
    </>
  );
}
