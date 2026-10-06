/**
 * Canonical origin for metadata, sitemap and structured data. Read at build/render
 * time without requiring the full server environment (database etc.).
 */
export function getSiteUrl(): URL {
  const raw = process.env.SITE_URL ?? "http://localhost:3000";
  try {
    return new URL(raw);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export function absoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString();
}
