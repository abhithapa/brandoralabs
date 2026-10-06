import Link from "next/link";
import { footerNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { solutions } from "@/content/solutions";
import { Wordmark } from "@/components/layout/wordmark";

export function SiteFooter() {
  const { contact } = siteConfig;
  const year = new Date().getFullYear();
  return (
    <footer className="on-deep bg-surface-deep text-on-deep">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Wordmark inverted />
          <p className="mt-3 text-on-deep-muted">{siteConfig.tagline}</p>
          <dl className="mt-6 space-y-2 text-[0.9375rem] text-on-deep-muted">
            {contact.email ? (
              <div>
                <dt className="sr-only">Email</dt>
                <dd>
                  <a className="hover:text-on-deep" href={`mailto:${contact.email}`}>
                    {contact.email}
                  </a>
                </dd>
              </div>
            ) : null}
            {contact.phone ? (
              <div>
                <dt className="sr-only">Phone</dt>
                <dd>
                  <a className="hover:text-on-deep" href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                    {contact.phone}
                  </a>
                </dd>
              </div>
            ) : null}
            {contact.address ? (
              <div>
                <dt className="sr-only">Address</dt>
                <dd>{contact.address}</dd>
              </div>
            ) : null}
            <div>
              <dt className="sr-only">Hours</dt>
              <dd>
                {contact.hours.text}
                {contact.hours.confirmed ? null : <span className="block text-sm">({contact.hours.timezoneLabel})</span>}
              </dd>
            </div>
          </dl>
        </div>

        <FooterList heading="Solutions" items={solutions.map((s) => ({ label: s.title, href: `/solutions/${s.slug}` }))} />
        <FooterList heading="Company" items={footerNav.company} />
        <div>
          <FooterList heading="Legal" items={footerNav.legal} />
          {siteConfig.social.length > 0 ? (
            <div className="mt-8">
              <FooterList heading="Follow" items={siteConfig.social.map((s) => ({ label: s.label, href: s.href }))} external />
            </div>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-page py-5 text-sm text-on-deep-muted">
          © {year} {siteConfig.legalEntityName ?? siteConfig.name}
        </p>
      </div>
    </footer>
  );
}

function FooterList({ heading, items, external = false }: { heading: string; items: readonly { label: string; href: string }[]; external?: boolean }) {
  return (
    <nav aria-label={heading}>
      <h2 className="text-sm font-semibold text-on-deep">{heading}</h2>
      <ul className="mt-3 space-y-2 text-[0.9375rem]">
        {items.map((item) => (
          <li key={item.href}>
            {external ? (
              <a href={item.href} rel="noopener noreferrer" className="text-on-deep-muted hover:text-on-deep">
                {item.label}
              </a>
            ) : (
              <Link href={item.href} className="text-on-deep-muted hover:text-on-deep">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
