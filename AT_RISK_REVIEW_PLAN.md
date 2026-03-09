# At-Risk Items Review Experience — Implementation Plan

**bd issue:** `broccoli-dashboard-oy2`
**Feature:** Items at risk review experience (swipeable card deck) + review reminder push notification

---

## Overview

A mobile-first, Tinder-style card swipe experience that prompts users once per day to review their at-risk inventory items (status `BAD`, `OLD`, or `FRESH` items expiring within 3 days). The goal is to make the tedious task of updating stale food items feel fast, tactile, and even a little fun — while keeping the data model accurate.

When the user is away from the app, a **push notification** is sent once per day (at a configurable time, defaulting to 9 AM local time) if they have unreviewed at-risk items. Tapping the notification deep-links directly into the card deck experience.

---

## User Experience Design

### Entry Point

- On app load (mobile only, `isMobile === true`), check if the user has any at-risk items **and** hasn't completed a review session today. The review can also be triggered by tapping the daily push notification (see Push Notification section below).
- If both are true, display a full-screen bottom-sheet modal (using Vaul `Drawer`) that takes over the screen with the card deck experience.
- The modal should be **dismissible** — a "Remind me later" / skip option is always available.

### The Card Deck

Each card represents one at-risk item and is rendered in a stacked visual layout (2-3 cards visible behind the active top card, slightly offset and scaled down to create depth).

**Card anatomy:**
```
┌─────────────────────────────┐
│  🟡 OLD   •  Expires today  │  ← urgency badge + time remaining
│                             │
│  [item type icon — large]   │
│                             │
│     Broccoli                │  ← item name (large)
│     Organic Crown, 1 unit   │  ← item description / details
│                             │
│  ░░░░░░░░░░░░░░░  45%       │  ← last known % consumed
│                             │
│  ┌────────┐  ┌──────────┐  │
│  │ 🗑 Gone │  │ ✅ Eaten  │  │  ← quick action buttons
│  └────────┘  └──────────┘  │
│                             │
│  [Tap to update details ↑]  │  ← expands inline % slider
└─────────────────────────────┘
```

### Swipe Gestures (Framer Motion `drag`)

| Gesture | Action | Visual Feedback |
|---|---|---|
| Swipe **right** | Mark as **Eaten** (100% consumed) | Card flies right, green overlay flashes |
| Swipe **left** | Mark as **Discarded** | Card flies left, red overlay flashes |
| Swipe **up** | Skip / review later | Card flies up, no mutation |
| Tap **Eaten** button | Same as swipe right | |
| Tap **Discarded** button | Same as swipe left | |
| Tap **"Update details"** | Expand inline panel for % slider | Smooth height animation |

The swipe threshold should be ~80px of horizontal drag before the action commits. Before threshold, the card rotates slightly (max ±15°) and shows a color-tinted action hint overlay (green right, red left) with opacity proportional to drag distance.

### Inline % Update Panel

When the user taps "update details", the card expands downward (Framer Motion `AnimatePresence` + `layout`) to reveal:
- A large percentage display (reuse `UpdateItemForm` display pattern)
- Quick-pick buttons: 0%, 25%, 50%, 75%, 100%
- A range slider
- Status toggle: Keep / Eaten / Discarded

Confirming saves immediately and auto-advances to the next card.

### Progress & Completion

- A subtle progress bar at the top of the modal: `3 / 7 items reviewed`
- When all cards are exhausted, show a **completion screen** with:
  - A friendly message (e.g. "Nice! Your kitchen is up to date 🥦")
  - Summary: X eaten, Y discarded, Z skipped
  - `canvas-confetti` burst (already a dep) for any non-zero "eaten" count
  - A close button

---

## Architecture

### New Files

```
src/
  components/
    core/
      AtRiskReview/
        AtRiskReviewModal.tsx       ← Vaul Drawer shell, once-per-day gate
        AtRiskReviewDeck.tsx        ← Card deck orchestrator, manages card queue state
        AtRiskReviewCard.tsx        ← Single draggable card (Framer Motion)
        AtRiskReviewCardOverlay.tsx ← Directional action hint overlay (Eaten/Discard)
        AtRiskReviewCardDetails.tsx ← Expandable inline % + status panel
        AtRiskReviewComplete.tsx    ← Completion/summary screen
        useAtRiskReview.ts          ← Hook: fetches items, manages queue, submits updates
        useAtRiskReviewSession.ts   ← Hook: localStorage once-per-day gate logic
        index.ts                    ← Re-exports
```

### Integration Point

Mount `<AtRiskReviewModal />` once inside `AppPage` (`src/app/(app)/(scrollable)/app/page.tsx`). It self-manages its open state via `useAtRiskReviewSession`.

---

## Data & Logic

### Fetching At-Risk Items

Add a new tRPC procedure `item.getAtRiskItems` in `src/server/api/routers/item.ts`:

```typescript
// Returns items that are BAD, OLD, or FRESH items expiring within 3 days
// Excludes already EATEN or DISCARDED items
getAtRiskItems: protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    return ctx.db.item.findMany({
      where: {
        userId,
        status: { in: ["BAD", "OLD", "FRESH"] },
      },
      include: {
        itemTypes: {
          select: { id: true, name: true, suggested_life_span_seconds: true },
        },
      },
      orderBy: { status: "asc" }, // BAD first, then OLD, then FRESH
    });
  })
```

The client-side `useAtRiskReview` hook filters the returned items further, using the existing `getDaysUntilExpiration` util to exclude `FRESH` items with > 3 days remaining.

### Once-Per-Day Gate (`useAtRiskReviewSession`)

Uses `localStorage` (no server round-trip needed):

```typescript
const STORAGE_KEY = "broccoli:atRiskReview:lastCompletedDate";

// Returns true if the user should be shown the review today
function shouldShowReview(): boolean {
  const last = localStorage.getItem(STORAGE_KEY);
  if (!last) return true;
  const lastDate = new Date(last);
  const today = new Date();
  return lastDate.toDateString() !== today.toDateString();
}

function markReviewComplete(): void {
  localStorage.setItem(STORAGE_KEY, new Date().toDateString());
}
```

The session is marked complete when:
- The user finishes all cards (reaches completion screen), OR
- The user explicitly dismisses ("Don't show today")

**Not** marked if they use the "Remind me later" skip (X button at top of modal) — this allows re-triggering within the same day if they close and reopen.

### Card Queue State (`useAtRiskReview`)

```typescript
type ReviewDecision =
  | { type: "eaten" }
  | { type: "discarded" }
  | { type: "updated"; percentConsumed: number; status?: ItemStatusType }
  | { type: "skipped" };

interface ReviewResult {
  itemId: number;
  decision: ReviewDecision;
}
```

The hook maintains:
- `queue: CombinedItemType[]` — remaining cards
- `results: ReviewResult[]` — completed decisions
- `currentItem` — top of queue
- `advance(decision)` — records decision, pops queue, triggers mutation

Mutations are fired immediately on swipe/button action using `api.item.updateItem.useMutation` (reusing existing mutation). No new API surface needed beyond `getAtRiskItems`.

### Card State Machine

Each card transitions through:
```
idle → dragging → (threshold met) → animating-out → done
                → (threshold not met) → idle (spring back)
                → expanded (details open)
```

---

## Component Details

### `AtRiskReviewCard.tsx`

Key Framer Motion config:

```typescript
// Drag constraints — free horizontal drag, limited vertical
const dragConstraints = { left: 0, right: 0, top: -100, bottom: 0 };

// Rotation: ±15° based on drag x offset
const rotate = useTransform(dragX, [-200, 0, 200], [-15, 0, 15]);

// Overlay opacity: driven by abs(dragX)
const eatOverlayOpacity = useTransform(dragX, [0, SWIPE_THRESHOLD], [0, 1]);
const discardOverlayOpacity = useTransform(dragX, [-SWIPE_THRESHOLD, 0], [1, 0]);

// On drag end
const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
  if (info.offset.x > SWIPE_THRESHOLD) onDecision("eaten");
  else if (info.offset.x < -SWIPE_THRESHOLD) onDecision("discarded");
  else if (info.offset.y < -SWIPE_THRESHOLD) onDecision("skipped");
  // else spring back to center
};
```

### `AtRiskReviewDeck.tsx`

Renders the top 3 cards from the queue, each absolutely positioned with:
- `zIndex`: top card = 3, second = 2, third = 1
- `scale`: top = 1.0, second = 0.96, third = 0.92
- `translateY`: staggered slightly downward for depth effect

Uses `AnimatePresence` with `mode="popLayout"` so exiting cards animate out while the next card scales up smoothly.

### `AtRiskReviewCardOverlay.tsx`

Two absolutely-positioned overlays on the card:
- **Right overlay**: green tint + large "✅ EATEN" label
- **Left overlay**: red tint + large "🗑 DISCARD" label

Opacity driven by `useTransform` on drag x, so the hint appears proportionally as you drag.

### `AtRiskReviewComplete.tsx`

Shows summary counts and fires confetti if `eatenCount > 0`:

```typescript
useEffect(() => {
  if (eatenCount > 0) {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  }
}, []);
```

---

## Visual Design

### Card Status Colors

| Status | Card accent color | Badge |
|---|---|---|
| `BAD` | Red-400 left border + red tint header | 🔴 BAD |
| `OLD` | Yellow-400 left border + yellow tint header | 🟡 OLD |
| `FRESH` (expiring) | Orange-400 left border | 🟠 Expiring Soon |

### Card Urgency Copy

| Condition | Sub-headline |
|---|---|
| `BAD` | "This has gone bad" |
| `OLD` | "Going bad soon" |
| `FRESH`, 0 days | "Expires today!" |
| `FRESH`, 1 day | "Expires tomorrow" |
| `FRESH`, 2-3 days | "Expires in N days" |

### Deck Background

The `AtRiskReviewModal` renders with a semi-transparent dark backdrop (existing Vaul overlay). The deck area above uses a very subtle gradient background to help the stacked cards "pop".

---

## Implementation Phases

### Phase 1 — Data layer
1. Add `getAtRiskItems` tRPC procedure to `item.ts`
2. Write `useAtRiskReview.ts` hook (fetching, queue management, mutation calls)
3. Write `useAtRiskReviewSession.ts` hook (localStorage gate)

### Phase 2 — Core card component
4. Build `AtRiskReviewCard.tsx` with Framer Motion drag, overlays, rotation
5. Build `AtRiskReviewCardDetails.tsx` (expandable % slider panel — reuse `UpdateItemForm` innards)

### Phase 3 — Deck orchestration
6. Build `AtRiskReviewDeck.tsx` (stacked card layout, AnimatePresence)
7. Build `AtRiskReviewCardOverlay.tsx` (directional hints)

### Phase 4 — Modal shell & completion
8. Build `AtRiskReviewModal.tsx` (Vaul Drawer, once-per-day gate, progress bar)
9. Build `AtRiskReviewComplete.tsx` (summary + confetti)

### Phase 5 — Integration & polish
10. Mount `<AtRiskReviewModal />` in `AppPage`
11. Mobile-only gate using `useMediaQueries` (`isMobile`)
12. Accessibility: keyboard nav fallback (left/right arrow keys advance cards), ARIA labels
13. Dark mode review pass (all status colors, overlays)
14. Haptic feedback via `navigator.vibrate` on swipe commit (mobile only)

---

## Files to Modify

| File | Change |
|---|---|
| `src/server/api/routers/item.ts` | Add `getAtRiskItems` procedure |
| `src/app/(app)/(scrollable)/app/page.tsx` | Mount `<AtRiskReviewModal />` |
| `src/trpc/react.tsx` *(if needed)* | No change expected — auto-inferred by tRPC |

---

## Dependencies

All required dependencies are **already installed**:

| Dep | Usage |
|---|---|
| `framer-motion ^12.7.4` | Card drag, rotation, AnimatePresence, layout animations |
| `vaul ^1.1.2` | Bottom drawer modal shell |
| `canvas-confetti` | Completion screen celebration |
| `@radix-ui/react-slider` | % consumed slider in detail panel |
| `lucide-react` | Utensils, Trash, X, ChevronDown icons |
| `use-media` | `isMobile` gate |
| `js-cookie` | (optional alternative to localStorage for session gate) |
| `dayjs` | Human-readable expiry strings |

No new packages required.

---

## Accessibility & Edge Cases

