/**
 * Push Notification Handlers for Service Worker
 * This file is imported by the main service worker to handle push notifications
 */

// Listen for push events
self.addEventListener('push', function(event) {
  console.log('[SW Push] Push Received.', event);

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
      console.log('[SW Push] Parsed push data:', data);
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
      console.error('[SW Push] Error parsing push data:', error);
    }
  }

  console.log('[SW Push] Showing notification with data:', notificationData);

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    notificationData
  ).then(() => {
    console.log('[SW Push] Notification shown successfully');
  }).catch((error) => {
    console.error('[SW Push] Error showing notification:', error);
  });

  event.waitUntil(promiseChain);
});

// Listen for notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[SW Push] Notification click received.');

  event.notification.close();

  // Determine the URL to open
  let urlToOpen = '/app';
  
  if (event.notification.data && event.notification.data.itemId) {
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
        if (client.url.includes('/app') && 'focus' in client) {
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

console.log('[SW Push] Push notification handlers loaded.');

