import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { Journey } from "@/components/marketing/journey";
import { AdvantageList } from "@/components/marketing/advantage-list";
import { FinalCta } from "@/components/marketing/final-cta";
import { Section, SectionIntro } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "How We Work",
  description: "Understand, analyze, connect, deliver, grow — the five steps behind every Brandora Labs engagement.",
  alternates: { canonical: "/how-we-work" },
};

export default function HowWeWorkPage() {
  return (
    <>
      <PageHeader
        title="How we work"
        lede="Every engagement follows the same five steps, whether it is a single project or a long-term programme."
        crumbs={[{ label: "Home", href: "/" }, { label: "How We Work" }]}
      />
      <Section>
        <h2 className="sr-only">The five steps</h2>
        <Journey detailed />
      </Section>
      <Section tone="alt" labelledBy="advantage-heading">
        <SectionIntro id="advantage-heading" heading="What this means for you" />
        <AdvantageList />
      </Section>
      <FinalCta />
    </>
  );
}
