# 🔔 Expiring Items Notification System

## What It Would Look Like

### User Experience Flow

1. **User buys groceries** → Items added with `createdAt` timestamp, status = FRESH
2. **System calculates expiration** → `createdAt + suggested_life_span_seconds`
3. **Hourly cron job runs** → Checks all FRESH and OLD items (items still consumable)
4. **Item expiring soon?** → Creates notification + sends browser push
5. **User sees notification** in multiple places:
   - 🔔 Bell icon in header with badge count
   - Browser push notification (if enabled)
   - Notification dropdown list
   - Different messages: "expiring soon" (FRESH) vs "going bad" (OLD)
6. **User clicks notification** → Opens item details page
7. **User can take action** → Update status, consume item, or dismiss

### 💡 Key Features

- **Tracks consumable items** - Monitors both FRESH and OLD status items
- **Different urgency levels**:
  - ⚠️ **FRESH items**: "expiring soon" (yellow warning) - item is still fresh but approaching OLD status
  - 🔴 **OLD items**: "going bad" (red urgent) - item is already OLD and approaching BAD status
- **Smart detection** - Only checks items that are still edible (skips BAD, EATEN, DISCARDED)
- **No spam** - Only one notification per item per day
- **User preferences** - Configurable warning threshold (default: 2 days)
- **Category filtering** - Choose which food types to track
- **Real-time updates** - Auto-refresh every 30 seconds
- **Browser push** - Notifications even when app is closed (PWA!)

---

## Visual Mockup

### Header with Notification Bell

**Current Header:**
```
┌────────────────────────────────────────────────────────┐
│  🥦 Logo          [Chat]         🌙  👤               │
└────────────────────────────────────────────────────────┘
```

**With Notification Bell Added:**
```
┌────────────────────────────────────────────────────────┐
│  🥦 Logo          [Chat]      🔔(3)  🌙  👤           │
└────────────────────────────────────────────────────────┘
                                   ↓ Click
                       ┌──────────────────────────┐
                       │ Notifications            │
                       ├──────────────────────────┤
                       │ ⚠️ Milk expiring         │
                       │    in 1 day (FRESH)      │
                       │    2 hours ago       [•] │
                       ├──────────────────────────┤
                       │ 🔴 Strawberries          │
                       │    going bad today (OLD) │
                       │    5 hours ago       [•] │
                       ├──────────────────────────┤
                       │ ⚠️ Lettuce expiring      │
                       │    in 2 days (FRESH)     │
                       │    1 day ago         [•] │
                       ├──────────────────────────┤
                       │ Mark all as read         │
                       │ View all →               │
                       └──────────────────────────┘
```

**Integration Point:**
The bell would be added to `AppHeader.tsx` in the `renderRightSide` section, between the theme switcher and user avatar:

```tsx
// src/components/core/AppHeader.tsx
renderRightSide={() => (
  <div className="horizontal center-v gap-4">
    {!isMobile && <HeaderLinks links={headerLinks} />}
    <ThemeSwitchMinimalNextThemes buttonProps={{ variant: "ghost" }} />
    <NotificationBell />  {/* ← NEW: Add here */}
    <AppHeaderUser links={userLinks} />
  </div>
)}
```

### Browser Push Notification Examples

**For FRESH items:**
```
┌─────────────────────────────────────┐
│ 🥦 Broccoli Dashboard               │
├─────────────────────────────────────┤
│ ⚠️ Milk expiring soon!              │
│ Your Milk will expire in 1 day      │
│                                     │
│ [View Item]                         │
└─────────────────────────────────────┘
```

**For OLD items (more urgent):**
```
┌─────────────────────────────────────┐
│ 🥦 Broccoli Dashboard               │
├─────────────────────────────────────┤
│ 🔴 Strawberries going bad!          │
│ Your Strawberries will go bad today │
│                                     │
│ [View Item]                         │
└─────────────────────────────────────┘
```

