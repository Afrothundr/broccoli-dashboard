import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { createItem, getFilteredItems, updateItem } from "@/types/item";
import { z } from "zod";

export const itemRouter = createTRPCRouter({
  getItems: protectedProcedure
    .input(getFilteredItems)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { search, filters } = input;

      const items = await ctx.db.item.findMany({
        orderBy: [
          {
            status: "asc",
          },
        ],
        where: {
          userId,
          OR: [
            {
              itemTypes: {
                some: {
                  name: {
                    search: search
                      ? search?.trim().split(" ").join(" | ")
                      : undefined,
                  },
                },
              },
            },
            {
              name: {
                search: search
                  ? search?.trim().split(" ").join(" | ")
                  : undefined,
              },
            },
          ],
          status: filters?.length ? { in: filters } : undefined,
        },
        include: {
          itemTypes: {
            select: {
              id: true,
              name: true,
              storage_advice: true,
            },
          },
        },
      });

      return items;
    }),
  updateItem: protectedProcedure
    .input(updateItem)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const itemToUpdate = await ctx.db.item.findUnique({
        where: { id: input.id },
        include: { itemTypes: true },
      });

      if (!itemToUpdate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      const { itemTypes, percentConsumed, status, price, ...rest } = input;

      const updatedItem = await ctx.db.item.update({
        where: { id: input.id },
        data: {
          ...rest,
          price: Number.parseFloat(price),
          percentConsumed,
          status: percentConsumed === 100 ? "EATEN" : status,
          itemTypes: {
            disconnect: itemToUpdate.itemTypes.map((types) => ({
              id: types.id,
            })),
            connect: itemTypes.map((types) => ({ id: types.id })),
          },
        },
      });

      if (!itemToUpdate) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Problem updating item and associated types",
        });
      }

      return updatedItem;
    }),
  createItem: protectedProcedure
    .input(createItem)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const { itemTypes, price, ...rest } = input;

      const createdItem = await ctx.db.item.create({
        data: {
          ...rest,
          price: Number.parseFloat(price),
          quantity: 1,
          percentConsumed: 0,
          status: "FRESH",
          userId,
          itemTypes: {
            connect: itemTypes.map((type) => ({ id: type.id })),
          },
        },
      });

      if (!createdItem) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Problem creating item and linking associated types",
        });
      }

      return createdItem;
    }),
  deleteItem: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Verify the item belongs to the user
      const item = await ctx.db.item.findUnique({
        where: { id: input.id },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      if (item.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this item",
        });
      }

      // Delete the item
      await ctx.db.item.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
