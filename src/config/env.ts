import "server-only";
import { z } from "zod";

const emailList = z
  .string()
  .default("")
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.email()));

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    /**
     * Deployment environment. Separate from NODE_ENV, which is always "production"
     * for built code — including local and CI runs of the production build.
     * Production-only safety rules key off this value.
     */
    APP_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),

    /** Canonical public origin, e.g. https://www.brandoralabs.com */
    SITE_URL: z.url(),
    DATABASE_URL: z.string().min(1),

    /** Secret used to HMAC client addresses for rate limiting. 32+ random characters. */
    RATE_LIMIT_SECRET: z.string().min(32),

    /** `log` writes emails to the server log (development only). `smtp` sends them. */
    EMAIL_TRANSPORT: z.enum(["log", "smtp"]).default("log"),
    EMAIL_FROM: z.string().min(3).default("Brandora Labs <no-reply@localhost>"),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),

    /** Comma-separated staff addresses that receive every new lead and partner application. */
    LEAD_NOTIFICATION_RECIPIENTS: emailList,

    /**
     * Number of reverse proxies in front of the app that append to X-Forwarded-For
     * (e.g. 1 for a single load balancer). Used to pick the real client address.
     */
    TRUSTED_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(1),

    BUSINESS_TIMEZONE: z.string().default("Asia/Kathmandu"),
    PRIVACY_NOTICE_VERSION: z.string().min(1).max(40).default("draft-2026-10"),
  })
  .superRefine((env, ctx) => {
    if (env.EMAIL_TRANSPORT === "smtp" && !env.SMTP_HOST) {
      ctx.addIssue({ code: "custom", path: ["SMTP_HOST"], message: "Required when EMAIL_TRANSPORT=smtp" });
    }
    if (env.APP_ENV === "production" && env.EMAIL_TRANSPORT === "log") {
      ctx.addIssue({ code: "custom", path: ["EMAIL_TRANSPORT"], message: "`log` transport is not allowed in production" });
    }
    if (env.APP_ENV === "production" && env.LEAD_NOTIFICATION_RECIPIENTS.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["LEAD_NOTIFICATION_RECIPIENTS"],
        message: "At least one recipient is required in production; staff work from these emails until the admin ships",
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/**
 * Validated server environment. Called from instrumentation.ts at startup so a
 * misconfigured deployment fails immediately rather than on the first submission.
 * Error output names keys only, never values.
 */
export function getEnv(): Env {
  if (cached) return cached;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }
  cached = result.data;
  return cached;
}

/** Test helper: forget the cached environment after changing process.env. */
export function resetEnvCache(): void {
  cached = undefined;
}
