"use client";

import { Bell } from "lucide-react";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationList } from "./NotificationList";
import { useState } from "react";

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  const { data: unreadCount } = api.notification.getUnreadCount.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  );

  const { data: notificationsData } =
    api.notification.getNotifications.useQuery(
      {
        limit: 10,
        unreadOnly: false,
      },
      {
        enabled: open, // Only fetch when popover is open
      },
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unreadCount !== undefined && unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount !== undefined && unreadCount > 0 && (
            <span className="border-background absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 bg-red-700 px-1 text-[10px] leading-none font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationList
          notifications={notificationsData?.notifications || []}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
