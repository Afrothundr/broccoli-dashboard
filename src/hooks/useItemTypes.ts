import { authClient } from "@/server/auth/client";
import { api } from "@/trpc/react";

export function useItemTypes() {
	const { data: session } = authClient.useSession();
	const { data, isLoading, isPending} = api.itemType.getItemTypes.useQuery(undefined, {
		enabled: !!session?.user,
	});
	const { data: allTypes, isLoading: isLoadingAllTypes } = api.itemType.getAllItemTypes.useQuery(undefined, {
		enabled: !!session?.user,
	});
	return {
		types: data ?? [],
		allTypes: allTypes ?? [],
		isLoading: isLoading || isLoadingAllTypes,
		isPending
	};
}
