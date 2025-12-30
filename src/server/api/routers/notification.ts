import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const notificationRouter = createTRPCRouter({
  /**
   * Get paginated notifications for the current user
   */
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.number().optional(),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const notifications = await ctx.db.notification.findMany({
        where: {
          userId,
          ...(input.unreadOnly ? { read: false } : {}),
        },
        include: {
          item: {
            include: {
              itemTypes: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: number | undefined = undefined;
      if (notifications.length > input.limit) {
        const nextItem = notifications.pop();
        nextCursor = nextItem!.id;
      }

      return {
        notifications,
        nextCursor,
      };
    }),

  /**
   * Get count of unread notifications
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return await ctx.db.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }),

  /**
   * Mark a single notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      const notification = await ctx.db.notification.findUnique({
        where: { id: input.id },
      });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      if (notification.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this notification",
        });
      }

      return await ctx.db.notification.update({
        where: { id: input.id },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return await ctx.db.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }),

  /**
   * Delete a notification
   */
  deleteNotification: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      const notification = await ctx.db.notification.findUnique({
        where: { id: input.id },
      });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      if (notification.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this notification",
        });
      }

      return await ctx.db.notification.delete({
        where: { id: input.id },
      });
    }),

  /**
   * Delete all read notifications
   */
  deleteAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return await ctx.db.notification.deleteMany({
      where: {
        userId,
        read: true,
      },
    });
  }),
});