### Notification Settings Page
```
┌─────────────────────────────────────────────────────┐
│ Notification Settings                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ☑️ Enable expiring item notifications              │
│                                                     │
│ Warn me when items expire in:                      │
│ [2] days                                            │
│                                                     │
│ Categories to track:                                │
│ ☑️ Dairy        ☑️ Produce      ☑️ Meat            │
│ ☑️ Seafood      ☐ Pantry        ☑️ Frozen          │
│                                                     │
│ Browser Notifications:                              │
│ [Enable Push Notifications] ← Requests permission  │
│                                                     │
│ Daily digest time: [09:00 AM]                       │
│                                                     │
│ [Test Notification]  [Save Settings]                │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Breakdown

### 1. Database Changes (30 min)

**Add Notification table:**
```prisma
model Notification {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(...)
  itemId    Int?
  item      Item?    @relation(...)
  type      NotificationType
  title     String
  message   String
  read      Boolean  @default(false)
  readAt    DateTime?
  metadata  Json?
  
  @@index([userId, read])
}

enum NotificationType {
  ITEM_EXPIRING
  ITEM_EXPIRED
  SYSTEM
}
```

**Update User model:**
- Add `notifications Notification[]`

**Update Item model:**
- Add `notifications Notification[]`

### 2. Backend Logic (2 hours)

**A. Expiration utilities** (`src/utils/expiration.ts`):
- `calculateExpirationDate(item)` → Date
- `getDaysUntilExpiration(item)` → number
- `isExpiringSoon(item, warningDays)` → boolean
- `getExpirationStatus(item)` → 'fresh' | 'expiring-soon' | 'expired'

**B. Cron job** (`src/server/instrumentation/cron/scripts/check-expiring-items.ts`):
- Runs hourly
- Queries all FRESH and OLD items (items still consumable)
- Calculates expiration for each
- Creates notifications for items expiring within threshold
- Different messaging for OLD vs FRESH items
- Prevents duplicate notifications (checks if already notified today)

**C. tRPC API** (`src/server/api/routers/notification.ts`):
- `getNotifications()` - Fetch user's notifications
- `getUnreadCount()` - Get badge count
- `markAsRead(id)` - Mark single as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Remove notification

### 3. UI Components (3 hours)

**A. NotificationBell** (`src/components/NotificationBell.tsx`):
- Bell icon in header
- Badge with unread count
- Dropdown with notification list
- Auto-refresh every 30 seconds

**B. NotificationItem** (`src/components/NotificationItem.tsx`):
- Display title, message, time ago
- Visual indicator for read/unread
- Click to navigate to item
- Mark as read on click

**C. Settings Page** (`src/app/(app)/settings/notifications/page.tsx`):
- Toggle notifications on/off
- Set warning threshold (days)
- Select categories to track
- Request browser push permission
- Test notification button

### 4. Browser Push (Optional, 2 hours)

**Web Push API integration:**
- Request notification permission
- Store push subscription in database
- Send push notifications from cron job
- Handle notification clicks (open app to item)

---

## Effort Estimate

| Phase | Time | Complexity |
|-------|------|------------|
| Database schema | 30 min | Low |
| Expiration utilities | 1 hour | Medium |
| Cron job | 1 hour | Medium |
| tRPC endpoints | 1 hour | Low |
| UI components | 3 hours | Medium |
| Browser push (optional) | 2 hours | High |
| **Total (without push)** | **6.5 hours** | **Medium** |
| **Total (with push)** | **8.5 hours** | **Medium-High** |

---

## Key Benefits

✅ **Reduces food waste** - Users know what to eat first
✅ **Saves money** - Less spoiled food = less waste
✅ **Better UX** - Proactive alerts vs reactive checking
✅ **PWA-friendly** - Works great with your new PWA
✅ **Scalable** - Easy to add more notification types later

---

## Code Examples

### Expiration Utility Example
```typescript
// src/utils/expiration.ts
import { type Item, type ItemType } from "@/generated/prisma";

