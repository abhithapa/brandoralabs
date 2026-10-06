// Deterministic test environment. Integration tests need an isolated database:
// set TEST_DATABASE_URL (never point it at development or production data).
Object.assign(process.env, {
  NODE_ENV: "test",
  APP_ENV: "test",
  SITE_URL: "https://brandora.test",
  DATABASE_URL: process.env.TEST_DATABASE_URL ?? "postgresql://postgres@127.0.0.1:5432/brandora_test",
  RATE_LIMIT_SECRET: "test-secret-test-secret-test-secret-0000",
  EMAIL_TRANSPORT: "log",
  LEAD_NOTIFICATION_RECIPIENTS: "staff-one@example.com,staff-two@example.com",
  TRUSTED_PROXY_HOPS: "1",
  PRIVACY_NOTICE_VERSION: "test-v1",
});
