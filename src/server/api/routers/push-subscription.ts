import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { serverEnv } from "@/env";

export const pushSubscriptionRouter = createTRPCRouter({
  /**
   * Get the VAPID public key for client-side subscription
   */
  getPublicKey: protectedProcedure.query(() => {
    return {
      publicKey: serverEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    };
  }),

  /**
   * Subscribe to push notifications
   */
  subscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().url(),
        p256dh: z.string(),
        auth: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if subscription already exists
      const existing = await ctx.db.pushSubscription.findFirst({
        where: {
          userId,
          endpoint: input.endpoint,
        },
      });

      if (existing) {
        // Update existing subscription
        return await ctx.db.pushSubscription.update({
          where: { id: existing.id },
          data: {
            p256dh: input.p256dh,
            auth: input.auth,
          },
        });
      }

      // Create new subscription
      return await ctx.db.pushSubscription.create({
        data: {
          userId,
          endpoint: input.endpoint,
          p256dh: input.p256dh,
          auth: input.auth,
        },
      });
    }),

  /**
   * Unsubscribe from push notifications
   */
  unsubscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const subscription = await ctx.db.pushSubscription.findFirst({
        where: {
          userId,
          endpoint: input.endpoint,
        },
      });

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      await ctx.db.pushSubscription.delete({
        where: { id: subscription.id },
      });

      return { success: true };
    }),

  /**
   * Get all subscriptions for the current user
   */
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return await ctx.db.pushSubscription.findMany({
      where: { userId },
      select: {
        id: true,
        endpoint: true,
        createdAt: true,
      },
    });
  }),
});
