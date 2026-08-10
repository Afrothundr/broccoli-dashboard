import { logEnvConfigStatus } from "@/server/instrumentation/envLogger";

/**
 * This won't work unless you host this as an actual server,
 * which is highly recommended.
 */
export async function register() {
  console.log(
    "🚀 [INSTRUMENTATION] register() called - Runtime:",
    process.env.NEXT_RUNTIME,
  );

  // Imported for their env validation side effect only.
  await import("@/env");
  await import("@/env/client");

  if (process.env.NEXT_RUNTIME === "nodejs") {
    const serverTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log("🗓️ Date:", new Date());
    console.log("🕛 Server Timezone:", serverTimezone);

    logEnvConfigStatus();

    // The hourly expiring-items cron, the daily review reminders, and the
    // BullMQ worker used to start here. All three read the legacy database
    // and pushed web notifications — work the mobile app now owns (expiry
    // sweep + Expo push, driven by broccoli-scheduler). They are not started
    // from a feature flag anymore because an env var flipped back on would
    // silently resurrect notifications from a retired database.
  }
}
