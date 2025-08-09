import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { createReceipt, updateReceipt } from "@/types/receipt";

export const receiptRouter = createTRPCRouter({
	createReceipt: protectedProcedure
		.input(createReceipt)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			const receipt = await ctx.db.receipt.create({ data: input });
			if (!receipt) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Problem creating receipt",
				});
			}
			return receipt;
		}),
	updateReceipt: protectedProcedure
		.input(
		updateReceipt
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			const receipt = await ctx.db.receipt.update({
				where: { id: input.id },
				data: {
					...(input.scrapedData ? {scrapedData: input.scrapedData} : undefined),
					...(input.itemId ? {items: {
						connect: { id: input.itemId },
					}} : undefined),
				},
			});
			if (!receipt) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Problem updating receipt",
				});
			}
			return receipt;
		}),
});
