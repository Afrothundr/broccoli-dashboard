import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const groceryTripRouter = createTRPCRouter({
	getTrips: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		if (!userId) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		const trips = await ctx.db.groceryTrip.findMany({
			where: { userId },
			select: {
				id: true,
				name: true,
				createdAt: true,
				items: {
					select: {
						id: true,
						name: true,
						price: true,
						percentConsumed: true,
						createdAt: true,
						status: true,
						itemTypes: {
							select: {
								name: true,
								category: true,
							},
						},
					},
				},
			},
		});

		return trips;
	}),
});
