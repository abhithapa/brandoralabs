"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Catches rendering errors below the root layout. Never shows error details to visitors. */
export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(JSON.stringify({ event: "render_error", digest: error.digest }));
  }, [error]);

  return (
    <main id="main" className="container-page py-24">
      <div className="prose-width">
        <h1 className="heading-1">This page didn&apos;t load</h1>
        <p className="lede mt-5">Something went wrong on our side. Try again, or go back to the homepage.</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <button type="button" onClick={reset} className="rounded-control bg-primary px-5 py-2.5 font-semibold text-on-primary">
            Try again
          </button>
          <Link href="/" className="text-link self-center">
            Go to the homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
