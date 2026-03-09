import { useCallback, useEffect, useRef, useState } from "react";
import type { CombinedItemType } from "@/components/core/Inventory";
import type { ItemStatusType } from "@/generated/prisma/client";
import { api } from "@/trpc/react";
import { getDaysUntilExpiration } from "@/utils/expiration";

export type ReviewDecision =
  | { type: "eaten" }
  | { type: "discarded" }
  | { type: "updated"; percentConsumed: number; status?: ItemStatusType }
  | { type: "skipped" };

export interface ReviewResult {
  itemId: number;
  decision: ReviewDecision;
}

export function useAtRiskReview() {
  const utils = api.useUtils();

  const { data: atRiskData, isLoading } = api.item.getAtRiskItems.useQuery(
    undefined,
    {
      // staleTime keeps the data stable while the user is mid-session
      staleTime: 5 * 60 * 1000,
    },
  );

  // Queue is initialised once from the query result — never reset on refetch
  const [queue, setQueue] = useState<CombinedItemType[]>([]);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const initialised = useRef(false);

  useEffect(() => {
    if (!atRiskData || initialised.current) return;

    const filtered = (atRiskData as CombinedItemType[]).filter((item) => {
      if (item.status === "BAD" || item.status === "OLD") return true;
      if (item.status === "FRESH") return getDaysUntilExpiration(item) <= 3;
      return false;
    });

    if (filtered.length > 0) {
      setQueue(filtered);
      initialised.current = true;
    }
  }, [atRiskData]);

  const updateItemMutation = api.item.updateItem.useMutation({
    onSuccess: () => {
      void utils.item.getItems.invalidate();
    },
  });

  const advance = useCallback(
    (itemId: number, decision: ReviewDecision) => {
      // Pop item from queue regardless of decision
      setQueue((prev) => prev.filter((i) => i.id !== itemId));
      setResults((prev) => [...prev, { itemId, decision }]);

      if (decision.type === "skipped") {
        // No mutation for skipped items
        return;
      }

      // Find the full item so we can spread all required fields
      const item = (atRiskData as CombinedItemType[] | undefined)?.find(
        (i) => i.id === itemId,
      );
      if (!item) return;

      updateItemMutation.mutate({
        id: item.id,
        name: item.name,
        description: item.description ?? "",
        price: String(item.price),
        quantity: item.quantity,
        unit: item.unit ?? "",
        groceryTripId: item.groceryTripId,
        importId: item.importId ?? "",
        itemTypes: item.itemTypes.map((t) => ({ id: t.id })),
        percentConsumed:
          decision.type === "eaten"
            ? 100
            : decision.type === "updated"
              ? decision.percentConsumed
              : item.percentConsumed,
        status:
          decision.type === "eaten"
            ? "EATEN"
            : decision.type === "discarded"
              ? "DISCARDED"
              : decision.type === "updated" && decision.status
                ? decision.status
                : item.status,
      });
    },
    [atRiskData, updateItemMutation],
  );

  const eatenCount = results.filter((r) => r.decision.type === "eaten").length;
  const discardedCount = results.filter(
    (r) => r.decision.type === "discarded",
  ).length;
  const skippedCount = results.filter(
    (r) => r.decision.type === "skipped",
  ).length;

  return {
    queue,
    results,
    currentItem: queue[0],
    advance,
    isLoading,
    isEmpty: !isLoading && queue.length === 0,
    eatenCount,
    discardedCount,
    skippedCount,
  };
}
