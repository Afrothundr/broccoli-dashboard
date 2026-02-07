"use client";
import dayjs from "dayjs";
import { TotalSavings } from "@/components/core/TotalSavings";
import { UsageRate } from "@/components/core/UsageRate";
import { AverageTrip } from "@/components/core/AverageTrip";
import { ItemBreakdown } from "@/components/core/ItemBreakdown";
import { Inventory } from "@/components/core/Inventory";
import { ImageUpload } from "@/components/core/ImageUpload";
import { GroceryTrips } from "@/components/core/GroceryTrips";

export default function AppPage() {
  return (
    <div className="vertical space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#85c941]">
            kitchen breakdown
          </h1>
          <p className="text-muted-foreground">
            {dayjs().format("dddd, MMMM D")}
          </p>
        </div>
        <div className="relative right-0 z-2 md:right-[2rem]">
          <ImageUpload style="floating" />
        </div>
      </div>

      {/* Search */}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TotalSavings />
        <UsageRate />
        <AverageTrip />
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-7 md:grid-rows-[450px_minmax(0,1fr)]">
        {/* Activity Feed */}
        <Inventory />
        <ItemBreakdown />
        <GroceryTrips />
      </div>
    </div>
  );
}
