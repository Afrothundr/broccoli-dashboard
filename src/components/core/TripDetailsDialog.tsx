"use client";
import dayjs from "dayjs";
import { SimpleDialog } from "../SimpleDialog";
import { ReceiptGallery } from "./ReceiptGallery";
import { ReceiptImportWizard } from "./ReceiptImportWizard";
import { ItemsTable } from "./ItemsTable";
import { type GroceryTrip, type Item, type Receipt } from "@/generated/prisma";
import { useEffect, useState } from "react";
interface TripDetailsDialogProps {
  trip: unknown;
  isOpen: boolean;
  onClose: () => void;
  refetchTrip: () => void;
}

export const TripDetailsDialog: React.FC<TripDetailsDialogProps> = ({
  trip,
  isOpen,
  onClose,
  refetchTrip,
}) => {
  const _trip = trip as GroceryTrip & {
    items: Item[];
    receipts: (Receipt & { items: Item[] })[];
  };
  const [activeReceipt, setActiveReceipt] = useState(_trip?.receipts?.[0]);
  const itemsToImport =
    JSON.parse((activeReceipt?.scrapedData as string) ?? "{}")?.items?.length ||
    0;

  useEffect(() => {
    setActiveReceipt(_trip?.receipts?.[0]);
  }, [_trip]);
  if (!trip) return null;
  return (
    <SimpleDialog
      open={isOpen && !!trip}
      showCancel={false}
      onOpenChange={onClose}
      title={_trip.name}
      size="lg"
      mobileView="bottom-drawer"
      description={dayjs(_trip.createdAt).format("MMM DD")}
      classNames={{
        content: "pb-0 overflow-y-auto h-[calc(100vh-10rem)]",
      }}
    >
      <div className="flex flex-col gap-2">
        <ReceiptGallery
          receipts={_trip.receipts}
          tripId={_trip.id}
          handleReceiptClick={(receiptIndex: number) =>
            setActiveReceipt(_trip.receipts[receiptIndex])
          }
          activeReceipt={activeReceipt?.id}
          refetchTrip={refetchTrip}
        />

        {itemsToImport > 0 && (
          <div className="mt-6">
            <p className="text-md leading-none font-semibold">Import items</p>
            <div className="radius-round border-grey-200 my-3 mb-12 flex max-w-[630px] flex-col gap-3 rounded-sm border-2 p-2">
              <ReceiptImportWizard
                receipt={activeReceipt as Receipt & { items: Item[] }}
                refetchTrip={refetchTrip}
              />
            </div>
          </div>
        )}

        <div className="overflow-y-auto overflow-y-hidden">
          <ItemsTable items={_trip.items} onCancel={onClose} />
        </div>
      </div>
    </SimpleDialog>
  );
};
