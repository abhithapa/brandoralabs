import type { Metadata } from "next";
import { slugToCategory, type InquiryCategory } from "@/features/categories";
import { siteConfig } from "@/config/site";
import { PageHeader } from "@/components/marketing/page-header";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Talk to an Expert",
  description: "Describe your business challenge and the Brandora Labs team will review it and get back to you.",
  alternates: { canonical: "/contact" },
};

type Props = { searchParams: Promise<{ service?: string | string[] }> };

function preselect(value: string | string[] | undefined): InquiryCategory | undefined {
  const slug = Array.isArray(value) ? value[0] : value;
  if (slug === "not-sure") return "not_sure";
  return slugToCategory(slug);
}

export default async function ContactPage({ searchParams }: Props) {
  const defaultCategory = preselect((await searchParams).service);
  const { contact } = siteConfig;

  return (
    <>
      <PageHeader
        title="Talk to an Expert"
        lede="Tell us what you're trying to achieve. You don't need to know which service you need — we'll review your requirement and get back to you."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <Section tone="alt">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="rounded-panel border border-line bg-surface p-5 sm:p-8">
            <h2 className="heading-2 mb-8">Your requirement</h2>
            <InquiryForm defaultCategory={defaultCategory} />
          </div>
          <aside aria-labelledby="contact-details-heading" className="space-y-6">
            <h2 id="contact-details-heading" className="heading-3">
              Other ways to reach us
            </h2>
            <dl className="space-y-4">
              {contact.email ? (
                <div>
                  <dt className="font-semibold">Email</dt>
                  <dd>
                    <a className="text-link" href={`mailto:${contact.email}`}>
                      {contact.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {contact.phone ? (
                <div>
                  <dt className="font-semibold">Phone</dt>
                  <dd>{contact.phone}</dd>
                </div>
              ) : null}
              <div>
                <dt className="font-semibold">Hours</dt>
                <dd className="text-ink-muted">
                  {contact.hours.text}
                  {contact.hours.confirmed ? null : <span className="block text-sm">{contact.hours.timezoneLabel}</span>}
                </dd>
              </div>
            </dl>
            {!contact.email && !contact.phone ? (
              <p className="text-[0.9375rem] text-ink-muted">Direct email and phone details will be published here once confirmed.</p>
            ) : null}
          </aside>
        </div>
      </Section>
    </>
  );
}
