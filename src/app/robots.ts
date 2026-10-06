import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site-url";

/**
 * Production allows indexing of public pages only. Any non-production deployment
 * (ALLOW_INDEXING unset) disallows everything — but staging must still be protected
 * by authentication; robots rules are not access control.
 */
export default function robots(): MetadataRoute.Robots {
  const allow = process.env.ALLOW_INDEXING === "true";
  return {
    rules: allow ? [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] }] : [{ userAgent: "*", disallow: "/" }],
    sitemap: allow ? absoluteUrl("/sitemap.xml") : undefined,
  };
}
