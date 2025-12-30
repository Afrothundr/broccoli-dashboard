/**
 * Test script for push notifications
 * 
 * Usage:
 * 1. Make sure you have VAPID keys in your .env file
 * 2. Subscribe to push notifications in the app
 * 3. Run: bun scripts/test-push-notification.ts <userId>
 */

import { db } from "@/server/db";
import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:test@example.com";

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error("❌ VAPID keys not found in environment variables");
  console.log("\nGenerate VAPID keys with:");
  console.log("  npx web-push generate-vapid-keys");
  console.log("\nThen add them to your .env file:");
  console.log("  NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public_key>");
  console.log("  VAPID_PRIVATE_KEY=<private_key>");
  console.log("  VAPID_SUBJECT=mailto:your-email@example.com");
  process.exit(1);
}

// Configure web-push
webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

async function testPushNotification(userId: string) {
  console.log(`\n🔔 Testing push notification for user: ${userId}\n`);

  // Get user's push subscriptions
  const subscriptions = await db.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    console.error("❌ No push subscriptions found for this user");
    console.log("\nMake sure to:");
    console.log("1. Open the app in a browser");
    console.log("2. Go to Settings > Notifications");
    console.log("3. Click 'Enable Push Notifications'");
    console.log("4. Grant permission when prompted");
    return;
  }

  console.log(`✅ Found ${subscriptions.length} subscription(s)\n`);

  // Test notification payload
  const notification = {
    title: "🧪 Test Notification",
    body: "This is a test push notification from the Broccoli Dashboard!",
    icon: "/web-app-manifest-192x192.png",
    badge: "/web-app-manifest-192x192.png",
    data: {
      url: "/app",
      timestamp: new Date().toISOString(),
    },
  };

  // Send to all subscriptions
  let successCount = 0;
  let failCount = 0;

  for (const subscription of subscriptions) {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      };

      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(notification)
      );

      console.log(`✅ Sent to subscription ${subscription.id}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to send to subscription ${subscription.id}:`, error);
      failCount++;

      // If subscription is invalid, remove it
      if (error instanceof Error && error.message.includes("410")) {
        console.log(`🗑️  Removing invalid subscription ${subscription.id}`);
        await db.pushSubscription.delete({
          where: { id: subscription.id },
        });
      }
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📱 Total: ${subscriptions.length}\n`);
}

// Get userId from command line arguments
const userId = process.argv[2];

if (!userId) {
  console.error("❌ Please provide a userId as an argument");
  console.log("\nUsage:");
  console.log("  bun scripts/test-push-notification.ts <userId>");
  console.log("\nTo find your userId:");
  console.log("  1. Open the app");
  console.log("  2. Open browser console");
  console.log("  3. Run: localStorage.getItem('userId')");
  console.log("  Or check the database directly");
  process.exit(1);
}

testPushNotification(userId)
  .then(() => {
    console.log("✅ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });

