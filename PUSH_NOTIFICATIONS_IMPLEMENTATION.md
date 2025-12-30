# Push Notifications Implementation

## Overview
This document describes the push notifications system implemented for the Broccoli Dashboard application.

## Components Implemented

### 1. Backend API Routes

#### `/api/push/subscribe` (POST)
- Subscribes a user to push notifications
- Stores the push subscription in the database
- Returns success/error status

#### `/api/push/unsubscribe` (POST)
- Unsubscribes a user from push notifications
- Removes the push subscription from the database
- Returns success/error status

#### `/api/push/send` (POST)
- Sends a push notification to a specific user
- Supports custom title, body, and data payload
- Uses web-push library to send notifications

### 2. Frontend Components

#### `NotificationBell` Component
- Displays a bell icon in the app header
- Shows unread notification count as a badge
- Opens a popover with recent notifications
- Allows marking notifications as read
- Provides link to view all notifications

#### `SettingsTabNotifications` Component
- Settings panel for managing notification preferences
- Shows push notification permission status
- Provides buttons to enable/disable push notifications
- Displays current subscription status

#### `PushNotificationProvider` Component
- Wraps the app to initialize push notification support
- Registers service worker message handlers
- Logs push notification events

### 3. Hooks

#### `usePushNotifications`
- Manages push notification subscription state
- Provides `subscribe()` and `unsubscribe()` functions
- Tracks permission status and loading states
- Handles errors and displays toast notifications

#### `useNotifications`
- Fetches notifications from the database
- Provides functions to mark notifications as read
- Supports pagination and filtering

### 4. Service Worker

#### `public/sw-push.js`
- Handles incoming push events
- Displays browser notifications
- Handles notification click events
- Opens/focuses the app when notification is clicked

### 5. Database Schema

#### `PushSubscription` Model
```prisma
model PushSubscription {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  endpoint  String   @unique
  p256dh    String
  auth      String

  @@index([userId])
  @@map("push_subscriptions")
}
```

#### `Notification` Model
```prisma
model Notification {
  id        Int              @id @default(autoincrement())
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemId    Int?
  item      Item?            @relation(fields: [itemId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  message   String
  read      Boolean          @default(false)
  readAt    DateTime?
  metadata  Json?

  @@index([userId, read])
  @@index([createdAt])
  @@map("notifications")
}
```

## Environment Variables Required

Add these to your `.env` file:

```env
# VAPID keys for push notifications
# Generate with: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

## Setup Instructions

### 1. Generate VAPID Keys

Run the following command to generate VAPID keys:

```bash
npx web-push generate-vapid-keys
```

### 2. Add Environment Variables

Copy the generated keys to your `.env` file:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public_key>
VAPID_PRIVATE_KEY=<private_key>
VAPID_SUBJECT=mailto:your-email@example.com
```

### 3. Run Database Migration

The migration has already been created. Run it with:

```bash
npm run db:deploy
```

### 4. Test Push Notifications

1. Start the development server: `npm run dev`
2. Navigate to Settings > Notifications
3. Click "Enable Push Notifications"
4. Grant permission when prompted
5. Test by sending a notification via the API

## Usage Example

### Sending a Push Notification

```typescript
// From a server action or API route
const response = await fetch('/api/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'user-id',
    title: 'Item Expiring Soon',
    body: 'Your milk will expire in 2 days',
    data: {
      itemId: 123,
      type: 'ITEM_EXPIRING'
    }
  })
});
```

### Using the Hook

```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications';

function MyComponent() {
  const { isSubscribed, subscribe, unsubscribe, permission } = usePushNotifications();

  return (
    <div>
      {permission === 'granted' && !isSubscribed && (
        <button onClick={subscribe}>Enable Notifications</button>
      )}
      {isSubscribed && (
        <button onClick={unsubscribe}>Disable Notifications</button>
      )}
    </div>
  );
}
```

## Browser Support

Push notifications are supported in:
- Chrome 50+
- Firefox 44+
- Safari 16+ (macOS 13+, iOS 16.4+)
- Edge 17+

## Security Considerations

1. VAPID keys should be kept secret
2. Push subscriptions are user-specific and stored securely
3. Notifications can only be sent to subscribed users
4. Service worker runs in a secure context (HTTPS required in production)

## Future Enhancements

- [ ] Add notification preferences (types, frequency)
- [ ] Implement notification grouping
- [ ] Add rich notifications with images
- [ ] Support notification actions (e.g., "Mark as eaten", "Remind me later")
- [ ] Add notification history/archive
- [ ] Implement notification scheduling

