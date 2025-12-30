import { db } from "../db";
import { serverEnv } from "@/env";
import webpush from "web-push";

interface EmailNotification {
  to: string;
  subject: string;
  body: string;
}

interface PushNotification {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  serverEnv.VAPID_SUBJECT,
  serverEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  serverEnv.VAPID_PRIVATE_KEY,
);

export class NotificationService {
  /**
   * Send an email notification
   */
  async sendEmail(notification: EmailNotification): Promise<void> {
    // TODO: Implement actual email sending using a service like SendGrid, AWS SES, etc.
    console.log("Sending email:", notification);

    // For now, just log the notification
    // In production, you would integrate with an email service:
    // await emailClient.send({
    //   to: notification.to,
    //   subject: notification.subject,
    //   html: notification.body,
    // });
  }

  /**
   * Send a push notification
   */
  async sendPush(notification: PushNotification): Promise<void> {
    try {
      // Get all push subscriptions for the user
      const subscriptions = await db.pushSubscription.findMany({
        where: { userId: notification.userId },
      });

      if (subscriptions.length === 0) {
        console.log(
          `No push subscriptions found for user ${notification.userId}`,
        );
        return;
      }

      // Send notification to all user's devices
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        data: notification.data,
      });

      const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              payload,
            );
            console.log(`Push notification sent to subscription ${sub.id}`);
          } catch (error) {
            console.error(
              `Failed to send push to subscription ${sub.id}:`,
              error,
            );

            // If subscription is invalid (410 Gone), remove it
            if (
              error &&
              typeof error === "object" &&
              "statusCode" in error &&
              error.statusCode === 410
            ) {
              await db.pushSubscription.delete({ where: { id: sub.id } });
              console.log(`Removed invalid subscription ${sub.id}`);
            }
            throw error;
          }
        }),
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      console.log(
        `Push notifications sent: ${successful} successful, ${failed} failed`,
      );
    } catch (error) {
      console.error("Error sending push notification:", error);
      throw error;
    }
  }

  /**
   * Send notifications to multiple users
   */
  async sendBatch(
    notifications: Array<{
      userId: string;
      email?: EmailNotification;
      push?: Omit<PushNotification, "userId">;
    }>,
  ): Promise<void> {
    const results = await Promise.allSettled(
      notifications.map(async (notification) => {
        const promises: Promise<void>[] = [];

        if (notification.email) {
          promises.push(this.sendEmail(notification.email));
        }

        if (notification.push) {
          promises.push(
            this.sendPush({
              userId: notification.userId,
              ...notification.push,
            }),
          );
        }

        await Promise.all(promises);
      }),
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(
      `Batch notifications: ${successful} successful, ${failed} failed`,
    );
  }
}
