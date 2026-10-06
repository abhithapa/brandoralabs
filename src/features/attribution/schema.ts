import { z } from "zod";

const text = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional(),
  );

/** Path within this site, e.g. /solutions/cybersecurity. Query strings are dropped. */
const sitePath = z.preprocess(
  (value) => {
    if (typeof value !== "string" || !value.startsWith("/")) return undefined;
    return value.split(/[?#]/)[0];
  },
  z.string().max(300).optional(),
);

/** Hostname only — never the full referring URL. */
const domain = z.preprocess(
  (value) => (typeof value === "string" && /^[a-z0-9.-]{1,253}$/i.test(value) ? value.toLowerCase() : undefined),
  z.string().optional(),
);

/**
 * First-touch marketing attribution. Untrusted, optional and length-bounded;
 * invalid values are dropped rather than rejecting the submission.
 */
export const attributionSchema = z
  .object({
    utmSource: text(200),
    utmMedium: text(200),
    utmCampaign: text(200),
    utmTerm: text(200),
    utmContent: text(200),
    landingPath: sitePath,
    referrerDomain: domain,
    submittedFromPath: sitePath,
  })
  .partial()
  .catch({});

export type Attribution = z.infer<typeof attributionSchema>;
