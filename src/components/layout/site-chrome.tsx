import type { ReactNode } from "react";
import { AttributionCapture } from "@/components/layout/attribution-capture";
import { PreviewBanner } from "@/components/layout/preview-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/** Public page frame. Kept separate from the root layout so the 1b admin can use its own. */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PreviewBanner />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter />
      <AttributionCapture />
    </div>
  );
}
