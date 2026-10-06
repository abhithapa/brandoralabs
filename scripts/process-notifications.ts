/**
 * Notification worker. Run on a schedule (e.g. every minute via EventBridge
 * Scheduler / cron) or continuously in development with `--watch`.
 *
 *   npm run notifications:process            # one pass, then exit
 *   npm run notifications:process -- --watch  # poll every 30s
 */
import "dotenv/config";
import { getEnv } from "@/config/env";
import { disconnectDb } from "@/server/db/client";
import { countFailedNotifications, processOutbox } from "@/server/notifications/outbox";
import { createTransport } from "@/server/notifications/transport";
import { purgeExpiredRateLimits } from "@/server/security/rate-limit";

async function runOnce() {
  const transport = createTransport(getEnv());
  const summary = await processOutbox(transport);
  const purged = await purgeExpiredRateLimits();
  const failedTotal = await countFailedNotifications();
  console.info(JSON.stringify({ event: "outbox.run", transport: transport.name, ...summary, purgedRateLimits: purged, failedTotal }));
  if (failedTotal > 0) {
    console.warn(JSON.stringify({ event: "outbox.failed_backlog", failedTotal, action: "Investigate rows with status=failed; see docs/deployment.md" }));
  }
}

async function main() {
  const watch = process.argv.includes("--watch");
  do {
    try {
      await runOnce();
    } catch (error) {
      console.error(JSON.stringify({ event: "outbox.run_error", error: error instanceof Error ? error.message : "unknown" }));
      if (!watch) process.exitCode = 1;
    }
    if (watch) await new Promise((resolve) => setTimeout(resolve, 30_000));
  } while (watch);
  await disconnectDb();
}

void main();
