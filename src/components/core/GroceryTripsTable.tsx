"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { DataPagination } from "../ui/DataPagination";
import { Card, CardContent } from "../ui/card";
import { Receipt, Plus } from "lucide-react";
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total Spent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedTrips.map((trip, paginatedIndex) => {
            const originalIndex = startIndex + paginatedIndex;
            return (
              <TableRow key={trip.id}>
                <TableCell className="font-medium">{trip.name}</TableCell>
                <TableCell>{dayjs(trip.createdAt).format("ll")}</TableCell>
                <TableCell>
                  $
                  {trip.items
                    .reduce((acc, curr) => acc + curr.price, 0)
                    .toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTripSelect(originalIndex)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="mt-2">
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
