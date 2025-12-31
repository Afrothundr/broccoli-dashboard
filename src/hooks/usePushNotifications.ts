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
      console.error("[Push Hook] Service workers not supported");
      toast.error("Push notifications are not supported in this browser");
      return;
    }

    if (!publicKey) {
      console.error("[Push Hook] VAPID public key not available");
      toast.error("VAPID public key not available");
      return;
    }

    console.log("[Push Hook] Starting subscription process");
    setIsLoading(true);

    try {
      // Request notification permission
      console.log("[Push Hook] Requesting notification permission");
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      console.log("[Push Hook] Permission result:", permissionResult);

      if (permissionResult !== "granted") {
        console.log("[Push Hook] Permission denied");
        toast.error("Notification permission denied");
        setIsLoading(false);
        return;
      }

      // Get service worker registration
      console.log("[Push Hook] Waiting for service worker to be ready");
      const registration = await navigator.serviceWorker.ready;
      console.log("[Push Hook] Service worker ready:", registration);

      // Subscribe to push notifications
      console.log("[Push Hook] Subscribing to push manager");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      console.log(
        "[Push Hook] Push subscription created:",
        subscription.endpoint,
      );

      // Send subscription to server
      console.log("[Push Hook] Sending subscription to server");
      const subscriptionData = subscription.toJSON();
      console.log("[Push Hook] Subscription data:", {
        endpoint: subscriptionData.endpoint,
        hasKeys: !!subscriptionData.keys,
      });

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscriptionData),
      });

      console.log("[Push Hook] Server response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Push Hook] Server error:", errorData);
        throw new Error(
          `Failed to save subscription: ${errorData.error || response.statusText}`,
        );
      }

      const responseData = await response.json();
      console.log("[Push Hook] Server response:", responseData);

      setIsSubscribed(true);
      toast.success("Push notifications enabled!");
    } catch (error) {
      console.error(
        "[Push Hook] Error subscribing to push notifications:",
        error,
      );
      toast.error(
        `Failed to enable push notifications: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
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
