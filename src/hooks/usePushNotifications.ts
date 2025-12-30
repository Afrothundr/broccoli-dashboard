"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

/**
 * Hook for managing push notification subscriptions
 */
export function usePushNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get VAPID public key from environment
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  // Check current permission status
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Check if user has an active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };

    void checkSubscription();
  }, []);

  /**
   * Convert base64 VAPID key to Uint8Array
   */
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  /**
   * Request notification permission and subscribe to push
   */
  const subscribe = useCallback(async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      toast.error("Push notifications are not supported in this browser");
      return;
    }

    if (!publicKey) {
      toast.error("VAPID public key not available");
      return;
    }

    setIsLoading(true);

    try {
      // Request notification permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        toast.error("Notification permission denied");
        setIsLoading(false);
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to server
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription");
      }

      setIsSubscribed(true);
      toast.success("Push notifications enabled!");
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      toast.error("Failed to enable push notifications");
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Send unsubscribe request to server
        const response = await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to remove subscription");
        }

        await subscription.unsubscribe();
        setIsSubscribed(false);
        toast.success("Push notifications disabled");
      }
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      toast.error("Failed to disable push notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
}
