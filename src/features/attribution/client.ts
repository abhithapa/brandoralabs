import type { Attribution } from "@/features/attribution/schema";

const KEY = "bl.first_touch";

/** Stores first-touch attribution once per browser session. Fails silently if storage is unavailable. */
export function captureFirstTouch(): void {
  try {
    if (window.sessionStorage.getItem(KEY)) return;
    const params = new URLSearchParams(window.location.search);
    let referrerDomain: string | undefined;
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host !== window.location.hostname) referrerDomain = host;
    }
    const data: Attribution = {
      utmSource: params.get("utm_source") ?? undefined,
      utmMedium: params.get("utm_medium") ?? undefined,
      utmCampaign: params.get("utm_campaign") ?? undefined,
      utmTerm: params.get("utm_term") ?? undefined,
      utmContent: params.get("utm_content") ?? undefined,
      landingPath: window.location.pathname,
      referrerDomain,
    };
    window.sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage blocked or referrer unparsable: attribution is optional.
  }
}

export function readAttribution(): Attribution {
  let stored: Attribution = {};
  try {
    stored = JSON.parse(window.sessionStorage.getItem(KEY) ?? "{}") as Attribution;
  } catch {
    stored = {};
  }
  return { ...stored, submittedFromPath: window.location.pathname };
}
