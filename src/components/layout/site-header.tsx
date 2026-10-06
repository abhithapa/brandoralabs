import Link from "next/link";
import { siteConfig } from "@/config/site";
import { SiteNav } from "@/components/layout/site-nav";
import { Wordmark } from "@/components/layout/wordmark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="container-page relative flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <Link href="/" className="shrink-0 rounded-control" aria-label={`${siteConfig.name} home`}>
          <Wordmark />
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
