export const primaryNav = [
  { label: "Solutions", href: "/solutions" },
  { label: "Who We Serve", href: "/who-we-serve" },
  { label: "How We Work", href: "/how-we-work" },
  { label: "Partners", href: "/partners" },
  { label: "About", href: "/about" },
] as const;

export const footerNav = {
  company: [
    { label: "About", href: "/about" },
    { label: "How We Work", href: "/how-we-work" },
    { label: "Who We Serve", href: "/who-we-serve" },
    { label: "Partners", href: "/partners" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
} as const;

export const primaryCta = { label: "Talk to an Expert", href: "/contact" } as const;
