import { db } from "@/server/db";
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

export async function checkAllUsersItems() {
  // Get all users
  const users = await db.user.findMany({
    select: {
      id: true,
      preferences: true,
    },
  });

  for (const user of users) {
    const prefs = (user.preferences as UserPreferences) || {};

    // Check if notifications are enabled for this user
    if (prefs.notifications?.enabled === false) {
      continue;
    }

    if (prefs.notifications?.expiringItems?.enabled === false) {
      continue;
    }

    await checkUserItems(user.id, prefs);
  }
}

async function checkUserItems(userId: string, prefs: UserPreferences) {
  const warningDays =
    prefs.notifications?.expiringItems?.daysBeforeWarning ?? 2;

  // Get user's FRESH and OLD items (items still consumable)
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

  for (const item of items) {
    if (item.itemTypes.length === 0) continue;

    // Check if item is expiring soon
    if (isExpiringSoon(item as Item & { itemTypes: ItemType[] }, warningDays)) {
      await createExpiringNotification(
        userId,
        item as Item & { itemTypes: ItemType[] },
      );
    }
  }
}

async function createExpiringNotification(
  userId: string,
  item: Item & { itemTypes: ItemType[] },
) {
  const daysUntil = getDaysUntilExpiration(item);

  // Check if we already notified about this item today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingNotification = await db.notification.findFirst({
    where: {
      userId,
      itemId: item.id,
      type: "ITEM_EXPIRING",
      createdAt: {
        gte: today,
      },
    },
  });

  if (existingNotification) {
    // Already notified today, skip
    return;
  }

  // Determine urgency based on item status
  const isOld = item.status === "OLD";
  const urgency = isOld ? "going bad" : "expiring soon";
  const verb = isOld ? "go bad" : "expire";

  const title = `${item.name} ${urgency}!`;
  const message = `Your ${item.name} will ${verb} in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`;

  // Create notification
  await db.notification.create({
    data: {
      userId,
      itemId: item.id,
      type: "ITEM_EXPIRING",
      title,
      message,
      metadata: {
        daysUntil,
        currentStatus: item.status,
        itemName: item.name,
      },
    },
  });

  console.log(
    `✅ Created notification for ${item.name} (${item.status}) - ${daysUntil} days until expiration`,
  );

  // TODO: Send browser push notification if user has subscriptions
  await sendPushNotification(userId, title, message, item.id);
}

async function sendPushNotification(
  userId: string,
  title: string,
  message: string,
  itemId: number,
) {
  // Get user's push subscriptions
  const subscriptions = await db.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    return; // No subscriptions, skip
  }

  // Use NotificationService to send push notification
  const { NotificationService } = await import(
    "@/server/services/NotificationService"
  );
  const notificationService = new NotificationService();

  try {
    await notificationService.sendPush({
      userId,
      title,
      body: message,
      data: { itemId: itemId.toString() },
    });
    console.log(
      `📱 Sent push notification to ${subscriptions.length} subscription(s)`,
    );
  } catch (error) {
    console.error("Failed to send push notification:", error);
  }
}
