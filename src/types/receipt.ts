import { z } from "zod";

export const createReceipt = z.object({
	url: z.string(),
	groceryTripId: z.number(),
});

export const updateReceipt = z.object({
  id: z.number(),
  itemId: z.number().optional(),
  scrapedData: z.string().optional(),
});


export type CreateReceiptType = z.infer<typeof createReceipt>;
export type UpdateReceiptType = z.infer<typeof updateReceipt>;
