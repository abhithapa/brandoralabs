import { describe, expect, it } from "vitest";
import { generatePublicRef, hashPayload } from "@/server/security/crypto";
import { backoffMs } from "@/server/notifications/outbox";
import { SOLUTION_SLUGS, categoryToSlug, slugToCategory, SERVICE_CATEGORIES } from "@/features/categories";
import { getSolution, solutions } from "@/content/solutions";
import { challenges } from "@/content/company";
import { audiences } from "@/content/audiences";
import { getLaunchIssues } from "@/config/site";

describe("public references", () => {
  it("have the expected shape and are not sequential", () => {
    const refs = new Set(Array.from({ length: 500 }, () => generatePublicRef()));
    expect(refs.size).toBe(500);
    for (const ref of refs) expect(ref).toMatch(/^BL-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{2}$/);
  });
});

describe("payload hashing", () => {
  it("ignores key order and undefined values", () => {
    expect(hashPayload({ a: 1, b: { c: 2, d: undefined } })).toBe(hashPayload({ b: { c: 2 }, a: 1 }));
    expect(hashPayload({ a: 1 })).not.toBe(hashPayload({ a: 2 }));
  });
});

describe("outbox backoff", () => {
  it("grows exponentially and caps at one hour", () => {
    expect(backoffMs(1)).toBe(60_000);
    expect(backoffMs(3)).toBe(4 * 60_000);
    expect(backoffMs(20)).toBe(60 * 60_000);
  });
});

describe("content model", () => {
  it("has exactly one page per solution slug", () => {
    expect(solutions.map((s) => s.slug).sort()).toEqual([...SOLUTION_SLUGS].sort());
  });

  it("maps slugs and categories both ways", () => {
    for (const category of SERVICE_CATEGORIES) expect(slugToCategory(categoryToSlug(category))).toBe(category);
    expect(slugToCategory("unknown")).toBeUndefined();
  });

  it("only links to existing solutions", () => {
    for (const s of solutions) for (const r of s.related) expect(getSolution(r)).toBeDefined();
    for (const c of challenges) expect(getSolution(c.solution)).toBeDefined();
  });

  it("has four audience segments", () => {
    expect(audiences).toHaveLength(4);
  });

  it("reports missing launch inputs while content is draft", () => {
    expect(getLaunchIssues().length).toBeGreaterThan(0);
  });
});

describe("environment validation", () => {
  it("refuses the log email transport only when APP_ENV is production", async () => {
    const { getEnv, resetEnvCache } = await import("@/config/env");
    const original = { ...process.env };
    try {
      Object.assign(process.env, { NODE_ENV: "production", APP_ENV: "staging", EMAIL_TRANSPORT: "log" });
      resetEnvCache();
      expect(() => getEnv()).not.toThrow();

      Object.assign(process.env, { APP_ENV: "production" });
      resetEnvCache();
      expect(() => getEnv()).toThrow(/EMAIL_TRANSPORT/);
    } finally {
      process.env = original;
      resetEnvCache();
    }
  });

  it("never prints secret values in configuration errors", async () => {
    const { getEnv, resetEnvCache } = await import("@/config/env");
    const original = { ...process.env };
    try {
      Object.assign(process.env, { RATE_LIMIT_SECRET: "short-secret-value" });
      resetEnvCache();
      expect(() => getEnv()).toThrow(/RATE_LIMIT_SECRET/);
      try {
        getEnv();
      } catch (error) {
        expect(String(error)).not.toContain("short-secret-value");
      }
    } finally {
      process.env = original;
      resetEnvCache();
    }
  });
});
