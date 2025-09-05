"use client";
import { DollarSign } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useGroceryTrips } from "@/hooks/useGroceryTrips";
import { ItemStatusType } from "@/generated/prisma";
import { MetricCardSkeleton } from "../ui/DashboardCardSkeleton";

export const TotalSavings = () => {
  const { isLoading, trips, isPending } = useGroceryTrips();

  // Constants for better readability
  const BASELINE_WASTE_RATE = 1 / 3; // 33% baseline food waste

  // Calculate trip statistics with improved logic
  const tripStats = trips
    .filter((trip) => trip.items.length > 0)
    .map((trip) => {
      const totalCost = trip.items.reduce((sum, item) => sum + item.price, 0);

      // Calculate consumption more accurately
      const consumedValue = trip.items.reduce((sum, item) => {
        if (item.status === ItemStatusType.EATEN) {
          return sum + item.price; // Full value consumed
        }

        // Partial consumption based on percentConsumed
        return sum + (item.price * item.percentConsumed) / 100;
      }, 0);

      const wasteValue = totalCost - consumedValue;
      const wasteRate = totalCost > 0 ? wasteValue / totalCost : 0;
      const consumptionRate = totalCost > 0 ? consumedValue / totalCost : 0;

      return {
        totalCost,
        consumedValue,
        wasteValue,
        wasteRate,
        consumptionRate,
        itemCount: trip.items.length,
      };
    });

  // Calculate overall metrics
  const totalSpent = tripStats.reduce((sum, trip) => sum + trip.totalCost, 0);
  const totalWasted = tripStats.reduce((sum, trip) => sum + trip.wasteValue, 0);

  const actualWasteRate = totalSpent > 0 ? totalWasted / totalSpent : 0;

  // Calculate savings compared to baseline
  const baselineWasteAmount = totalSpent * BASELINE_WASTE_RATE;
  const actualWasteAmount = totalWasted;
  const totalSavings = baselineWasteAmount - actualWasteAmount;

  const wasteReductionPercentage =
    BASELINE_WASTE_RATE > 0
      ? ((BASELINE_WASTE_RATE - actualWasteRate) / BASELINE_WASTE_RATE) * 100
      : 0;

  // Determine badge styling based on waste reduction performance
  const { className, color }: { className: string; color: string } = ((
    reductionPercentage: number,
  ) => {
    if (reductionPercentage > 25) {
      return { color: "green", className: "bg-green-100 text-green-800" };
    }
    if (reductionPercentage < 25 && reductionPercentage > -25) {
      return { color: "amber", className: "bg-amber-100 text-amber-800" };
    }
    return { color: "red", className: "bg-red-100 text-red-800" };
  })(wasteReductionPercentage);

  // Format the display value
  const displayValue = Number.isNaN(totalSavings) ? 0 : totalSavings;

  console.log({
    displayValue,
    totalSavings,
    actualWasteAmount,
    actualWasteRate,
    totalSpent,
    totalWasted,
  });

  if (isLoading || isPending) {
    return <MetricCardSkeleton />;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between space-y-2">
        <h3 className="text-muted-foreground text-sm font-medium">
          Total Savings
        </h3>
        <DollarSign className="text-muted-foreground h-4 w-4" />
      </div>
      <div className="flex items-center gap-2">
        <div className="text-2xl font-bold">
          ${displayValue > 0 ? displayValue.toFixed(2) : "0.00"}
        </div>
        <Badge className={className} color={color}>
          {wasteReductionPercentage > 0
            ? Math.round(wasteReductionPercentage)
            : 0}
          %
        </Badge>
      </div>
      <p className="text-muted-foreground text-xs">
        {wasteReductionPercentage > 0 ? "more" : "less"} compared to the average
        household
      </p>
    </Card>
  );
};
