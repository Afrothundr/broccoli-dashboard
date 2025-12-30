# Scripts

Utility scripts for the Broccoli Dashboard application.

## Expiring Items Notifications

### test-expiring-items-check.ts

Test script to manually trigger the expiring items notification check that normally runs hourly via cron.

**What it does:**
- Checks all users' items (or a specific user's items) for expiring items
- Shows which items are expiring soon based on warning threshold
- Indicates which notifications will be created
- Actually creates notifications and sends push notifications (when run without dry-run)

**Usage:**
```bash
# Check all users
bun scripts/test-expiring-items-check.ts

# Check specific user only
bun scripts/test-expiring-items-check.ts <userId>
```

**Example:**
```bash
bun scripts/test-expiring-items-check.ts clx1234567890
```

**Finding your userId:**
1. Open the app in a browser
2. Open the browser console (F12)
3. Run: `localStorage.getItem('userId')`
4. Or query the database directly

**Output includes:**
- User's notification preferences
- Warning threshold (default: 2 days)
- List of all FRESH/OLD items with expiration status
- Which items are expiring soon
- Which notifications already exist vs. will be created
- Summary statistics

**Prerequisites:**
1. Items in the database with expiration dates
2. Items must have status `FRESH` or `OLD`
3. Items must have an associated item type

**Testing tips:**
1. Add test items with expiration dates 1-2 days from now
2. Run the script to see which items trigger notifications
3. Check the notification bell in the app UI
4. Verify push notifications are sent (if subscribed)

## Push Notification Testing

### test-push-notification.ts

Test script to send a push notification to a specific user.

**Prerequisites:**
1. VAPID keys configured in `.env`
2. User has subscribed to push notifications in the app

**Usage:**
```bash
bun scripts/test-push-notification.ts <userId>
```

**Example:**
```bash
bun scripts/test-push-notification.ts clx1234567890
```

**Finding your userId:**
1. Open the app in a browser
2. Open the browser console (F12)
3. Run: `localStorage.getItem('userId')`
4. Or query the database directly

**What it does:**
- Finds all push subscriptions for the user
- Sends a test notification to each subscription
- Reports success/failure for each subscription
- Automatically removes invalid subscriptions

**Troubleshooting:**

If you get "No push subscriptions found":
1. Open the app
2. Go to Settings > Notifications
3. Click "Enable Push Notifications"
4. Grant permission when prompted
5. Try the script again

If you get "VAPID keys not found":
1. Generate keys: `npx web-push generate-vapid-keys`
2. Add to `.env`:
   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public_key>
   VAPID_PRIVATE_KEY=<private_key>
   VAPID_SUBJECT=mailto:your-email@example.com
   ```

