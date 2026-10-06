import type { ReactNode } from "react";
import { PageHeader } from "@/components/marketing/page-header";
import { Section } from "@/components/ui/section";

/** Frame for legal pages. While status is draft, the page says so plainly. */
export function LegalPage({ title, draft, children }: { title: string; draft: boolean; children: ReactNode }) {
  return (
    <>
      <PageHeader title={title} crumbs={[{ label: "Home", href: "/" }, { label: title }]} />
      <Section>
        <div className="prose-width space-y-5">
          {draft ? (
            <p role="note" className="rounded-panel border border-line-strong bg-surface-alt p-4">
              <strong>Draft.</strong> This page is a placeholder and has not been reviewed. The final text will be published once
              approved by Brandora Labs.
            </p>
          ) : null}
          {children}
        </div>
      </Section>
    </>
  );
}
