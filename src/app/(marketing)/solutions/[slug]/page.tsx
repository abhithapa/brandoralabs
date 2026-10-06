import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSolution, solutions } from "@/content/solutions";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/config/site-url";
import { PageHeader } from "@/components/marketing/page-header";
import { JsonLd } from "@/components/marketing/json-ld";
import { LinkButton } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false; // unknown slugs return a real 404

export function generateStaticParams() {
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const solution = getSolution((await params).slug);
  if (!solution) return {};
  return {
    title: solution.title,
    description: solution.shortDescription,
    alternates: { canonical: `/solutions/${solution.slug}` },
    openGraph: { title: `${solution.title} | ${siteConfig.name}`, description: solution.shortDescription },
  };
}

export default async function SolutionPage({ params }: Props) {
  const solution = getSolution((await params).slug);
  if (!solution) notFound();

  const contactHref = `/contact?service=${solution.slug}`;
  const related = solution.related.map((slug) => getSolution(slug)).filter((item) => item !== undefined);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              name: solution.title,
              description: solution.shortDescription,
              serviceType: solution.title,
              provider: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
              url: absoluteUrl(`/solutions/${solution.slug}`),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
                { "@type": "ListItem", position: 2, name: "Solutions", item: absoluteUrl("/solutions") },
                { "@type": "ListItem", position: 3, name: solution.title, item: absoluteUrl(`/solutions/${solution.slug}`) },
              ],
            },
          ],
        }}
      />

      <PageHeader
        title={solution.title}
        lede={solution.overview}
        crumbs={[{ label: "Home", href: "/" }, { label: "Solutions", href: "/solutions" }, { label: solution.title }]}
      >
        <div className="mt-8">
          <LinkButton href={contactHref}>Talk to an expert about {solution.title.toLowerCase()}</LinkButton>
        </div>
      </PageHeader>

      <Section labelledBy="problems-heading">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 id="problems-heading" className="heading-2">
              Problems we help with
            </h2>
            <ul className="mt-6 space-y-3">
              {solution.problems.map((problem) => (
                <li key={problem} className="border-l-2 border-primary pl-4">
                  {problem}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="heading-2">Suitable for</h2>
            <ul className="mt-6 space-y-3">
              {solution.suitableFor.map((item) => (
                <li key={item} className="border-l-2 border-line-strong pl-4">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="alt" labelledBy="capabilities-heading">
        <h2 id="capabilities-heading" className="heading-2">
          What we can help with
        </h2>
        <p className="prose-width mt-4 text-ink-muted">
          These are areas of capability, not a fixed package. What is included in your engagement is agreed with you in a written
          proposal.
        </p>
        <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {solution.capabilities.map((capability) => (
            <li key={capability} className="flex gap-3">
              <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{capability}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="approach-heading">
        <div className="prose-width">
          <h2 id="approach-heading" className="heading-2">
            How we approach it
          </h2>
          <p className="lede mt-4">{solution.approach}</p>
          <p className="mt-4">
            Every engagement follows the same five steps: understand, analyze, connect, deliver and grow.{" "}
            <Link href="/how-we-work" className="text-link">
              See how we work
            </Link>
            .
          </p>
        </div>
      </Section>

      {solution.faqs.length > 0 ? (
        <Section tone="alt" labelledBy="faq-heading">
          <h2 id="faq-heading" className="heading-2">
            Questions
          </h2>
          <dl className="prose-width mt-8 divide-y divide-line">
            {solution.faqs.map((faq) => (
              <div key={faq.question} className="py-5">
                <dt className="heading-3">{faq.question}</dt>
                <dd className="mt-2 text-ink-muted">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section tone="alt" labelledBy="related-heading">
          <h2 id="related-heading" className="heading-2">
            Often combined with
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug} className="rounded-panel border border-line bg-surface p-6">
                <h3 className="heading-3">
                  <Link href={`/solutions/${item.slug}`} className="hover:text-primary hover:underline">
                    {item.title}
                  </Link>
                </h3>
                <p className="mt-2 text-ink-muted">{item.shortDescription}</p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section tone="deep" labelledBy="solution-cta-heading">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="prose-width">
            <h2 id="solution-cta-heading" className="heading-2">
              Discuss your {solution.title.toLowerCase()} needs
            </h2>
            <p className="mt-4 text-lg text-on-deep-muted">Tell us what you are trying to achieve. We will review it and get back to you.</p>
          </div>
          <LinkButton href={contactHref} variant="on-deep">
            Talk to an Expert
          </LinkButton>
        </div>
      </Section>
    </>
  );
}
