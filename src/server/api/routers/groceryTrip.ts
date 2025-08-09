import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { createGroceryTrip } from "@/types/groceryTrip";

export const groceryTripRouter = createTRPCRouter({
	getTrips: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		if (!userId) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		const trips = await ctx.db.groceryTrip.findMany({
			orderBy: [
				{
					createdAt: "desc",
				},
			],
			where: { userId },
			select: {
				id: true,
				name: true,
				createdAt: true,
				receipts: {
					select: {
						groceryTripId: true,
						id: true,
						url: true,
						createdAt: true,
						status: true,
						scrapedData: true,
						items: {
							select: {
								id: true,
								importId: true,
							},
						},
					},
				},
				items: {
					select: {
						id: true,
						name: true,
						price: true,
						percentConsumed: true,
						createdAt: true,
						status: true,
						quantity: true,
						groceryTripId: true,
						itemTypes: {
							select: {
								id: true,
								name: true,
								category: true,
							},
						},
					},
      orderBy: {	
        createdAt: 'desc',
      },
				},
			},
		});

		return trips;
	}),
	createTrip: protectedProcedure
		.input(createGroceryTrip)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const trip = ctx.db.groceryTrip.create({
				data: {
					...input,
					userId,
				},
			});

			if (!trip) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Problem creating grocery trip",
				});
			}
			return trip;
		}),
});
