import { type Item, type ItemType } from "@/generated/prisma/client";

/**
 * Calculate the expiration date for an item based on its creation date and shelf life
 */
export function calculateExpirationDate(
  item: Item & { itemTypes: ItemType[] },
): Date {
  const itemType = item.itemTypes[0];
  if (!itemType || itemType.suggested_life_span_seconds <= 0) {
    // If no item type or invalid shelf life, return far future date
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
  }

  const expirationMs =
    item.createdAt.getTime() + itemType.suggested_life_span_seconds * 1000;
  return new Date(expirationMs);
}

/**
 * Get the number of days until an item expires
 * Returns negative number if already expired
 */
export function getDaysUntilExpiration(
  item: Item & { itemTypes: ItemType[] },
): number {
  const expirationDate = calculateExpirationDate(item);
  const now = new Date();
  const diffMs = expirationDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if an item is expiring soon based on a warning threshold
 */
export function isExpiringSoon(
  item: Item & { itemTypes: ItemType[] },
  warningDays: number,
): boolean {
  const daysUntil = getDaysUntilExpiration(item);
  return daysUntil >= 0 && daysUntil <= warningDays;
}

/**
 * Get the expiration status of an item
 */
export function getExpirationStatus(
  item: Item & { itemTypes: ItemType[] },
): "fresh" | "expiring-soon" | "expired" {
  const days = getDaysUntilExpiration(item);
  if (days <= 0) return "expired";
  if (days <= 2) return "expiring-soon";
  return "fresh";
}

/**
 * Get a human-readable time remaining string
 */
export function getTimeRemainingString(
  item: Item & { itemTypes: ItemType[] },
): string {
  const days = getDaysUntilExpiration(item);

  if (days < 0) {
    return `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} ago`;
  }

  if (days === 0) {
    return "Expires today";
  }

  if (days === 1) {
    return "Expires tomorrow";
  }

  return `Expires in ${days} days`;
}
