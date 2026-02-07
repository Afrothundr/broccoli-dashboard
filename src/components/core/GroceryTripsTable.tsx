"use client";
import { Button } from "../ui/button";
import { DataPagination } from "../ui/DataPagination";
import { Card, CardContent } from "../ui/card";
import { Receipt, ExternalLink } from "lucide-react";
import dayjs from "dayjs";
import { Item, type GroceryTrip } from "@/generated/prisma";

interface GroceryTripsTableProps {
  trips: unknown[];
  currentPage: number;
  pageSize: number;
  paginationWindow: number;
  onPageChange: (page: number) => void;
  onTripSelect: (index: number) => void;
}

const getRecencyGradient = (createdAt: Date): string => {
  const now = dayjs();
  const tripDate = dayjs(createdAt);
  const daysAgo = now.diff(tripDate, "day");

  // Recent (0-7 days): Fresh vibrant green - like fresh produce
  if (daysAgo <= 7) {
    return "bg-gradient-to-br from-green-500 to-emerald-600 text-white";
  }
  // Recent-ish (8-14 days): Lime to green - still fresh
  if (daysAgo <= 14) {
    return "bg-gradient-to-br from-lime-500 to-green-600 text-white";
  }
  // Moderate (15-30 days): Teal to cyan - transitioning
  if (daysAgo <= 30) {
    return "bg-gradient-to-br from-teal-500 to-cyan-600 text-white";
  }
  // Older (31-60 days): Yellow-green to olive - aging produce
  if (daysAgo <= 60) {
    return "bg-gradient-to-br from-yellow-500 to-lime-600 text-white";
  }
  // Very old (60+ days): Muted sage/olive - past freshness
  return "bg-gradient-to-br from-stone-400 to-green-600/60 text-white";
};

export const GroceryTripsTable: React.FC<GroceryTripsTableProps> = ({
  trips,
  currentPage,
  pageSize,
  paginationWindow,
  onPageChange,
  onTripSelect,
}) => {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const _trips = trips as (GroceryTrip & { items: Item[] })[];
  const paginatedTrips = _trips.slice(startIndex, endIndex);

  if (!trips.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted mb-4 rounded-full p-4">
            <Receipt className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No grocery trips yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-sm">
            Start tracking your food waste by uploading your first receipt.
            We&apos;ll help you analyze your spending and consumption patterns.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {paginatedTrips.map((trip, paginatedIndex) => {
          const originalIndex = startIndex + paginatedIndex;
          const total = trip.items
            .reduce((acc, curr) => acc + curr.price, 0)
            .toFixed(2);
          const itemCount = trip.items.length;
          const gradientClass = getRecencyGradient(trip.createdAt);

          return (
            <Card
              key={trip.id}
              className="group cursor-pointer transition-all hover:shadow-md"
              onClick={() => onTripSelect(originalIndex)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold ${gradientClass}`}
                  >
                    {dayjs(trip.createdAt).format("MMM")}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-semibold">{trip.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {dayjs(trip.createdAt).format("MMM D")} · {itemCount}{" "}
                      {itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">${total}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground h-10 w-10 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTripSelect(originalIndex);
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="mt-4">
        <DataPagination
          currentPage={currentPage}
          totalItems={trips.length}
          pageSize={pageSize}
          onPageChange={onPageChange}
          paginationWindow={paginationWindow}
        />
      </div>
    </>
  );
};
