import z from "zod";
import { getNameSchema } from "./shared-schemas";
import { ItemStatusType } from "@/generated/prisma/client";

export const updateItemSchema = z.object({
	id: z.number(),
	name: getNameSchema(),
	description: z.string().optional(),
	price: z.string(),
	quantity: z.number(),
	unit: z.string().optional(),
	groceryTripId: z.number(),
	importId: z.string().optional(),
	itemTypes: z
		.array(z.object({ id: z.number() }))
		.min(1, "At least one item type is required"),
	percentConsumed: z.number(),
	status: z.nativeEnum(ItemStatusType),
});

export const updateItemFormSchema = z.object({
	id: z.number().optional(),
	name: getNameSchema(),
	description: z.string().optional(),
	price: z.string(),
	quantity: z.number().optional(),
	unit: z.string().optional(),
	groceryTripId: z.number().optional(),
	importId: z.string().optional(),
	itemTypes: z
		.array(z.object({ id: z.number() }))
		.min(1, "At least one item type is required"),
	percentConsumed: z.number().optional(),
	status: z.nativeEnum(ItemStatusType).optional(),
});


export const createItemSchema = z.object({
	name: getNameSchema(),
	description: z.string().optional(),
	price: z.string(),
	quantity: z.number(),
	unit: z.string().optional(),
	groceryTripId: z.number(),
	importId: z.string().optional(),
	itemTypes: z
		.array(z.object({ id: z.number() }))
		.min(1, "At least one item type is required"),
	percentConsumed: z.number(),
	status: z.nativeEnum(ItemStatusType),
});

export type UpdateItemSchemaType = z.infer<typeof updateItemSchema>;
export type CreateItemSchemaType = z.infer<typeof createItemSchema>;
export type UpdateItemFormSchemaType = z.infer<typeof updateItemFormSchema>;
