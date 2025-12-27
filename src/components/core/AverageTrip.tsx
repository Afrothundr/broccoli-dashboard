"use client";
import { useGroceryTrips } from "@/hooks/useGroceryTrips";
import dayjs from "dayjs";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useMemo } from "react";
import { Card } from "../ui/card";
import { Sparklines, SparklinesLine } from "react-sparklines";
import { MetricCardSkeleton } from "../ui/DashboardCardSkeleton";

export const AverageTrip = () => {
  const { isLoading, trips, isPending } = useGroceryTrips();
  const data = trips
    .reduce(
      (acc, curr) => {
        if (curr.items.length > 0) {
          acc.push({
            createdAt: curr.createdAt,
            name: dayjs(curr.createdAt).format("MM/DD/YY"),
            cost: curr.items.reduce((acc, curr) => acc + curr.price, 0),
            id: curr.id,
          });
        }
        return acc;
      },
      [] as { name: string; cost: number; id: number; createdAt: Date }[],
    )
    .reverse();

  const averageCost =
    data.reduce((acc, curr) => acc + curr.cost, 0) / data.length;

  const averageCostFormatted = Number.isNaN(averageCost)
    ? "0.00"
    : averageCost.toFixed(2);

  const percentageChange = useMemo(() => {
    const simpleMovingAverage = (prices: number[], interval: number) => {
      let index = interval - 1;
      const length = prices.length + 1;
      const results: number[] = [];

      while (index < length) {
        index = index + 1;
        const intervalSlice = prices.slice(index - interval, index);
        const sum = intervalSlice.reduce((prev, curr) => prev + curr, 0);
        results.push(sum / interval);
      }

      return results;
    };

    if (data.length >= 6) {
      const rollingAverages = simpleMovingAverage(
        data.map((trip) => trip.cost),
        2,
      );
      if (!rollingAverages.length) return null;
      const secondToLast = rollingAverages?.[rollingAverages.length - 2];
      const last = rollingAverages?.[rollingAverages.length - 1];
      if (secondToLast && last) {
        return Math.round(((last - secondToLast) / secondToLast) * 100);
      }
    }
    return null;
  }, [data]);

  const textColor = ((value: number | null) => {
    if (!value) return "text-gray-700 dark:text-gray-300";
    if (value > 40) {
      return "text-red-700 dark:text-red-300";
    }
    if (value < 40 && value > 25) {
      return "text-amber-700 dark:text-amber-300";
    }
    return "text-green-700 dark:text-green-300";
  })(percentageChange);

  if (isLoading || isPending) {
    return <MetricCardSkeleton />;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between space-y-2">
        <h3 className="text-muted-foreground text-sm font-medium">
          Average Trip
        </h3>

        {percentageChange && percentageChange < 0 ? (
          <TrendingDown className="text-muted-foreground h-4 w-4" />
        ) : (
          <TrendingUp className="text-muted-foreground h-4 w-4" />
        )}
      </div>
      <div className="flex items-end gap-4">
        <div className="text-2xl font-bold">
          ${data.length ? averageCostFormatted : 0}
        </div>{" "}
        {trips.length > 1 ? (
          // @ts-expect-error - react-sparklines has type incompatibility with React 19
          <Sparklines data={data.map((trip) => trip.cost)} height={28}>
            {/* @ts-expect-error - react-sparklines has type incompatibility with React 19 */}
            <SparklinesLine color="oklch(62.7% 0.194 149.214)" />
          </Sparklines>
        ) : null}
      </div>
      <div>
        {percentageChange && (
          <p className="text-muted-foreground text-xs">
            {" "}
            Trending {percentageChange > 0 ? "up" : "down"} by{" "}
            <span className={textColor}>
              {Math.abs(percentageChange) ?? 0}%
            </span>
          </p>
        )}
      </div>
    </Card>
  );
};
