import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "@/components/layout/site-chrome";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <SiteChrome>
      <div className="container-page py-24">
        <div className="prose-width">
          <h1 className="heading-1">We couldn&apos;t find that page</h1>
          <p className="lede mt-5">The link may be out of date, or the address may have a typo.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/solutions">Browse solutions</LinkButton>
            <LinkButton href="/contact" variant="secondary">
              Talk to an Expert
            </LinkButton>
          </div>
          <p className="mt-8">
            <Link href="/" className="text-link">
              Go to the homepage
            </Link>
          </p>
        </div>
      </div>
    </SiteChrome>
  );
}
