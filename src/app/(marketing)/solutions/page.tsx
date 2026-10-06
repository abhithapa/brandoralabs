import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { SolutionIndex } from "@/components/marketing/solution-index";
import { FinalCta } from "@/components/marketing/final-cta";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Solutions",
  description: "Business consulting, marketing, branding, software, AI, cloud, cybersecurity and digital transformation — coordinated by one partner.",
  alternates: { canonical: "/solutions" },
};

export default function SolutionsPage() {
  return (
    <>
      <PageHeader
        title="Solutions"
        lede="Most challenges touch more than one area. Explore what each covers, or tell us the problem and we will work out the right mix."
        crumbs={[{ label: "Home", href: "/" }, { label: "Solutions" }]}
      />
      <Section>
        <h2 className="sr-only">All solutions</h2>
        <SolutionIndex />
      </Section>
      <FinalCta href="/contact?service=not-sure" />
    </>
  );
}
