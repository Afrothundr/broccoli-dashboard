import type { ItemStatusType } from "@/generated/prisma";
import type { CreateItemSchemaType, UpdateItemSchemaType } from "@/schemas/update-item";
import { authClient } from "@/server/auth/client";
import { api } from "@/trpc/react";

export function useItems(
	input: {
		search?: string;
		filters?: ItemStatusType[];
	} = {},
) {
	const { data: session } = authClient.useSession();
	const { data, isLoading, isPending } = api.item.getItems.useQuery(input, {
		enabled: !!session?.user,
	});
	const utils = api.useUtils();
	const updateItemMutation = api.item.updateItem.useMutation({
		onSuccess: () => {
			void utils.item.getItems.invalidate(input);
			void utils.groceryTrip.getTrips.invalidate();
		},
	});

	const createItemMutation = api.item.createItem.useMutation({
		onSuccess: () => {
			void utils.item.getItems.invalidate(input);
			void utils.groceryTrip.getTrips.refetch();
		},
	});


	const updateItem = (newValue: UpdateItemSchemaType) => {
		updateItemMutation.mutate(newValue);
	};
	const createItem = async (newValue: CreateItemSchemaType) => {
		return await createItemMutation.mutateAsync(newValue);
	};
	return {
		items: data ?? [],
		isLoading,
		updateItem,
		createItem,
		isPending
	};
}
