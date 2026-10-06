"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

/** Shown only after the server confirms the record is stored. Receives focus so screen readers announce it. */
export function SuccessPanel({ heading, reference, children, onReset, resetLabel }: { heading: string; reference: string; children: ReactNode; onReset: () => void; resetLabel: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="rounded-panel border-2 border-grow bg-grow-soft p-6 md:p-8" role="status">
      <h2 ref={ref} tabIndex={-1} className="heading-2 focus:outline-none">
        {heading}
      </h2>
      <p className="mt-4">
        Your reference is <strong className="font-mono text-lg tracking-wide">{reference}</strong>. Please quote it if you contact
        us about this.
      </p>
      <div className="mt-3 space-y-3">{children}</div>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
        <Link href="/how-we-work" className="text-link font-medium">
          Read how we work
        </Link>
        <button type="button" onClick={onReset} className="text-link font-medium">
          {resetLabel}
        </button>
      </div>
    </div>
  );
}
