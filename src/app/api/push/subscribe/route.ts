import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { auth } from "@/server/auth";

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession(request);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the subscription from the request body
    const subscription = await request.json();

    // Validate the subscription object
    if (
      !subscription.endpoint ||
      !subscription.keys?.p256dh ||
      !subscription.keys?.auth
    ) {
      return NextResponse.json(
        { error: "Invalid subscription object" },
        { status: 400 },
      );
    }

    // Check if subscription already exists
    const existingSubscription = await db.pushSubscription.findUnique({
      where: {
        endpoint: subscription.endpoint,
      },
    });

    if (existingSubscription) {
      // Update the existing subscription if it belongs to a different user
      if (existingSubscription.userId !== session.user.id) {
        await db.pushSubscription.update({
          where: {
            endpoint: subscription.endpoint,
          },
          data: {
            userId: session.user.id,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Subscription already exists",
      });
    }

    // Create new subscription
    await db.pushSubscription.create({
      data: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription created successfully",
    });
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to push notifications" },
      { status: 500 },
    );
  }
}
