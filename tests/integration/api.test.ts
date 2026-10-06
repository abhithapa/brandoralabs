import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { POST as postInquiry } from "@/app/api/inquiries/route";
import { POST as postPartner } from "@/app/api/partner-applications/route";
import { GET as health } from "@/app/api/health/route";
import { disconnectDb, getDb } from "@/server/db/client";
import { resetDatabase } from "../support/db";

const ORIGIN = "https://brandora.test";

function request(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN, "x-forwarded-for": "203.0.113.7", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const fields = {
  fullName: "Asha Gurung",
  email: "asha@example.com",
  category: "ai_automation",
  description: "Automate invoice processing across two systems.",
  contactMethod: "email",
};

beforeEach(resetDatabase);
afterAll(disconnectDb);

describe("POST /api/inquiries", () => {
  it("returns 201 with only a public reference", async () => {
    const response = await postInquiry(request("/api/inquiries", { fields, idempotencyKey: randomUUID() }));
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(Object.keys(body.data)).toEqual(["reference"]);
    expect(body.data.reference).toMatch(/^BL-/);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("returns 200 with the same reference on retry", async () => {
    const payload = { fields, idempotencyKey: randomUUID() };
    const first = await (await postInquiry(request("/api/inquiries", payload))).json();
    const retry = await postInquiry(request("/api/inquiries", payload));
    expect(retry.status).toBe(200);
    expect((await retry.json()).data.reference).toBe(first.data.reference);
  });

  it("returns 409 when a key is reused with different content", async () => {
    const key = randomUUID();
    await postInquiry(request("/api/inquiries", { fields, idempotencyKey: key }));
    const response = await postInquiry(request("/api/inquiries", { fields: { ...fields, fullName: "Someone Else" }, idempotencyKey: key }));
    expect(response.status).toBe(409);
  });

  it("returns 422 with field errors and writes nothing", async () => {
    const response = await postInquiry(
      request("/api/inquiries", { fields: { ...fields, category: "free_money", contactMethod: "whatsapp" }, idempotencyKey: randomUUID() }),
    );
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(Object.keys(body.error.fields).sort()).toEqual(["category", "phone"]);
    expect(await getDb().lead.count()).toBe(0);
  });

  it("rejects cross-site and origin-less posts", async () => {
    expect((await postInquiry(request("/api/inquiries", { fields, idempotencyKey: randomUUID() }, { origin: "https://evil.example" }))).status).toBe(403);
    const noOrigin = new Request(`${ORIGIN}/api/inquiries`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    expect((await postInquiry(noOrigin)).status).toBe(403);
  });

  it("rejects oversized and non-JSON bodies", async () => {
    expect((await postInquiry(request("/api/inquiries", "x".repeat(40_000)))).status).toBe(413);
    expect((await postInquiry(request("/api/inquiries", "not json"))).status).toBe(400);
    expect((await postInquiry(request("/api/inquiries", "{}", { "content-type": "text/plain" }))).status).toBe(415);
  });

  it("rejects honeypot submissions without storing them", async () => {
    const response = await postInquiry(request("/api/inquiries", { fields, idempotencyKey: randomUUID(), hp: "http://spam" }));
    expect(response.status).toBe(400);
    expect(await getDb().lead.count()).toBe(0);
  });

  it("throttles after five submissions from one address, per address", async () => {
    for (let i = 0; i < 5; i += 1) {
      expect((await postInquiry(request("/api/inquiries", { fields, idempotencyKey: randomUUID() }))).status).toBe(201);
    }
    const limited = await postInquiry(request("/api/inquiries", { fields, idempotencyKey: randomUUID() }));
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0);

    const other = await postInquiry(request("/api/inquiries", { fields, idempotencyKey: randomUUID() }, { "x-forwarded-for": "198.51.100.9" }));
    expect(other.status).toBe(201);
  });

  it("uses the proxy-appended address, so spoofed X-Forwarded-For entries do not bypass the limit", async () => {
    for (let i = 0; i < 6; i += 1) {
      await postInquiry(request("/api/inquiries", { fields, idempotencyKey: randomUUID() }, { "x-forwarded-for": `10.0.0.${i}, 203.0.113.7` }));
    }
    expect(await getDb().lead.count()).toBe(5);
  });

  it("never stores raw IP addresses", async () => {
    await postInquiry(request("/api/inquiries", { fields, idempotencyKey: randomUUID() }));
    const rows = await getDb().rateLimitBucket.findMany();
    expect(rows).toHaveLength(1);
    expect(JSON.stringify(rows)).not.toContain("203.0.113.7");
  });
});

describe("POST /api/partner-applications", () => {
  it("stores an application and returns a reference", async () => {
    const response = await postPartner(
      request("/api/partner-applications", {
        fields: {
          contactName: "Bikash Rai",
          email: "bikash@example.com",
          providerType: "consultant",
          expertise: ["business_consulting"],
          websiteUrl: "https://example.com",
          capabilities: "Strategy consulting for small manufacturers.",
        },
        idempotencyKey: randomUUID(),
      }),
    );
    expect(response.status).toBe(201);
    expect((await response.json()).data.reference).toMatch(/^BP-/);
  });

  it("rejects javascript: URLs", async () => {
    const response = await postPartner(
      request("/api/partner-applications", {
        fields: { contactName: "X Y", email: "x@example.com", providerType: "other", expertise: ["other"], websiteUrl: "javascript:alert(1)", capabilities: "Twenty characters of text here." },
        idempotencyKey: randomUUID(),
      }),
    );
    expect(response.status).toBe(422);
  });
});

describe("GET /api/health", () => {
  it("returns a minimal liveness response", async () => {
    const response = health();
    expect(await response.json()).toEqual({ status: "ok" });
  });
});
