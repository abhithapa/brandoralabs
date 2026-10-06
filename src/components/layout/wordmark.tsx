import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * PROVISIONAL text wordmark. When the real logo is supplied, set
 * `siteConfig.logo.src` and render the image here — no other component changes.
 */
export function Wordmark({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={cn("flex items-baseline gap-1.5 text-[1.1875rem] font-bold tracking-tight", inverted ? "text-on-deep" : "text-ink")}>
      <span aria-hidden="true" className={cn("inline-block size-2.5 translate-y-[-1px] rounded-[3px]", inverted ? "bg-on-deep" : "bg-primary")} />
      {siteConfig.name}
    </span>
  );
}
