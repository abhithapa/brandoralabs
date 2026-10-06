import Link from "next/link";
import { hero, partnerNetwork } from "@/content/company";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/config/site-url";
import { LinkButton } from "@/components/ui/button";
import { Section, SectionIntro } from "@/components/ui/section";
import { Journey } from "@/components/marketing/journey";
import { ChallengeList } from "@/components/marketing/challenge-list";
import { SolutionIndex } from "@/components/marketing/solution-index";
import { AdvantageList } from "@/components/marketing/advantage-list";
import { AudienceGrid } from "@/components/marketing/audience-grid";
import { FinalCta } from "@/components/marketing/final-cta";
import { JsonLd } from "@/components/marketing/json-ld";

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteConfig.name,
          slogan: siteConfig.tagline,
          description: siteConfig.positioning,
          url: absoluteUrl("/"),
        }}
      />

      {/* Hero */}
      <section aria-labelledby="hero-heading" className="bg-surface">
        <div className="container-page pb-16 pt-14 md:pb-24 md:pt-20">
          <p className="text-[0.9375rem] font-semibold text-primary">{siteConfig.tagline}</p>
          <div className="prose-width mt-4">
            <h1 id="hero-heading" className="heading-1">
              {hero.heading}
            </h1>
            <p className="lede mt-6">{hero.body}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href={hero.primaryCta.href}>{hero.primaryCta.label}</LinkButton>
            <LinkButton href={hero.secondaryCta.href} variant="secondary">
              {hero.secondaryCta.label}
            </LinkButton>
          </div>

          <div className="mt-16 rounded-panel border border-line bg-surface-alt p-6 md:mt-20 md:p-10">
            <h2 className="mb-8 text-[0.9375rem] font-semibold text-ink-muted">How every engagement runs</h2>
            <Journey />
          </div>
        </div>
      </section>

      <Section tone="alt" labelledBy="challenges-heading">
        <SectionIntro
          id="challenges-heading"
          heading="What are you trying to do?"
          body="Start with the outcome you need. Each one leads to the kind of help that fits."
        />
        <ChallengeList />
        <p className="mt-6 text-ink-muted">
          Something else, or not sure where it fits?{" "}
          <Link href="/contact?service=not-sure" className="text-link">
            Describe your challenge
          </Link>
          .
        </p>
      </Section>

      <Section labelledBy="solutions-heading">
        <SectionIntro
          id="solutions-heading"
          heading="Our solutions"
          body="Eight areas of expertise, combined as your business needs them."
        />
        <SolutionIndex />
      </Section>

      <Section tone="alt" labelledBy="advantage-heading">
        <SectionIntro id="advantage-heading" heading="Why work with Brandora" />
        <AdvantageList />
      </Section>

      <Section labelledBy="audiences-heading">
        <SectionIntro id="audiences-heading" heading="Who we serve" body="We work with businesses at every stage." />
        <AudienceGrid />
      </Section>

      <Section tone="alt" labelledBy="partners-heading">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="prose-width">
            <h2 id="partners-heading" className="heading-2">
              {partnerNetwork.heading}
            </h2>
            <p className="lede mt-4">{partnerNetwork.body}</p>
          </div>
          <LinkButton href="/partners#apply" variant="secondary">
            {partnerNetwork.ctaLabel}
          </LinkButton>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
