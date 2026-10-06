import { finalCta } from "@/content/company";
import { LinkButton } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export function FinalCta({ href = "/contact" }: { href?: string }) {
  return (
    <Section tone="deep" labelledBy="final-cta-heading">
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div className="prose-width">
          <h2 id="final-cta-heading" className="heading-2">
            {finalCta.heading}
          </h2>
          <p className="mt-4 text-lg text-on-deep-muted">{finalCta.body}</p>
        </div>
        <LinkButton href={href} variant="on-deep">
          {finalCta.ctaLabel}
        </LinkButton>
      </div>
    </Section>
  );
}
