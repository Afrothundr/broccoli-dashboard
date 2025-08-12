import { z } from "zod";
import { ItemStatusType, } from "@/generated/prisma/client";

export const getFilteredItems = z.object({
	search: z.string().optional(),
	filters: z.array(z.nativeEnum(ItemStatusType)).optional(),
});

export const updateItem = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().optional(),
	price: z.string(),
	quantity: z.number(),
	unit: z.string().optional(),
	groceryTripId: z.number(),
	importId: z.string().optional(),
	itemTypes: z.array(z.object({ id: z.number() })),
	percentConsumed: z.number(),
	status: z.nativeEnum(ItemStatusType)
});

export const createItem = z.object({
	name: z.string(),
	description: z.string().optional(),
	price: z.string(),
	quantity: z.number(),
	unit: z.string().optional(),
	groceryTripId: z.number(),
	importId: z.string().optional(),
	itemTypes: z.array(z.object({ id: z.number() })),
	percentConsumed: z.number(),
	status: z.nativeEnum(ItemStatusType)
});
