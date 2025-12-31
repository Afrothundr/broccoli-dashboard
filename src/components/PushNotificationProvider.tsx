"use client";

import { useEffect } from "react";

/**
 * Provider component that sets up push notification handlers
 * Should be included in the root layout
 * Note: The service worker is registered by next-pwa, we just wait for it to be ready
 */
export function PushNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Wait for the PWA service worker to be ready
    const setupPushNotifications = async () => {
      try {
        // Wait for service worker to be ready (registered by next-pwa)
        const registration = await navigator.serviceWorker.ready;
        console.log(
          "[Push] Service Worker ready, push notifications available",
        );

        // Check if push notifications are supported
        if (!("PushManager" in window)) {
          console.warn("[Push] Push notifications are not supported");
          return;
        }

        console.log("[Push] Push notifications are supported");
      } catch (error) {
        console.error("[Push] Service Worker setup failed:", error);
      }
    };

    setupPushNotifications();

    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      console.log("[Push] Message from service worker:", event.data);

      // Handle different message types
      if (event.data && event.data.type === "PUSH_RECEIVED") {
        console.log("[Push] Push notification received:", event.data.payload);
      }
    });
  }, []);

  return <>{children}</>;
}
