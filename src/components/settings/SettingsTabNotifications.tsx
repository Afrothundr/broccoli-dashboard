"use client";

import { SettingsPanel } from "./SettingsPanel";
import { UserSettingSwitchCard } from "@/components/UserSettingSwitchCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SettingsTabNotifications() {
  const { permission, isSubscribed, isLoading, subscribe, unsubscribe } =
    usePushNotifications();

  const getPermissionStatus = () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "not-supported";
    }
    return permission;
  };

  const permissionStatus = getPermissionStatus();

  return (
    <SettingsPanel
      title="Notification Settings"
      description="Manage your notification preferences and push notification settings."
    >
      <div className="space-y-4">
        {/* General Notification Settings */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">General Notifications</h3>
          <UserSettingSwitchCard
            settingKey="notifications"
            label="Enable Notifications"
            description="Receive in-app notifications for important events."
          />
          <UserSettingSwitchCard
            settingKey="sound"
            label="Sound Effects"
            description="Play sounds for notifications and interactions."
          />
        </div>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Receive push notifications even when the app is closed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {permissionStatus === "not-supported" && (
              <Alert>
                <AlertDescription>
                  Push notifications are not supported in this browser.
                </AlertDescription>
              </Alert>
            )}

            {permissionStatus === "denied" && (
              <Alert>
                <AlertDescription>
                  Push notifications are blocked. Please enable them in your
                  browser settings.
                </AlertDescription>
              </Alert>
            )}

            {permissionStatus === "default" && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Enable push notifications to receive alerts even when the app
                  is closed.
                </p>
                <Button
                  onClick={subscribe}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enabling...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Enable Push Notifications
                    </>
                  )}
                </Button>
              </div>
            )}

            {permissionStatus === "granted" && (
              <div className="space-y-2">
                {isSubscribed ? (
                  <>
                    <Alert>
                      <AlertDescription className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Push notifications are enabled
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={unsubscribe}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Disabling...
                        </>
                      ) : (
                        <>
                          <BellOff className="mr-2 h-4 w-4" />
                          Disable Push Notifications
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground text-sm">
                      Push notifications are allowed but not active. Click below
                      to enable.
                    </p>
                    <Button
                      onClick={subscribe}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enabling...
                        </>
                      ) : (
                        <>
                          <Bell className="mr-2 h-4 w-4" />
                          Enable Push Notifications
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SettingsPanel>
  );
}
