import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "plain" | "alt" | "deep";

const tones: Record<Tone, string> = {
  plain: "bg-surface",
  alt: "bg-surface-alt",
  deep: "bg-surface-deep text-on-deep on-deep",
};

/** Page section with alternating neutral backgrounds. Pass `labelledBy` when the section has a heading. */
export function Section({
  tone = "plain",
  labelledBy,
  className,
  children,
}: {
  tone?: Tone;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={labelledBy} className={cn(tones[tone], "py-16 md:py-24", className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionIntro({ id, heading, body, className }: { id: string; heading: string; body?: string; className?: string }) {
  return (
    <div className={cn("prose-width mb-10 md:mb-12", className)}>
      <h2 id={id} className="heading-2">
        {heading}
      </h2>
      {body ? <p className="lede mt-4">{body}</p> : null}
    </div>
  );
}
