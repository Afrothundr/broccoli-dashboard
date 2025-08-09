import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const itemTypeRouter = createTRPCRouter({
	getItemTypes: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		if (!userId) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		const types = await ctx.db.itemType.findMany({
			orderBy: { createdAt: "asc" },
			where: {
				items: { every: { userId } },
			},
			include: {
				items: { include: { groceryTrip: true } },
			},
		});

		return types;
	}),
});
