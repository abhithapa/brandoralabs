import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/marketing/breadcrumbs";

export function PageHeader({ title, lede, crumbs, children }: { title: string; lede?: string; crumbs?: Crumb[]; children?: ReactNode }) {
  return (
    <div className="border-b border-line bg-surface">
      <div className="container-page py-12 md:py-16">
        {crumbs ? <Breadcrumbs items={crumbs} /> : null}
        <div className="prose-width">
          <h1 className="heading-1">{title}</h1>
          {lede ? <p className="lede mt-5">{lede}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
