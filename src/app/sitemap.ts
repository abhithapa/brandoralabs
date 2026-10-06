import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site-url";
import { solutions } from "@/content/solutions";

const staticRoutes = ["/", "/solutions", "/who-we-serve", "/how-we-work", "/partners", "/about", "/contact", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticRoutes.map((path) => ({ url: absoluteUrl(path), changeFrequency: "monthly" as const, priority: path === "/" ? 1 : 0.7 })),
    ...solutions.map((solution) => ({ url: absoluteUrl(`/solutions/${solution.slug}`), changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
