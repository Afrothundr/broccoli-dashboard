/**
 * Test script for expiring items notification check
 * 
 * This script manually triggers the expiring items checker that normally runs hourly.
 * It will:
 * 1. Check all users' items for expiring items
 * 2. Create notifications for items expiring within the warning threshold
 * 3. Send push notifications to subscribed users
 * 
 * Usage:
 *   bun scripts/test-expiring-items-check.ts [userId]
 * 
 * Options:
 *   userId (optional) - Check only a specific user's items
 * 
 * Examples:
 *   bun scripts/test-expiring-items-check.ts              # Check all users
 *   bun scripts/test-expiring-items-check.ts clx123...    # Check specific user
 */

import { db } from "@/server/db";
import { checkAllUsersItems } from "@/server/instrumentation/cron/scripts/check-expiring-items";
import { getDaysUntilExpiration, isExpiringSoon } from "@/utils/expiration";
import type { Item, ItemType } from "@/generated/prisma/client";

interface UserPreferences {
  notifications?: {
    enabled?: boolean;
    expiringItems?: {
      enabled?: boolean;
      daysBeforeWarning?: number;
      categories?: string[];
    };
  };
}

async function testExpiringItemsCheck(userId?: string) {
  console.log("\n🔔 Testing Expiring Items Notification Check\n");
  console.log("=" .repeat(60));

  if (userId) {
    console.log(`\n👤 Checking items for user: ${userId}\n`);
    await checkSingleUser(userId);
  } else {
    console.log("\n👥 Checking items for all users\n");
    await checkAllUsersItems();
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n✅ Expiring items check completed!\n");
}

async function checkSingleUser(userId: string) {
  // Verify user exists
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      preferences: true,
    },
  });

  if (!user) {
    console.error(`❌ User not found: ${userId}`);
    process.exit(1);
  }

  console.log(`📋 User: ${user.name || user.email || userId}`);

  const prefs = (user.preferences as UserPreferences) || {};
  const warningDays = prefs.notifications?.expiringItems?.daysBeforeWarning ?? 2;

  console.log(`⚙️  Warning threshold: ${warningDays} days\n`);

  // Check notification preferences
  if (prefs.notifications?.enabled === false) {
    console.log("⚠️  Notifications are disabled for this user");
    return;
  }

  if (prefs.notifications?.expiringItems?.enabled === false) {
    console.log("⚠️  Expiring items notifications are disabled for this user");
    return;
  }

  // Get user's FRESH and OLD items
  const items = await db.item.findMany({
    where: {
      userId,
      status: {
        in: ["FRESH", "OLD"],
      },
    },
    include: {
      itemTypes: true,
    },
  });

  console.log(`📦 Found ${items.length} active items (FRESH/OLD)\n`);

  if (items.length === 0) {
    console.log("ℹ️  No items to check. Add some items with expiration dates to test.");
    return;
  }

  let expiringCount = 0;
  let notificationCount = 0;

  for (const item of items) {
    if (item.itemTypes.length === 0) {
      console.log(`⚠️  Skipping "${item.name}" - no item type assigned`);
      continue;
    }

    const daysUntil = getDaysUntilExpiration(item as Item & { itemTypes: ItemType[] });
    const isExpiring = isExpiringSoon(item as Item & { itemTypes: ItemType[] }, warningDays);

    if (isExpiring) {
      expiringCount++;
      console.log(`🔔 "${item.name}" (${item.status}) - expires in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`);
      
      // Check if notification already exists today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingNotification = await db.notification.findFirst({
        where: {
          userId,
          itemId: item.id,
          type: "ITEM_EXPIRING",
          createdAt: { gte: today },
        },
      });

      if (existingNotification) {
        console.log(`   ℹ️  Already notified today (notification #${existingNotification.id})`);
      } else {
        notificationCount++;
        console.log(`   ✅ Will create notification`);
      }
    } else {
      console.log(`✓ "${item.name}" (${item.status}) - ${daysUntil} days until expiration (not urgent)`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   �� Total items checked: ${items.length}`);
  console.log(`   🔔 Items expiring soon: ${expiringCount}`);
  console.log(`   📬 New notifications to create: ${notificationCount}`);
}

// Get userId from command line arguments
const userId = process.argv[2];

testExpiringItemsCheck(userId)
  .then(() => {
    console.log("✅ Test completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });
