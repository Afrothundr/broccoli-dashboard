"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, CheckCircle, XCircle, AlertCircle } from "lucide-react";

/**
 * Debug panel for push notifications
 * Shows current status and allows testing
 */
export function PushNotificationDebug() {
  const { permission, isSubscribed, isLoading, subscribe, unsubscribe } =
    usePushNotifications();

  const getPermissionBadge = () => {
    switch (permission) {
      case "granted":
        return (
          <Badge color="green">
            <CheckCircle className="mr-1 h-3 w-3" /> Granted
          </Badge>
        );
      case "denied":
        return (
          <Badge color="red">
            <XCircle className="mr-1 h-3 w-3" /> Denied
          </Badge>
        );
      case "default":
        return (
          <Badge color="yellow">
            <AlertCircle className="mr-1 h-3 w-3" /> Not Asked
          </Badge>
        );
      default:
        return (
          <Badge color="gray" variant="outline">
            Not Supported
          </Badge>
        );
    }
  };

  const testNotification = async () => {
    if (!("Notification" in window)) {
      alert("Notifications not supported");
      return;
    }

    if (Notification.permission !== "granted") {
      alert("Please grant notification permission first");
      return;
    }

    // Show a test notification
    new Notification("🧪 Test Notification", {
      body: "This is a local test notification",
      icon: "/web-app-manifest-192x192.png",
      badge: "/web-app-manifest-192x192.png",
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notification Debug
        </CardTitle>
        <CardDescription>
          Current status and testing tools for push notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Permission</p>
              {getPermissionBadge()}
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Subscription</p>
              {isSubscribed ? (
                <Badge color="green">
                  <CheckCircle className="mr-1 h-3 w-3" /> Active
                </Badge>
              ) : (
                <Badge color="gray">
                  <BellOff className="mr-1 h-3 w-3" /> Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Browser Support */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Browser Support</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              {typeof window !== "undefined" && "Notification" in window ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Notification API</span>
            </div>
            <div className="flex items-center gap-2">
              {typeof window !== "undefined" && "serviceWorker" in navigator ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Service Worker</span>
            </div>
            <div className="flex items-center gap-2">
              {typeof window !== "undefined" && "PushManager" in window ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Push Manager</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Actions</h3>
          <div className="flex flex-wrap gap-2">
            {!isSubscribed && permission !== "denied" && (
              <Button onClick={subscribe} disabled={isLoading} size="sm">
                <Bell className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            )}
            {isSubscribed && (
              <Button
                onClick={unsubscribe}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <BellOff className="mr-2 h-4 w-4" />
                Unsubscribe
              </Button>
            )}
            <Button onClick={testNotification} variant="secondary" size="sm">
              Test Local Notification
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted rounded-lg p-4 text-sm">
          <p className="mb-2 font-medium">Testing Instructions:</p>
          <ol className="text-muted-foreground list-inside list-decimal space-y-1">
            <li>Click "Subscribe" to enable push notifications</li>
            <li>Grant permission when prompted</li>
            <li>Use the test script to send a push notification</li>
            <li>Check that you receive the notification</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
