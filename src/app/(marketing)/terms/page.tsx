import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LegalPage } from "@/components/marketing/legal-draft";

export const metadata: Metadata = { title: "Terms", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" draft={siteConfig.legal.termsStatus !== "approved"}>
      <p>The terms of use for this website will be published here once approved.</p>
      <p>
        Sending a requirement through this website is an inquiry. It does not create an agreement or a booking; any engagement is
        agreed separately in writing.
      </p>
    </LegalPage>
  );
}
