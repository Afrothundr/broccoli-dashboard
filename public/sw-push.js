/**
 * Push Notification Handlers for Service Worker
 * This file is imported by the main service worker to handle push notifications
 */

// Listen for push events
self.addEventListener("push", (event) => {
  console.log("[SW Push] Push Received.", event);

  let notificationData = {
    title: "Broccoli Dashboard",
    body: "You have a new notification",
    icon: "/web-app-manifest-192x192.png",
    badge: "/web-app-manifest-192x192.png",
    data: {},
  };

  if (event.data) {
    try {
      const data = event.data.json();
      console.log("[SW Push] Parsed push data:", data);
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        data: data.data || {},
        tag:
          data.data?.type === "AT_RISK_REVIEW"
            ? "at-risk-review"
            : data.data?.itemId
              ? `item-${data.data.itemId}`
              : "notification",
        requireInteraction: false,
        vibrate: [200, 100, 200],
      };
    } catch (error) {
      console.error("[SW Push] Error parsing push data:", error);
    }
  }

  console.log("[SW Push] Showing notification with data:", notificationData);

  const promiseChain = self.registration
    .showNotification(notificationData.title, notificationData)
    .then(() => {
      console.log("[SW Push] Notification shown successfully");
    })
    .catch((error) => {
      console.error("[SW Push] Error showing notification:", error);
    });

  event.waitUntil(promiseChain);
});

// Listen for notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW Push] Notification click received.");
  event.notification.close();

  const data = event.notification.data || {};
  const urlToOpen =
    data.type === "AT_RISK_REVIEW" ? "/app?intent=review" : "/app";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url.includes("/app") && "focus" in client) {
            if (data.type === "AT_RISK_REVIEW") {
              client.postMessage({ type: "OPEN_AT_RISK_REVIEW" });
            }
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

// Listen for push subscription changes
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("[SW Push] Push subscription changed.");

  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          event.oldSubscription.options.applicationServerKey,
      })
      .then((subscription) => {
        console.log("[SW Push] Resubscribed to push notifications.");

        // Send the new subscription to the server
        return fetch("/api/push/resubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldEndpoint: event.oldSubscription.endpoint,
            newSubscription: subscription.toJSON(),
          }),
        });
      }),
  );
});

console.log("[SW Push] Push notification handlers loaded.");
