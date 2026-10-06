"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { primaryCta, primaryNav } from "@/config/navigation";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Primary navigation. Desktop: inline links. Mobile: disclosure menu that
 * closes on Escape (returning focus to the toggle), on navigation, and when
 * the viewport widens past the breakpoint.
 */
export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Close when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const media = window.matchMedia("(min-width: 1024px)");
    const onWide = () => media.matches && close(false);
    document.addEventListener("keydown", onKey);
    media.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      media.removeEventListener("change", onWide);
    };
  }, [open, close]);

  return (
    <>
      <nav aria-label="Main" className="hidden lg:block">
        <ul className="flex items-center gap-1">
          {primaryNav.map((item) => {
            const current = isCurrent(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "rounded-control px-3 py-2 text-[0.9375rem] font-medium text-ink-muted hover:text-ink",
                    current && "text-ink underline decoration-primary decoration-2 underline-offset-8",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-3">
        <Link href={primaryCta.href} className={buttonClasses("primary", "hidden sm:inline-flex")}>
          {primaryCta.label}
        </Link>
        <button
          ref={toggleRef}
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-line-strong px-3 text-[0.9375rem] font-medium lg:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => (open ? close(false) : setOpen(true))}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <div
        id={menuId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-surface shadow-raised lg:hidden"
      >
        <nav aria-label="Main" className="container-page py-4">
          <ul className="flex flex-col">
            {primaryNav.map((item, index) => {
              const current = isCurrent(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    ref={index === 0 ? firstLinkRef : undefined}
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={cn("block rounded-control px-2 py-3 text-lg font-medium", current ? "text-primary" : "text-ink")}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href={primaryCta.href} className={buttonClasses("primary", "mt-4 w-full sm:hidden")}>
            {primaryCta.label}
          </Link>
        </nav>
      </div>
    </>
  );
}
