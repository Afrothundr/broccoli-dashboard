"use client";
import { ItemStatusType } from "@/generated/prisma";
import { useGroceryTrips } from "@/hooks/useGroceryTrips";
import { PercentCircle } from "lucide-react";
import { Card } from "../ui/card";
import { MetricCardSkeleton } from "../ui/DashboardCardSkeleton";

export const UsageRate = () => {
  const { isLoading, trips, isPending } = useGroceryTrips();
  const filteredTrips = trips.reduce(
    (acc, curr) => {
      if (curr.items.length > 0) {
        acc.push({
          totalItems: curr.items.length,
          itemsConsumed: curr.items.reduce((total, item) => {
            // Only count items that were actually consumed (EATEN)
            // Items that are DISCARDED, BAD, OLD, or FRESH should not count as consumed
            if (item.status === ItemStatusType.EATEN) {
              return total + 1;
            }
            // For items still in progress (FRESH, OLD, BAD), count partial consumption
            if (
              item.status === ItemStatusType.FRESH ||
              item.status === ItemStatusType.OLD ||
              item.status === ItemStatusType.BAD ||
              item.status === ItemStatusType.DISCARDED
            ) {
              return total + item.percentConsumed * 0.01;
            }
            return total;
          }, 0),
        });
      }
      return acc;
    },
    [] as {
      totalItems: number;
      itemsConsumed: number;
    }[],
  );

  const averageConsumed =
    Math.round(
      (filteredTrips.reduce(
        (acc, curr) =>
          acc +
          curr.itemsConsumed / (curr.totalItems > 0 ? curr.totalItems : 1),
        0,
      ) /
        filteredTrips.length) *
        100,
    ) || 0;

  const textColor = ((value: number) => {
    if (value > 40) {
      return "text-green-800 dark:text-green-300";
    }
    if (value <= 40 && value > 25) {
      return "text-amber-700 dark:text-amber-300";
    }
    return "text-red-800 dark:text-red-300";
  })(averageConsumed);

  if (isLoading || isPending) {
    return <MetricCardSkeleton />;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between space-y-2">
        <h3 className="text-muted-foreground text-sm font-medium">
          Usage Rate
        </h3>
        <PercentCircle className="text-muted-foreground h-4 w-4" />
      </div>
      <div className="flex items-center gap-2">
        <div className={`text-2xl font-bold ${textColor}`}>
          {filteredTrips.length ? averageConsumed : 0}%
        </div>
      </div>
      <p className="text-muted-foreground text-xs">
        how much of your food you are eating
      </p>
    </Card>
  );
};
