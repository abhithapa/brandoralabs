import { getDb } from "@/server/db/client";

/** Empties every table between tests. Refuses to run unless the database name ends in _test. */
export async function resetDatabase(): Promise<void> {
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (!url.pathname.endsWith("_test")) {
    throw new Error(`Refusing to truncate non-test database ${url.pathname}`);
  }
  await getDb().$executeRawUnsafe(
    'TRUNCATE TABLE "leads", "partner_applications", "notification_outbox", "rate_limit_buckets"',
  );
}