export function getDaysUntilExpiration(
  item: Item & { itemTypes: ItemType[] }
): number {
  const itemType = item.itemTypes[0];
  if (!itemType) return 999; // No expiration data

  const expirationDate = new Date(
    item.createdAt.getTime() +
    (itemType.suggested_life_span_seconds * 1000)
  );

  const now = new Date();
  const diffMs = expirationDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// Usage:
const milk = await db.item.findFirst({
  where: { name: "Milk" },
  include: { itemTypes: true }
});
const daysLeft = getDaysUntilExpiration(milk); // e.g., 2
```

### Cron Job Example
```typescript
// src/server/instrumentation/cron/scripts/check-expiring-items.ts
import cron from "node-cron";
import { db } from "@/server/db";
import { getDaysUntilExpiration } from "@/utils/expiration";

export const startExpiringItemsChecker = () => {
  // Run every hour at :00
  cron.schedule("0 * * * *", async () => {
    console.log("🔔 Checking for expiring items...");

    // Query FRESH and OLD items (items that are still consumable)
    const items = await db.item.findMany({
      where: {
        status: {
          in: ['FRESH', 'OLD']
        }
      },
      include: { itemTypes: true, user: true }
    });

    for (const item of items) {
      const daysUntil = getDaysUntilExpiration(item);
      const warningThreshold = 2; // Could come from user preferences

      // Notify for items expiring soon (FRESH items approaching OLD/BAD)
      // or items already OLD that are about to go BAD
      if (daysUntil > 0 && daysUntil <= warningThreshold) {
        // Check if we already notified today
        const existingNotification = await db.notification.findFirst({
          where: {
            itemId: item.id,
            type: 'ITEM_EXPIRING',
            createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
          }
        });

        if (!existingNotification) {
          const urgency = item.status === 'OLD' ? 'going bad' : 'expiring soon';

          await db.notification.create({
            data: {
              userId: item.userId,
              itemId: item.id,
              type: 'ITEM_EXPIRING',
              title: `${item.name} ${urgency}!`,
              message: `Your ${item.name} will ${item.status === 'OLD' ? 'go bad' : 'expire'} in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
              metadata: { daysUntil, currentStatus: item.status }
            }
          });

          console.log(`✅ Created notification for ${item.name} (${item.status})`);
        }
      }
    }
  });
};
```

### tRPC Endpoint Example
```typescript
// src/server/api/routers/notification.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const notificationRouter = createTRPCRouter({
  getNotifications: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      cursor: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const notifications = await ctx.db.notification.findMany({
        where: { userId: ctx.session.user.id },
        include: { item: true },
        orderBy: { createdAt: 'desc' },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: number | undefined = undefined;
      if (notifications.length > input.limit) {
        const nextItem = notifications.pop();
        nextCursor = nextItem!.id;
      }

      return { notifications, nextCursor };
    }),

  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.notification.count({
        where: {
          userId: ctx.session.user.id,
          read: false,
        },
      });
    }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.notification.update({
        where: { id: input.id },
        data: { read: true, readAt: new Date() },
      });
    }),
});
```

### React Component Example
```typescript
// src/components/NotificationBell.tsx
"use client";

import { Bell } from "lucide-react";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationItem } from "./NotificationItem";

export function NotificationBell() {
  const { data: unreadCount } = api.notification.getUnreadCount.useQuery(
    undefined,
    { refetchInterval: 30000 } // Refresh every 30 seconds
  );

  const { data } = api.notification.getNotifications.useQuery({ limit: 10 });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 hover:bg-muted rounded-lg">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h3 className="font-semibold">Notifications</h3>

          {data?.notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications</p>
          ) : (
            data?.notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

---

## Next Steps

If you want to implement this, I can:
1. ✅ Create the database migration
2. ✅ Build the expiration utilities
3. ✅ Set up the cron job
4. ✅ Create tRPC endpoints
5. ✅ Build the UI components
6. ✅ Add browser push notifications (optional)

**Estimated time: 6-8 hours of development**

Would you like me to start implementing this system?


