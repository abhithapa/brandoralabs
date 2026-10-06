import { journey } from "@/content/company";
import { cn } from "@/lib/cn";

/**
 * The five-step journey — the site's signature element. A real sequence, so
 * the steps are numbered. Horizontal path from `lg`, vertical below. "Grow" is
 * the only element that uses the grow colour.
 */
export function Journey({ detailed = false, headingLevel = 3 }: { detailed?: boolean; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <ol className="relative grid gap-0 lg:grid-cols-5 lg:gap-4">
      {journey.map((step, index) => {
        const last = index === journey.length - 1;
        return (
          <li key={step.name} className="relative flex gap-4 pb-8 last:pb-0 lg:flex-col lg:gap-5 lg:pb-0">
            {/* connector */}
            {!last ? (
              <span
                aria-hidden="true"
                className="absolute left-[1.1875rem] top-11 bottom-0 w-px bg-line-strong lg:left-11 lg:right-[-1rem] lg:top-[1.1875rem] lg:bottom-auto lg:h-px lg:w-auto"
              />
            ) : null}
            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 text-[0.9375rem] font-bold",
                last ? "border-grow bg-grow text-white" : "border-primary bg-surface text-primary",
              )}
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <Heading className={cn("heading-3", last && "text-grow")}>
                <span className="sr-only">Step {index + 1}: </span>
                {step.name}
              </Heading>
              <p className="mt-1 font-medium text-ink">{step.summary}</p>
              {detailed ? <p className="mt-2 text-ink-muted">{step.detail}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
