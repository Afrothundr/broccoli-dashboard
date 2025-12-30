# Push Notifications Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser Client                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │ NotificationBell │         │ Settings Panel   │             │
│  │   Component      │         │   Component      │             │
│  └────────┬─────────┘         └────────┬─────────┘             │
│           │                            │                        │
│           │                            │                        │
│  ┌────────▼────────────────────────────▼─────────┐             │
│  │      usePushNotifications Hook                │             │
│  │  - subscribe()                                │             │
│  │  - unsubscribe()                              │             │
│  │  - permission state                           │             │
│  └────────┬──────────────────────────────────────┘             │
│           │                                                     │
│           │                                                     │
│  ┌────────▼──────────────────────────────────────┐             │
│  │         Service Worker (sw.js)                │             │
│  │  - Push event listener                        │             │
│  │  - Notification click handler                 │             │
│  │  - Background sync                            │             │
│  └───────────────────────────────────────────────┘             │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ HTTPS
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                      Next.js Server                               │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    API Routes                            │    │
│  │                                                          │    │
│  │  POST /api/push/subscribe                               │    │
│  │  ├─ Validate subscription                               │    │
│  │  ├─ Store in database                                   │    │
│  │  └─ Return success                                      │    │
│  │                                                          │    │
│  │  POST /api/push/unsubscribe                             │    │
│  │  ├─ Find subscription                                   │    │
│  │  ├─ Delete from database                                │    │
│  │  └─ Return success                                      │    │
│  │                                                          │    │
│  │  POST /api/push/send                                    │    │
│  │  ├─ Get user subscriptions                              │    │
│  │  ├─ Send via web-push                                   │    │
│  │  ├─ Create notification record                          │    │
│  │  └─ Return results                                      │    │
│  │                                                          │    │
│  └──────────────────────┬───────────────────────────────────┘    │
│                         │                                        │
│                         │                                        │
│  ┌──────────────────────▼───────────────────────────────────┐   │
│  │                  Database (PostgreSQL)                    │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │ PushSubscription                                │     │   │
│  │  │  - id                                           │     │   │
│  │  │  - userId                                       │     │   │
│  │  │  - endpoint                                     │     │   │
│  │  │  - p256dh (encryption key)                      │     │   │
│  │  │  - auth (authentication secret)                 │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │ Notification                                    │     │   │
│  │  │  - id                                           │     │   │
│  │  │  - userId                                       │     │   │
│  │  │  - type (ITEM_EXPIRING, etc.)                   │     │   │
│  │  │  - title                                        │     │   │
│  │  │  - message                                      │     │   │
│  │  │  - read                                         │     │   │
│  │  │  - metadata                                     │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                           │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                           │
                           │
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                  Push Service (Browser Vendor)                    │
│                                                                   │
│  - Chrome: Firebase Cloud Messaging (FCM)                        │
│  - Firefox: Mozilla Push Service                                 │
│  - Safari: Apple Push Notification Service (APNs)                │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Subscription Flow

```
User clicks "Enable Notifications"
    │
    ▼
usePushNotifications.subscribe()
    │
    ├─ Request permission from browser
    │
    ├─ Get service worker registration
    │
    ├─ Subscribe to push manager
    │   (with VAPID public key)
    │
    ├─ Receive subscription object
    │   {
    │     endpoint: "https://...",
    │     keys: {
    │       p256dh: "...",
    │       auth: "..."
    │     }
    │   }
    │
    ▼
POST /api/push/subscribe
    │
    ├─ Validate subscription
    │
    ├─ Store in database
    │   (userId, endpoint, p256dh, auth)
    │
    ▼
Success! User is subscribed
```

### 2. Sending Notification Flow

```
Trigger event (e.g., item expiring)
    │
    ▼
POST /api/push/send
    │
    ├─ Get user's push subscriptions
    │   from database
    │
    ├─ Create notification record
    │   in database
    │
    ├─ For each subscription:
    │   │
    │   ├─ Prepare payload
    │   │   {
    │   │     title: "Item Expiring",
    │   │     body: "Milk expires in 2 days",
    │   │     data: { itemId: 123 }
    │   │   }
    │   │
    │   ├─ Sign with VAPID keys
    │   │
    │   ├─ Send to push service
    │   │   (FCM, Mozilla, APNs)
    │   │
    │   └─ Handle response
    │       (remove if expired)
    │
    ▼
Push service delivers to browser
    │
    ▼
Service worker receives 'push' event
    │
    ├─ Parse notification data
    │
    ├─ Show notification
    │   self.registration.showNotification()
    │
    ▼
User sees notification!
```

### 3. Notification Click Flow

```
User clicks notification
    │
    ▼
Service worker 'notificationclick' event
    │
    ├─ Close notification
    │
    ├─ Extract data (itemId, etc.)
    │
    ├─ Find open app window
    │   │
    │   ├─ If found: focus window
    │   │
    │   └─ If not found: open new window
    │
    ▼
User is taken to the app
```

## Security

### VAPID (Voluntary Application Server Identification)

```
┌─────────────────────────────────────────────────────────────┐
│                      VAPID Keys                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Public Key (NEXT_PUBLIC_VAPID_PUBLIC_KEY)                  │
│  ├─ Shared with browser                                     │
│  ├─ Used to subscribe to push                               │
│  └─ Safe to expose publicly                                 │
│                                                              │
│  Private Key (VAPID_PRIVATE_KEY)                            │
│  ├─ Kept secret on server                                   │
│  ├─ Used to sign push messages                              │
│  └─ NEVER expose to client                                  │
│                                                              │
│  Subject (VAPID_SUBJECT)                                    │
│  ├─ Contact email (mailto:...)                              │
│  └─ Identifies your application                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Encryption

All push messages are encrypted end-to-end:
1. Browser generates encryption keys (p256dh, auth)
2. Server encrypts payload with these keys
3. Only the browser can decrypt the message
4. Push service cannot read message content

## Components Interaction

```
┌──────────────────┐
│ NotificationBell │
└────────┬─────────┘
         │
         ├─ useNotifications()
         │  └─ Fetches from database
         │
         └─ Displays unread count
            and recent notifications

┌──────────────────┐
│ Settings Panel   │
└────────┬─────────┘
         │
         ├─ usePushNotifications()
         │  ├─ subscribe()
         │  ├─ unsubscribe()
         │  └─ permission state
         │
         └─ Shows subscription status
            and enable/disable buttons

┌──────────────────┐
│ Cron Job         │
└────────┬─────────┘
         │
         ├─ Check expiring items
         │
         ├─ Create notifications
         │
         └─ POST /api/push/send
            └─ Sends push to users
```

