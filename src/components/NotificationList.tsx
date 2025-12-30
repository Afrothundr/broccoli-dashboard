"use client";

import {
  CheckCircle,
  Trash2,
  CheckCheck,
  MoreHorizontal,
  BellOff,
} from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Notification, Item, ItemType } from "@/generated/prisma";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface NotificationWithItem extends Notification {
  item: (Item & { itemTypes: ItemType[] }) | null;
}

interface NotificationListProps {
  notifications: NotificationWithItem[];
  onClose?: () => void;
}

interface NotificationItemProps {
  notification: NotificationWithItem;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  isMarkingAsRead?: boolean;
  isDeleting?: boolean;
}

export function NotificationList({
  notifications,
  onClose,
}: NotificationListProps) {
  const utils = api.useUtils();

  const markAsReadMutation = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      void utils.notification.getUnreadCount.invalidate();
      void utils.notification.getNotifications.invalidate();
    },
  });

  const markAllAsReadMutation = api.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      void utils.notification.getUnreadCount.invalidate();
      void utils.notification.getNotifications.invalidate();
    },
  });

  const deleteNotificationMutation =
    api.notification.deleteNotification.useMutation({
      onSuccess: () => {
        void utils.notification.getUnreadCount.invalidate();
        void utils.notification.getNotifications.invalidate();
      },
    });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate({ id });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (id: number) => {
    deleteNotificationMutation.mutate({ id });
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle className="text-muted-foreground mb-2 h-12 w-12" />
        <p className="text-muted-foreground text-sm">No notifications</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="bg-card border-border w-full max-w-md overflow-hidden rounded-lg border shadow-lg">
      {/* Header */}
      <div className="border-border bg-muted/30 flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge color="primary" className="h-6 px-2">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && handleMarkAllAsRead && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="h-4 w-4" />
            <span className="text-xs">Mark all read</span>
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <ScrollArea className="h-[400px]">
          <div className="divide-border divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
          <div className="bg-muted mb-4 rounded-full p-4">
            <BellOff className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mb-1 text-sm font-semibold">No notifications</h3>
          <p className="text-muted-foreground text-xs">You're all caught up!</p>
        </div>
      )}
    </div>
  );
}

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  isMarkingAsRead = false,
  isDeleting = false,
}: NotificationItemProps) => {
  return (
    <div
      className={cn(
        "group hover:bg-accent/50 border-border relative flex gap-3 border-b p-4 transition-all duration-200 last:border-0",
        !notification.read && "bg-accent/30",
      )}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="bg-primary absolute top-0 bottom-0 left-0 w-1" />
      )}

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-2 pl-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm leading-none font-semibold text-balance">
                {notification.title}
              </h4>
              {!notification.read && (
                <Badge
                  variant="default"
                  className="h-5 px-1.5 text-[10px]"
                  color="primary"
                >
                  New
                </Badge>
              )}
            </div>
          </div>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
          {notification.message}
        </p>

        <time className="text-muted-foreground text-xs">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </time>
      </div>

      {/* Actions - Desktop */}
      <div className="hidden flex-col gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:flex">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary/10 hover:text-primary h-8 w-8"
            onClick={() => onMarkAsRead(notification.id)}
            disabled={isMarkingAsRead}
            aria-label="Mark as read"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
          onClick={() => onDelete(notification.id)}
          disabled={isDeleting}
          aria-label="Delete notification"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Actions - Mobile Dropdown */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Notification actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!notification.read && (
              <DropdownMenuItem
                onClick={() => onMarkAsRead(notification.id)}
                disabled={isMarkingAsRead}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as read
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(notification.id)}
              disabled={isDeleting}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
