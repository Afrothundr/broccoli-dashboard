"use client";
import { DollarSign } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useGroceryTrips } from "@/hooks/useGroceryTrips";
import { ItemStatusType } from "@/generated/prisma";
import { MetricCardSkeleton } from "../ui/DashboardCardSkeleton";
import { SegmentedControl } from "../SegmentedControl";
import { useState, useMemo } from "react";

type TimeFilter = "week" | "month" | "all";

export const TotalSavings = () => {
  const { isLoading, trips, isPending } = useGroceryTrips();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  // Filter trips based on selected time period
  const filteredTrips = useMemo(() => {
    const now = new Date();
    const filterDate = new Date();

    switch (timeFilter) {
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "all":
      default:
        return trips;
    }

    return trips.filter((trip) => new Date(trip.createdAt) >= filterDate);
  }, [trips, timeFilter]);

  // Get time period label for display
  const timePeriodLabel = useMemo(() => {
    switch (timeFilter) {
      case "week":
        return "this week";
      case "month":
        return "this month";
      case "all":
      default:
        return "all time";
    }
  }, [timeFilter]);

  // Constants for better readability
  const BASELINE_WASTE_RATE = 1 / 3; // 33% baseline food waste

  // Calculate trip statistics with improved logic
  const tripStats = filteredTrips
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
    totalSpent > 0 && BASELINE_WASTE_RATE > 0
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

  if (isLoading || isPending) {
    return <MetricCardSkeleton />;
  }

  return (
    <Card className="p-6">
      <div className="mb-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-muted-foreground text-sm font-medium">
            Total Savings
          </h3>
          <DollarSign className="text-muted-foreground h-4 w-4" />
        </div>
        <SegmentedControl
          options={[
            { label: "Week", value: "week" },
            { label: "Month", value: "month" },
            { label: "All", value: "all" },
          ]}
          value={timeFilter}
          onChange={(value) => setTimeFilter(value as TimeFilter)}
          size="sm"
        />
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
        household ({timePeriodLabel})
      </p>
    </Card>
  );
};