- **0 at-risk items**: Modal never opens. No change to UI.
- **1 item**: Deck shows single card (no stack effect). Completing it goes straight to completion screen.
- **Offline**: If tRPC query fails, modal silently doesn't open (treat as 0 items).
- **Slow connection**: Show skeleton card while query loads.
- **User dismisses mid-deck**: Skipped items are NOT updated. Session is NOT marked complete (user will see it again tomorrow... or later today if they only tapped "remind me later").
- **Desktop**: `AtRiskReviewModal` renders `null` when `!isMobile`. Desktop users use the existing `Inventory` update flow.
- **Reduced motion**: Respect `prefers-reduced-motion` — disable rotation and fly-out animation, use simple fade instead.

---

---

## Push Notification: Daily Review Reminder

### Concept

Once per day, if a user has at-risk items they haven't reviewed yet, a push notification is delivered to prompt them to open the app and run through the card deck. This is the **primary driver** for engagement with the review flow for users who don't open the app organically every day.

---

### Notification Content

```
Title:  "🥦 Kitchen check-in time"
Body:   "You have 4 items that need attention — broccoli, milk, and 2 more."
            (lists up to 2 item names, then "and N more" for the rest)
Tag:    "at-risk-review"   ← deduplicates in the OS notification tray
Data:   { type: "AT_RISK_REVIEW", reviewSessionDate: "2025-06-10" }
```

The `tag` field ensures that if a second notification fires (e.g. a server hiccup sends it twice), the OS replaces the first one rather than stacking duplicates.

---

### When It Fires

The cron job `main-cron.ts` already runs **hourly**. A new check is added:

```
Every day at 9:00 AM (server time, as a starting point — see Preferred Time below):
  For each user with push subscriptions:
    1. Count their at-risk items (BAD, OLD, FRESH-within-3-days)
    2. Check if they already received a REVIEW_REMINDER notification today
    3. Check if they already completed a review session today (via reviewedAt DB field)
    4. If items > 0 AND no notification today AND no completed review today → send push
```

**Preferred Notification Time (future enhancement):** Store a `reviewReminderTime` string (`"09:00"`) in `userPreferencesSchema` so each user can pick their preferred time. The cron fires hourly and checks whether the current hour matches the user's preference. Defaults to `"09:00"` if unset.

---

### Schema Changes

#### 1. New `NotificationType` enum value

Add `REVIEW_REMINDER` to the existing `NotificationType` enum in `prisma/schema.prisma`:

```prisma
enum NotificationType {
  ITEM_EXPIRING
  ITEM_EXPIRED
  ITEM_STATUS_CHANGED
  REVIEW_REMINDER   // ← new
  SYSTEM
}
```

Requires a Prisma migration (`prisma migrate dev`).

#### 2. `reviewedAt` field on User (optional, preferred over localStorage for cross-device)

Add a `lastReviewedAt DateTime?` field to the `User` model so the "already reviewed today" gate works across devices:

```prisma
model User {
  ...
  lastReviewedAt DateTime?   // ← new: set when user completes a review session
  ...
}
```

When `useAtRiskReviewSession` marks a session complete, it also calls a new tRPC mutation `user.markReviewComplete` that writes `lastReviewedAt = now()` to the DB. The `localStorage` gate becomes a fast-path cache; the DB field is the source of truth.

#### 3. `userPreferencesSchema` addition (for preferred time, future enhancement)

```typescript
reviewReminderTime: z.string().regex(/^\d{2}:\d{2}$/).default("09:00"),
reviewReminderEnabled: z.boolean().default(true),
```

---

### New Cron Script: `send-review-reminders.ts`

New file at `src/server/instrumentation/cron/scripts/send-review-reminders.ts`:

