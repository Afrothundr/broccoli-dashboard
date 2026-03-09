import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function POST(request: NextRequest) {
	try {
		console.log("[Push Resubscribe API] Request received");

		// Get the current user session
		const session = await auth.api.getSession(request);
		console.log(
			"[Push Resubscribe API] Session:",
			session?.user?.id ? `User ID: ${session.user.id}` : "No session",
		);

		if (!session?.user?.id) {
			console.log("[Push Resubscribe API] Unauthorized - no session");
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse the body: { oldEndpoint, newSubscription: { endpoint, keys: { p256dh, auth } } }
		const body = await request.json();
		const { oldEndpoint, newSubscription } = body;

		console.log("[Push Resubscribe API] Resubscribe data:", {
			oldEndpoint: oldEndpoint
				? `${String(oldEndpoint).slice(0, 60)}...`
				: undefined,
			newEndpoint: newSubscription?.endpoint
				? `${String(newSubscription.endpoint).slice(0, 60)}...`
				: undefined,
			hasP256dh: !!newSubscription?.keys?.p256dh,
			hasAuth: !!newSubscription?.keys?.auth,
		});

		// Validate all required fields
		if (
			!oldEndpoint ||
			!newSubscription?.endpoint ||
			!newSubscription?.keys?.p256dh ||
			!newSubscription?.keys?.auth
		) {
			console.log("[Push Resubscribe API] Missing required fields");
			return NextResponse.json(
				{
					error:
						"Missing required fields: oldEndpoint, newSubscription.endpoint, newSubscription.keys.p256dh, newSubscription.keys.auth",
				},
				{ status: 400 },
			);
		}

		// Look up the existing subscription by old endpoint scoped to this user
		const existingSubscription = await db.pushSubscription.findFirst({
			where: {
				endpoint: oldEndpoint,
				userId: session.user.id,
			},
		});

		console.log(
			"[Push Resubscribe API] Existing subscription by old endpoint:",
			existingSubscription ? `ID: ${existingSubscription.id}` : "Not found",
		);

		if (existingSubscription) {
			// Update the existing record with the new endpoint and keys
			await db.pushSubscription.update({
				where: { id: existingSubscription.id },
				data: {
					endpoint: newSubscription.endpoint,
					p256dh: newSubscription.keys.p256dh,
					auth: newSubscription.keys.auth,
				},
			});
			console.log(
				"[Push Resubscribe API] Subscription updated successfully:",
				existingSubscription.id,
			);
		} else {
			// Old record not found (browser may have lost it) — create a fresh one.
			// Use upsert on the new endpoint in case the browser already sent a subscribe
			// event for the new endpoint on a different code path.
			await db.pushSubscription.upsert({
				where: { endpoint: newSubscription.endpoint },
				update: {
					userId: session.user.id,
					p256dh: newSubscription.keys.p256dh,
					auth: newSubscription.keys.auth,
				},
				create: {
					userId: session.user.id,
					endpoint: newSubscription.endpoint,
					p256dh: newSubscription.keys.p256dh,
					auth: newSubscription.keys.auth,
				},
			});
			console.log(
				"[Push Resubscribe API] No existing record found — upserted new subscription for new endpoint",
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(
			"[Push Resubscribe API] Error handling pushsubscriptionchange:",
			error,
		);
		return NextResponse.json(
			{ error: "Failed to resubscribe to push notifications" },
			{ status: 500 },
		);
	}
}
