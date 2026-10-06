import { getLaunchIssues } from "@/config/site";

/** Visible on every page while launch inputs are missing, so draft content is never mistaken for final. */
export function PreviewBanner() {
  const issues = getLaunchIssues();
  if (issues.length === 0) return null;
  return (
    <div role="note" className="bg-primary-soft text-ink">
      <p className="container-page py-2 text-sm">
        <strong className="font-semibold">Preview build.</strong> Some content and contact details are draft and awaiting approval.
      </p>
    </div>
  );
}
