import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { about } from "@/content/company";
import { PageHeader } from "@/components/marketing/page-header";
import { Journey } from "@/components/marketing/journey";
import { FinalCta } from "@/components/marketing/final-cta";
import { Section, SectionIntro } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "About",
  description: siteConfig.positioning,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title={`About ${siteConfig.name}`}
        lede="Brandora Labs is a centralised business-solutions partner. We combine strategy, creativity, marketing, technology and trusted expertise, and help businesses reach the internal teams, technologies, specialists or partners their challenges need."
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <Section labelledBy="positioning-heading">
        <div className="prose-width">
          <h2 id="positioning-heading" className="heading-2">
            {siteConfig.positioning}
          </h2>
          <p className="lede mt-4">
            Instead of leaving you to find and manage separate providers, we start from the problem, decide what it needs and
            coordinate the people who deliver it.
          </p>
        </div>
      </Section>

      {about.vision || about.mission ? (
        <Section tone="alt">
          <div className="grid gap-10 md:grid-cols-2">
            {about.vision ? (
              <div>
                <h2 className="heading-2">Vision</h2>
                <p className="lede mt-4">{about.vision}</p>
              </div>
            ) : null}
            {about.mission ? (
              <div>
                <h2 className="heading-2">Mission</h2>
                <p className="lede mt-4">{about.mission}</p>
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {about.values.length > 0 ? (
        <Section labelledBy="values-heading">
          <SectionIntro id="values-heading" heading="Our values" />
          <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {about.values.map((value) => (
              <div key={value.title}>
                <dt className="heading-3">{value.title}</dt>
                <dd className="mt-2 text-ink-muted">{value.detail}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      <Section tone="alt" labelledBy="approach-heading">
        <SectionIntro id="approach-heading" heading="Our approach" />
        <Journey />
      </Section>

      <FinalCta />
    </>
  );
}
