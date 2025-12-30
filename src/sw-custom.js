/**
 * Custom Service Worker for Push Notifications
 * This file adds push notification handling to the PWA service worker
 */

// Listen for push events
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  
  let notificationData = {
    title: 'Broccoli Dashboard',
    body: 'You have a new notification',
    icon: '/web-app-manifest-192x192.png',
    badge: '/web-app-manifest-192x192.png',
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        data: data.data || {},
        tag: data.data?.itemId ? `item-${data.data.itemId}` : 'notification',
        requireInteraction: false,
        vibrate: [200, 100, 200],
      };
    } catch (error) {
      console.error('[Service Worker] Error parsing push data:', error);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    notificationData
  );

  event.waitUntil(promiseChain);
});

// Listen for notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click received.');

  event.notification.close();

  // Determine the URL to open
  let urlToOpen = '/app';
  
  if (event.notification.data && event.notification.data.itemId) {
    // If there's an item ID, we could navigate to a specific item page
    // For now, just go to the main app page
    urlToOpen = '/app';
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Listen for push subscription changes
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[Service Worker] Push subscription changed.');
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription.options.applicationServerKey
    }).then(function(subscription) {
      console.log('[Service Worker] Resubscribed to push notifications.');
      
      // Send the new subscription to the server
      return fetch('/api/push/resubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldEndpoint: event.oldSubscription.endpoint,
          newSubscription: subscription.toJSON()
        })
      });
    })
  );
});

console.log('[Service Worker] Custom push notification handlers loaded.');

