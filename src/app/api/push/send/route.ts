import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import webpush from "web-push";

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:support@example.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { userId, title, message, data } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "userId, title, and message are required" },
        { status: 400 },
      );
    }

    // Check VAPID keys are configured
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error("VAPID keys not configured");
      return NextResponse.json(
        { error: "Push notifications not configured" },
        { status: 500 },
      );
    }

    // Get all push subscriptions for the user
    const subscriptions = await db.pushSubscription.findMany({
      where: {
        userId: userId,
      },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No push subscriptions found for this user" },
        { status: 404 },
      );
    }

    // Prepare the notification payload
    const payload = JSON.stringify({
      title,
      body: message,
      icon: "/web-app-manifest-192x192.png",
      badge: "/web-app-manifest-192x192.png",
      data: data || {},
    });

    // Send push notification to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          };

          await webpush.sendNotification(pushSubscription, payload);
          return { success: true, subscriptionId: subscription.id };
        } catch (error: any) {
          console.error(
            `Failed to send to subscription ${subscription.id}:`,
            error,
          );

          // If subscription is invalid (410 Gone), delete it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await db.pushSubscription.delete({
              where: { id: subscription.id },
            });
          }

          return {
            success: false,
            subscriptionId: subscription.id,
            error: error.message,
          };
        }
      }),
    );

    // Count successes and failures
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success,
    ).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      message: `Sent to ${successful} subscription(s)`,
      results: {
        total: results.length,
        successful,
        failed,
      },
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return NextResponse.json(
      { error: "Failed to send push notification" },
      { status: 500 },
    );
  }
}
