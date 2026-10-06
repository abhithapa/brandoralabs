import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LegalPage } from "@/components/marketing/legal-draft";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" } };

/**
 * DRAFT outline only — describes what the site actually does so the owner can
 * review it. Final wording and retention periods must be supplied (decision D7).
 */
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy notice" draft={siteConfig.legal.privacyStatus !== "approved"}>
      <h2 className="heading-3">What we collect through this website</h2>
      <p>
        When you send a requirement or partnership application, we collect the details you enter: your name, email address,
        and optionally your company, phone number, budget and website. We also record which page you arrived on and, if
        present, the campaign link that brought you here. We do not set tracking cookies.
      </p>
      <h2 className="heading-3">Why we use it</h2>
      <p>To review your request and contact you about it by the method you chose.</p>
      <h2 className="heading-3">How long we keep it</h2>
      <p>Retention period to be confirmed.</p>
      <h2 className="heading-3">Abuse prevention</h2>
      <p>
        To prevent spam we count submissions per connection for a short period. We store a one-way code derived from your
        network address, not the address itself, and delete it when the period ends.
      </p>
      <h2 className="heading-3">Contact</h2>
      <p>Contact details for privacy questions to be confirmed.</p>
    </LegalPage>
  );
}
