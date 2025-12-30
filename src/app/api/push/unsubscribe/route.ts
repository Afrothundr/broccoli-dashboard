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

    // Parse the endpoint from the request body
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint is required" },
        { status: 400 },
      );
    }

    // Delete the subscription
    const deleted = await db.pushSubscription.deleteMany({
      where: {
        userId: session.user.id,
        endpoint: endpoint,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Unsubscribed successfully",
    });
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe from push notifications" },
      { status: 500 },
    );
  }
}
