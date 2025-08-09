import { authClient } from "@/server/auth/client";
import { api } from "@/trpc/react";

export function useItemTypes() {
	const { data: session } = authClient.useSession();
	const { data, isLoading, isPending} = api.itemType.getItemTypes.useQuery(undefined, {
		enabled: !!session?.user,
	});
	return {
		types: data ?? [],
		isLoading,
		isPending
	};
}
