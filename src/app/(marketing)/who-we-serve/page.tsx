import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { AudienceGrid } from "@/components/marketing/audience-grid";
import { FinalCta } from "@/components/marketing/final-cta";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Who We Serve",
  description: "Startups, SMEs, growing companies, and enterprises and organisations — support matched to your stage.",
  alternates: { canonical: "/who-we-serve" },
};

export default function WhoWeServePage() {
  return (
    <>
      <PageHeader
        title="Who we serve"
        lede="What a business needs depends on its stage. We shape our support around where you are now and where you are heading."
        crumbs={[{ label: "Home", href: "/" }, { label: "Who We Serve" }]}
      />
      <Section>
        <AudienceGrid detailed headingLevel={2} />
      </Section>
      <FinalCta />
    </>
  );
}
