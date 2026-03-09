import type { Item, ItemType } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { getDaysUntilExpiration } from "@/utils/expiration";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function sendReviewReminders() {
  // Find users who have push subscriptions and haven't reviewed today
  const users = await db.user.findMany({
    where: {
      pushSubscriptions: { some: {} },
      OR: [
        { lastReviewedAt: null },
        { lastReviewedAt: { lt: startOfToday() } },
      ],
    },
    include: {
      items: {
        where: { status: { in: ["BAD", "OLD", "FRESH"] } },
        include: {
          itemTypes: {
            select: { id: true, name: true, suggested_life_span_seconds: true },
          },
        },
      },
    },
  });

  for (const user of users) {
    // Check reviewReminderEnabled preference (defaults true if unset)
    const prefs =
      (user.preferences as { reviewReminderEnabled?: boolean }) ?? {};
    if (prefs.reviewReminderEnabled === false) continue;

    // Filter to actual at-risk items (FRESH must be within 3 days)
    const atRiskItems = (
      user.items as (Item & { itemTypes: ItemType[] })[]
    ).filter(
      (item) =>
        item.status === "BAD" ||
        item.status === "OLD" ||
        (item.status === "FRESH" && getDaysUntilExpiration(item) <= 3),
    );
    if (atRiskItems.length === 0) continue;

    // Dedup: skip if already sent a REVIEW_REMINDER today
    const alreadySent = await db.notification.findFirst({
      where: {
        userId: user.id,
        type: "REVIEW_REMINDER",
        createdAt: { gte: startOfToday() },
      },
    });
    if (alreadySent) continue;

    // Build notification body (list up to 2 item names, summarise the rest)
    const itemNames = atRiskItems
      .slice(0, 2)
      .map((i) => i.itemTypes[0]?.name ?? i.name);
    const remainder = atRiskItems.length - 2;
    const itemsList =
      remainder > 0
        ? `${itemNames.join(", ")} and ${remainder} more`
        : itemNames.join(" and ");
    const title = "Kitchen check-in time";
    const body = `You have ${atRiskItems.length} item${atRiskItems.length !== 1 ? "s" : ""} that need attention: ${itemsList}`;

    // Record notification in DB (for dedup and NotificationBell display)
    await db.notification.create({
      data: {
        userId: user.id,
        type: "REVIEW_REMINDER",
        title,
        message: body,
        metadata: { atRiskCount: atRiskItems.length, itemNames },
      },
    });

    // Send push notification — use dynamic import same as check-expiring-items.ts
    const { NotificationService } = await import(
      "@/server/services/NotificationService"
    );
    const notificationService = new NotificationService();
    await notificationService.sendPush({
      userId: user.id,
      title,
      body,
      data: { type: "AT_RISK_REVIEW", tag: "at-risk-review" },
    });

    console.log(
      `📱 Sent review reminder to user ${user.id} -- ${atRiskItems.length} at-risk items`,
    );
  }
}
