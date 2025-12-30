"use client";

import { useEffect } from "react";

/**
 * Provider component that registers push notification handlers
 * Should be included in the root layout
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

    // Register service worker for push notifications
    const registerServiceWorker = async () => {
      try {
        // Check if there's already a service worker registered
        const existingRegistration =
          await navigator.serviceWorker.getRegistration();

        if (!existingRegistration) {
          // Register the push notification service worker
          console.log("[Push] Registering service worker...");
          const registration = await navigator.serviceWorker.register(
            "/sw-push.js",
            {
              scope: "/",
            },
          );
          console.log("[Push] Service Worker registered:", registration);
        } else {
          console.log("[Push] Service Worker already registered");
        }

        // Wait for service worker to be ready
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
        console.error("[Push] Service Worker registration failed:", error);
      }
    };

    registerServiceWorker();

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
