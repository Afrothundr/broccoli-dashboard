import cron from "node-cron";
import { checkAllUsersItems } from "./check-expiring-items";

export const startMainCron = () => {
  // Schedule expiring items check to run every hour at :00
  cron.schedule("0 * * * *", async () => {
    console.log("🔔 Checking for expiring items...");

    try {
      await checkAllUsersItems();
      console.log("✅ Expiring items check complete");
    } catch (error) {
      console.error("❌ Error checking expiring items:", error);
    }
  });

  console.log("🕰️ Main cron job scheduler started.");
  console.log("   🔔 Expiring items checker: runs hourly at :00");
};
