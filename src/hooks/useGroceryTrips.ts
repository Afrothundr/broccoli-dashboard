import { authClient } from "@/server/auth/client";
import { api } from "@/trpc/react";

export function useGroceryTrips() {
	const { data: session } = authClient.useSession();
	const { data, isLoading } = api.groceryTrip.getTrips.useQuery(undefined, {
		enabled: !!session?.user,
	});
	return {
		trips: data ?? [],
		isLoading,
	};
}
