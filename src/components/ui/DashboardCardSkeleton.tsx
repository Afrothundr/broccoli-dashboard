"use client";
import { Card } from "./card";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

export interface DashboardCardSkeletonProps {
  /** Custom className for the card container */
  className?: string;
  /** Layout variant for different dashboard card types */
  variant?: "metric" | "chart" | "table" | "custom";
  /** Custom skeleton elements for the custom variant */
  children?: React.ReactNode;
}

/**
 * Reusable skeleton component for dashboard cards with different layout variants
 */
export const DashboardCardSkeleton: React.FC<DashboardCardSkeletonProps> = ({
  className,
  variant = "metric",
  children,
}) => {
  const renderSkeletonContent = () => {
    switch (variant) {
      case "metric":
        // For metric cards like TotalSavings, UsageRate, AverageTrip
        return (
          <div className="flex h-full flex-col justify-between space-y-3">
            {/* Header with title and icon */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            {/* Main value/metric */}
            <Skeleton className="h-8 w-2/5" />
            {/* Description/subtitle */}
            <Skeleton className="h-3 w-3/4" />
          </div>
        );

      case "chart":
        // For chart cards like ItemBreakdown
        return (
          <div className="flex h-full flex-col justify-around space-y-4">
            {/* Title */}
            <Skeleton className="h-6 w-1/3" />
            {/* Chart area */}
            <div className="flex items-center justify-center">
              <Skeleton className="h-48 w-48 rounded-full" />
            </div>
            {/* Legend */}
            <div className="mx-auto flex w-1/2 flex-wrap items-center gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16" />
              ))}
            </div>
          </div>
        );

      case "table":
        // For table cards like GroceryTrips, Inventory
        return (
          <div className="flex h-full flex-col justify-between space-y-4">
            {/* Title */}
            <div className="flex flex-col space-y-8">
              <Skeleton className="h-6 w-1/4" />

              {/* Table rows */}
              <div className="flex flex-col gap-4 space-y-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                ))}
              </div>
            </div>
            {/* Pagination */}
            <div className="flex justify-center space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        );

      case "custom":
        // For custom layouts, render children
        return children;

      default:
        return (
          <div className="flex h-full flex-col justify-between space-y-3">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        );
    }
  };

  return (
    <Card className={cn("p-6", className)}>{renderSkeletonContent()}</Card>
  );
};

/**
 * Specific skeleton variants for common dashboard card types
 */
export const MetricCardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => <DashboardCardSkeleton variant="metric" className={className} />;

export const ChartCardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => <DashboardCardSkeleton variant="chart" className={className} />;

export const TableCardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => <DashboardCardSkeleton variant="table" className={className} />;
