import cron from "node-cron";
import { checkAllUsersItems } from "./check-expiring-items";
import { sendReviewReminders } from "./send-review-reminders";

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

  // Daily at 9 AM server time
  cron.schedule("0 9 * * *", async () => {
    console.log("🥦 Sending daily review reminders...");
    try {
      await sendReviewReminders();
      console.log("✅ Review reminders complete");
    } catch (error) {
      console.error("❌ Error sending review reminders:", error);
    }
  });

  console.log("🕰️ Main cron job scheduler started.");
  console.log("   🔔 Expiring items checker: runs hourly at :00");
  console.log("   🥦 Review reminders: runs daily at 09:00");
};
