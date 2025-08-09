import { authClient } from "@/server/auth/client";
import { api } from "@/trpc/react";
import type { CreateGroceryTripType } from "@/types/groceryTrip";
import type { CreateReceiptType, UpdateReceiptType } from "@/types/receipt";

export function useGroceryTrips() {
	const { data: session } = authClient.useSession();
	const { data, isLoading, refetch, isPending, isSuccess } = api.groceryTrip.getTrips.useQuery(undefined, {
		enabled: !!session?.user,
	});
	const utils = api.useUtils();
	const createGroceryTripMutation = api.groceryTrip.createTrip.useMutation({
		onSuccess: () => {
			void utils.groceryTrip.getTrips.invalidate();
		},
	});
	const createReceiptMutation = api.receipt.createReceipt.useMutation({
		onSuccess: async () => {
			void utils.groceryTrip.getTrips.invalidate();
		},
	});
	const updateReceiptMutation = api.receipt.updateReceipt.useMutation({
		onSuccess: async () => {
			void utils.groceryTrip.getTrips.invalidate();
		},
	});

	const createTrip = async (trip: CreateGroceryTripType) => {
		return await createGroceryTripMutation.mutateAsync(trip);
	};
	const createReceipt = async (receipt: CreateReceiptType) => {
		return await createReceiptMutation.mutateAsync(receipt);
	};
	const updateReceipt = async (receipt: UpdateReceiptType) => {
		return await updateReceiptMutation.mutateAsync(receipt);
	};
	return {
		trips: data ?? [],
		isLoading: isLoading || createGroceryTripMutation.isPending || createReceiptMutation.isPending || updateReceiptMutation.isPending,
		createTrip,
		createReceipt,
		updateReceipt,
		refetch,
		isPending,
		isSuccess
	};
}
