import { z } from "zod";

export const createGroceryTrip = z.object({
	name: z.string(),
	description: z.string().optional(),
});

export type CreateGroceryTripType = z.infer<typeof createGroceryTrip>;