```typescript
// Pseudocode — see full implementation notes below
export async function sendReviewReminders() {
  const users = await db.user.findMany({
    where: {
      pushSubscriptions: { some: {} },          // only users with push enabled
      lastReviewedAt: {
        OR: [{ equals: null }, { lt: startOfToday() }]  // haven't reviewed today
      }
    },
    include: {
      items: {
        where: { status: { in: ["BAD", "OLD", "FRESH"] } },
        include: { itemTypes: true }
      }
    }
  });

  for (const user of users) {
    const atRiskItems = user.items.filter(item =>
      item.status === "BAD" ||
      item.status === "OLD" ||
      (item.status === "FRESH" && getDaysUntilExpiration(item) <= 3)
    );

    if (atRiskItems.length === 0) continue;

    // Dedup: only one REVIEW_REMINDER per user per calendar day
    const alreadyNotified = await db.notification.findFirst({
      where: { userId: user.id, type: "REVIEW_REMINDER", createdAt: { gte: startOfToday() } }
    });
    if (alreadyNotified) continue;

    // Build message body listing up to 2 item names
    const names = atRiskItems.slice(0, 2).map(i => i.name);
    const remainder = atRiskItems.length - 2;
    const bodyItems = remainder > 0
      ? `${names.join(", ")}, and ${remainder} more`
      : names.join(" and ");
    const body = `You have ${atRiskItems.length} item${atRiskItems.length > 1 ? "s" : ""} that need attention — ${bodyItems}.`;

    // Create DB notification record
    await db.notification.create({
      data: {
        userId: user.id,
        type: "REVIEW_REMINDER",
        title: "🥦 Kitchen check-in time",
        message: body,
        metadata: { atRiskCount: atRiskItems.length }
      }
    });

    // Send push
    await notificationService.sendPush({
      userId: user.id,
      title: "🥦 Kitchen check-in time",
      body,
      data: { type: "AT_RISK_REVIEW" }
    });
  }
}
```

#### Schedule in `main-cron.ts`

```typescript
// Runs every day at 9 AM server time
cron.schedule("0 9 * * *", async () => {
  console.log("🥦 Sending at-risk review reminder notifications...");
  try {
    await sendReviewReminders();
    console.log("✅ Review reminders sent");
  } catch (error) {
    console.error("❌ Error sending review reminders:", error);
  }
});
```

---

### Deep-Link: Notification → Card Deck

When the user taps the push notification, the service worker opens `/app`. The app needs to know it was launched via a review notification so it can **immediately open the card deck** rather than waiting for the normal once-per-day auto-trigger.

#### Service Worker Changes (`public/sw-push.js`)

Update the `notificationclick` handler to pass an intent in the URL:

```javascript
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const data = event.notification.data || {};
  let urlToOpen = '/app';

  if (data.type === 'AT_RISK_REVIEW') {
    // Append a query param that the app reads to auto-open the review deck
    urlToOpen = '/app?intent=review';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        for (const client of clientList) {
          if (client.url.includes('/app') && 'focus' in client) {
            // If app is already open, send a message to trigger the deck
            client.postMessage({ type: 'OPEN_AT_RISK_REVIEW' });
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(urlToOpen);
      })
  );
});
```

#### App-Side Intent Handling (`AtRiskReviewModal.tsx`)

`AtRiskReviewModal` reads the `intent` query param (via `nuqs`, already a dep) and/or listens for the `OPEN_AT_RISK_REVIEW` service worker message. Either signal bypasses the once-per-day `localStorage` gate and forces the modal open immediately:

```typescript
// Inside AtRiskReviewModal
const [intent] = useQueryState('intent');  // nuqs

useEffect(() => {
  if (intent === 'review') {
    setForceOpen(true);
    // Clean up the URL param without a page reload
    void router.replace('/app', { scroll: false });
  }
}, [intent]);

// Also listen for SW postMessage when app is already open
useEffect(() => {
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'OPEN_AT_RISK_REVIEW') setForceOpen(true);
  };
  navigator.serviceWorker?.addEventListener('message', handler);
  return () => navigator.serviceWorker?.removeEventListener('message', handler);
}, []);
```

`forceOpen` is a boolean state that, when `true`, opens the modal regardless of the `shouldShowReview()` localStorage check.

---

### Notification Actions (Rich Notification — Future Enhancement)

The Web Push API supports `actions` in the notification payload — OS-level buttons that appear without opening the app. These are ideal for a "remind me later" button directly in the notification tray:

