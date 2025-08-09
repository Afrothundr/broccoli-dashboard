"use client";
import { Card, CardContent } from "@/components/ui/card";
import { TableCardSkeleton } from "../ui/DashboardCardSkeleton";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGroceryTrips } from "@/hooks/useGroceryTrips";
import localizedFormat from "dayjs/plugin/localizedFormat";
import dayjs from "dayjs";
import { GroceryTripsTable } from "./GroceryTripsTable";
import { TripDetailsDialog } from "./TripDetailsDialog";

dayjs.extend(localizedFormat);

export const GroceryTrips = () => {
  const { trips, isLoading, refetch, isPending, isSuccess } = useGroceryTrips();
  const [isTripOpen, setIsTripOpen] = useState(false);
  const [tripToUpdateIndex, setTripToUpdateIndex] = useState<
    number | undefined
  >();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;
  const PAGINATION_WINDOW = 3;

  const tripLengthCached = useRef<number | null>(null);

  useEffect(() => {
    if (isSuccess) {
      if (
        tripLengthCached.current !== null &&
        tripLengthCached.current !== trips.length
      ) {
        setTripToUpdateIndex(0);
        setIsTripOpen(true);
      }
      tripLengthCached.current = trips.length;
    }
  }, [trips.length, isSuccess]);

  const handleTripSelect = (index: number) => {
    setTripToUpdateIndex(index);
    setIsTripOpen(true);
  };

  const handleCloseDialog = () => {
    setIsTripOpen(false);
    setTripToUpdateIndex(undefined);
  };

  const selectedTrip =
    tripToUpdateIndex !== undefined ? trips[tripToUpdateIndex] : undefined;

  if (isLoading || isPending) {
    return (
      <TableCardSkeleton className="col-span-4 md:col-span-3 md:col-start-5 md:row-start-2" />
    );
  }

  return (
    <>
      <Card className="col-span-4 p-6 md:col-span-3 md:col-start-5 md:row-start-2">
        <h2 className="mb-4 text-xl font-semibold">Recent Trips</h2>
        <CardContent className="flex-1 px-0 pb-0">
          <GroceryTripsTable
            trips={trips}
            currentPage={page}
            pageSize={PAGE_SIZE}
            paginationWindow={PAGINATION_WINDOW}
            onPageChange={setPage}
            onTripSelect={handleTripSelect}
          />
        </CardContent>
      </Card>
      <TripDetailsDialog
        trip={selectedTrip}
        isOpen={isTripOpen}
        onClose={handleCloseDialog}
        refetchTrip={refetch}
      />
    </>
  );
};
