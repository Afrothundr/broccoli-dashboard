import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { auth } from "@/server/auth";

export async function POST(request: NextRequest) {
  try {
    console.log("[Push Subscribe API] Request received");

    // Get the current user session
    const session = await auth.api.getSession(request);
    console.log(
      "[Push Subscribe API] Session:",
      session?.user?.id ? `User ID: ${session.user.id}` : "No session",
    );

    if (!session?.user?.id) {
      console.log("[Push Subscribe API] Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the subscription from the request body
    const subscription = await request.json();
    console.log("[Push Subscribe API] Subscription data:", {
      endpoint: subscription.endpoint,
      hasP256dh: !!subscription.keys?.p256dh,
      hasAuth: !!subscription.keys?.auth,
    });

    // Validate the subscription object
    if (
      !subscription.endpoint ||
      !subscription.keys?.p256dh ||
      !subscription.keys?.auth
    ) {
      console.log("[Push Subscribe API] Invalid subscription object");
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
    console.log(
      "[Push Subscribe API] Existing subscription:",
      existingSubscription ? `ID: ${existingSubscription.id}` : "None",
    );

    if (existingSubscription) {
      // Update the existing subscription if it belongs to a different user
      if (existingSubscription.userId !== session.user.id) {
        console.log(
          "[Push Subscribe API] Updating subscription for different user",
        );
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
        console.log("[Push Subscribe API] Subscription updated successfully");
      } else {
        console.log(
          "[Push Subscribe API] Subscription already exists for same user - updating keys",
        );
        // Update the keys even if it's the same user (they might have changed)
        await db.pushSubscription.update({
          where: {
            endpoint: subscription.endpoint,
          },
          data: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        });
        console.log(
          "[Push Subscribe API] Subscription keys updated successfully",
        );
      }

      return NextResponse.json({
        success: true,
        message: "Subscription updated successfully",
      });
    }

    // Create new subscription
    console.log("[Push Subscribe API] Creating new subscription");
    const newSubscription = await db.pushSubscription.create({
      data: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });
    console.log(
      "[Push Subscribe API] Subscription created successfully:",
      newSubscription.id,
    );

    return NextResponse.json({
      success: true,
      message: "Subscription created successfully",
    });
  } catch (error) {
    console.error(
      "[Push Subscribe API] Error subscribing to push notifications:",
      error,
    );
    return NextResponse.json(
      { error: "Failed to subscribe to push notifications" },
      { status: 500 },
    );
  }
}