```javascript
// In sw-push.js showNotification call
self.registration.showNotification(title, {
  body,
  icon: '/web-app-manifest-192x192.png',
  tag: 'at-risk-review',
  data,
  actions: [
    { action: 'open-review', title: '🥦 Review now' },
    { action: 'snooze',      title: '⏰ Remind me in 2 hrs' },
  ]
});

// Handle action click
self.addEventListener('notificationclick', function(event) {
  if (event.action === 'snooze') {
    // Schedule a follow-up notification 2 hours from now
    // (requires a server endpoint to reschedule — future work)
    event.notification.close();
    return;
  }
  // default: open-review (or no action clicked = banner tap)
  // ... existing deep-link logic
});
```

> **Note:** `actions` are only supported on Android Chrome and desktop. iOS Safari ignores them. The notification still works fine — just without the buttons.

---

### Settings UI Changes (`SettingsTabNotifications.tsx`)

Add a new sub-section **"Review Reminders"** below the existing push toggle, visible only when `isSubscribed === true`:

```
┌─────────────────────────────────────┐
│ 🥦 Daily Review Reminder            │
│ Get a daily nudge when you have     │
│ items that need attention.          │
│                                     │
│  ○ Enabled   [toggle ON]            │
│  Reminder time:  [09:00 ▾]         │   ← time picker (future)
└─────────────────────────────────────┘
```

For MVP, just show an enabled/disabled toggle backed by the `reviewReminderEnabled` user preference key. The time picker can be added later once `reviewReminderTime` is in the preferences schema.

---

### Files Added / Modified (Push Notification Layer)

| File | Change |
|---|---|
| `prisma/schema.prisma` | Add `REVIEW_REMINDER` to `NotificationType` enum; add `lastReviewedAt DateTime?` to `User` model |
| `src/server/instrumentation/cron/scripts/send-review-reminders.ts` | New cron script |
| `src/server/instrumentation/cron/scripts/main-cron.ts` | Add daily 9 AM schedule for `sendReviewReminders` |
| `src/server/api/routers/user.ts` | Add `markReviewComplete` mutation (sets `lastReviewedAt`) |
| `public/sw-push.js` | Update `notificationclick` to handle `AT_RISK_REVIEW` type + deep-link + `postMessage` |
| `src/sw-custom.js` | Same update as `sw-push.js` |
| `src/components/core/AtRiskReview/useAtRiskReviewSession.ts` | Call `markReviewComplete` tRPC mutation on session end |
| `src/components/core/AtRiskReview/AtRiskReviewModal.tsx` | Read `?intent=review` param + SW `postMessage` listener to force-open |
| `src/components/settings/SettingsTabNotifications.tsx` | Add "Daily Review Reminder" toggle sub-section |
| `src/types/user-preferences.ts` | Add `reviewReminderEnabled` (and later `reviewReminderTime`) preference keys |

---

## Open Questions / Future Enhancements

- **Snooze per item**: Allow swiping up to snooze a specific item (skip for 1 day), tracked in localStorage per item ID.
- **Server-side session tracking**: Move the once-per-day gate to a `reviewSession` DB table for cross-device sync. The `lastReviewedAt` field on `User` is the stepping stone toward this — a full `ReviewSession` model could store per-session stats (items eaten, discarded, skipped) for analytics down the road.
- **Per-user preferred notification time**: Expose the `reviewReminderTime` preference in Settings so users can pick 8 AM vs. noon vs. evening. The hourly cron already runs every hour, so matching against user preference is just a string comparison.
- **Notification deep link to specific item**: When user taps a per-item `ITEM_EXPIRING` notification (the existing cron), deep-link into the review deck pre-filtered to that single item rather than the full queue.
- **Undo last swipe**: A floating "Undo" snackbar (using `sonner`) that appears for 3 seconds after a swipe, allowing the user to reverse the last decision before it's committed.
- **Batch commit vs. immediate**: Currently proposed as immediate per-card mutations. Could batch all decisions and commit on completion for fewer network requests — tradeoff is losing progress if the user closes mid-deck.
- **Notification action snooze**: The `snooze` notification action button would need a lightweight server endpoint (e.g. `/api/push/snooze`) that schedules a BullMQ delayed job to re-send the push 2 hours later. BullMQ is already installed.
- **Rich notification image**: Include the item type icon URL in the push payload so the OS notification shows the item's image (supported on Android Chrome via `image` field in `showNotification`).