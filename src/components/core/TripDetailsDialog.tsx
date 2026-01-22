"use client";
import dayjs from "dayjs";
import * as React from "react";
import { SimpleDialog } from "../SimpleDialog";
import { ReceiptGallery } from "./ReceiptGallery";
import { ReceiptImportWizard } from "./ReceiptImportWizard";
import { ItemsTable, type ItemsTableRef } from "./ItemsTable";
import type { ItemType, GroceryTrip, Item, Receipt } from "@/generated/prisma";
import { useEffect, useState, useRef } from "react";
import { defineStepper } from "@stepperize/react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ImageIcon,
  ShoppingCart,
  CheckCheck,
} from "lucide-react";

interface TripDetailsDialogProps {
  trip: unknown;
  isOpen: boolean;
  onClose: () => void;
  refetchTrip: () => void;
}

// Define stepper configurations
const { useStepper: useStepperWithImport, steps: stepsWithImport } =
  defineStepper(
    {
      id: "receipts",
      title: "Receipts",
      description: "View and manage receipts",
    },
    {
      id: "import",
      title: "Import",
      description: "Import items from receipt",
    },
    {
      id: "review",
      title: "Review",
      description: "Review and edit items",
    },
  );

const { useStepper: useStepperWithoutImport, steps: stepsWithoutImport } =
  defineStepper(
    {
      id: "receipts",
      title: "Receipts",
      description: "View and manage receipts",
    },
    {
      id: "review",
      title: "Review",
      description: "Review and edit items",
    },
  );

export const TripDetailsDialog: React.FC<TripDetailsDialogProps> = ({
  trip,
  isOpen,
  onClose,
  refetchTrip,
}) => {
  const _trip = trip as GroceryTrip & {
    items: (Item & { itemTypes: ItemType[] })[];
    receipts: (Receipt & { items: Item[] })[];
  };
  const [activeReceipt, setActiveReceipt] = useState<
    (Receipt & { items: Item[] }) | undefined
  >(_trip?.receipts?.[0]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const itemsToImport =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    JSON.parse((activeReceipt?.scrapedData as string) ?? "{}")?.items?.length ??
    0;

  // Determine if there are items to import
  const hasItemsToImport = itemsToImport > 0;

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
      description={dayjs(_trip.createdAt).format("MMM DD, YYYY")}
      classNames={{
        content: "pb-4 overflow-hidden flex flex-col max-h-[85vh]",
      }}
    >
      <TripStepperContent
        trip={_trip}
        activeReceipt={activeReceipt}
        setActiveReceipt={setActiveReceipt}
        refetchTrip={refetchTrip}
        onClose={onClose}
        hasItemsToImport={hasItemsToImport}
      />
    </SimpleDialog>
  );
};

interface TripStepperContentProps {
  trip: GroceryTrip & {
    items: (Item & { itemTypes: ItemType[] })[];
    receipts: (Receipt & { items: Item[] })[];
  };
  activeReceipt: (Receipt & { items: Item[] }) | undefined;
  setActiveReceipt: (
    receipt: (Receipt & { items: Item[] }) | undefined,
  ) => void;
  refetchTrip: () => void;
  onClose: () => void;
  hasItemsToImport: boolean;
}

const TripStepperContent: React.FC<TripStepperContentProps> = ({
  trip,
  activeReceipt,
  setActiveReceipt,
  refetchTrip,
  onClose,
  hasItemsToImport,
}) => {
  const stepperWithImport = useStepperWithImport();
  const stepperWithoutImport = useStepperWithoutImport();
  const itemsTableRef = useRef<ItemsTableRef>(null);

  const stepper = hasItemsToImport ? stepperWithImport : stepperWithoutImport;
  const steps = hasItemsToImport ? stepsWithImport : stepsWithoutImport;

  const currentIndex = stepper.all.findIndex(
    (step) => step.id === stepper.current.id,
  );

  const handleReceiptClick = (receiptIndex: number) => {
    setActiveReceipt(trip.receipts[receiptIndex]);
  };

  const handleImportComplete = () => {
    refetchTrip();
    stepper.next();
  };

  const handleFinish = () => {
    // Save changes from ItemsTable before closing
    if (itemsTableRef.current) {
      itemsTableRef.current.saveChanges();
    }
    onClose();
  };

  const stepIcons = {
    receipts: ImageIcon,
    import: ShoppingCart,
    review: CheckCheck,
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      {/* Stepper Navigation - Horizontal on mobile, vertical on desktop */}
      <nav aria-label="Trip Steps" className="flex-shrink-0">
        {/* Mobile: Horizontal stepper */}
        <div className="block">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">
              Step {currentIndex + 1} of {steps.length}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            {stepper.all.map((step, index) => {
              const stepId = step.id as string;
              const StepIcon =
                stepId in stepIcons
                  ? stepIcons[stepId as keyof typeof stepIcons]
                  : ImageIcon;
              const isActive = stepper.current.id === step.id;
              const isCompleted = index < currentIndex;
              const isClickable = index <= currentIndex;

              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isClickable) {
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
                        stepper.goTo(step.id as any);
                      }
                    }}
                    disabled={!isClickable}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-lg p-2 transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-muted text-muted-foreground"
                    } ${isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                  >
                    <div className="relative">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-xs font-medium">{step.title}</span>
                  </button>
                  {index < stepper.all.length - 1 && (
                    <div className="bg-border h-[2px] w-4 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto">
        {stepper.switch({
          receipts: () => (
            <ReceiptsStep
              receipts={trip.receipts}
              tripId={trip.id}
              handleReceiptClick={handleReceiptClick}
              activeReceipt={activeReceipt?.id}
              refetchTrip={refetchTrip}
              getReceipts={() => trip.receipts}
            />
          ),
          import: () =>
            hasItemsToImport && activeReceipt ? (
              <ImportStep
                activeReceipt={activeReceipt}
                refetchTrip={refetchTrip}
                onComplete={handleImportComplete}
              />
            ) : null,
          review: () => <ReviewStep items={trip.items} ref={itemsTableRef} />,
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex-shrink-0 border-t pt-4">
        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={stepper.prev}
            disabled={stepper.isFirst}
            className="flex-1 md:flex-initial"
          >
            Previous
          </Button>
          <div className="flex gap-3">
            {stepper.isLast ? (
              <Button onClick={handleFinish} className="flex-1 md:flex-initial">
                Finish
              </Button>
            ) : (
              <Button onClick={stepper.next} className="flex-1 md:flex-initial">
                {(() => {
                  if (hasItemsToImport && currentIndex === 0) {
                    return "Import Items";
                  } else if (currentIndex === 1) {
                    return "Review Items";
                  }
                  return "Next";
                })()}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
const ReceiptsStep: React.FC<{
  receipts: (Receipt & { items: Item[] })[];
  tripId: number;
  handleReceiptClick: (index: number) => void;
  activeReceipt?: number;
  refetchTrip: () => void;
  getReceipts: () => (Receipt & { items: Item[] })[];
}> = ({
  receipts,
  tripId,
  handleReceiptClick,
  activeReceipt,
  refetchTrip,
  getReceipts,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Receipt Gallery</h3>
        <p className="text-muted-foreground text-sm">
          View your uploaded receipts and add new ones
        </p>
      </div>
      <ReceiptGallery
        receipts={receipts}
        tripId={tripId}
        handleReceiptClick={handleReceiptClick}
        activeReceipt={activeReceipt}
        refetchTrip={refetchTrip}
        getReceipts={getReceipts}
      />
      <div className="bg-muted/30 rounded-lg border p-4">
        <p className="text-sm">
          <span className="font-medium">Tip:</span> Click on a receipt to select
          it, then proceed to the next step to import items.
        </p>
      </div>
    </div>
  );
};

const ImportStep: React.FC<{
  activeReceipt: Receipt & { items: Item[] };
  refetchTrip: () => void;
  onComplete: () => void;
}> = ({ activeReceipt, refetchTrip, onComplete }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Import Items</h3>
        <p className="text-muted-foreground text-sm">
          Review and import items detected from your receipt
        </p>
      </div>
      <div className="bg-background rounded-lg border p-4">
        <ReceiptImportWizard
          receipt={activeReceipt}
          refetchTrip={refetchTrip}
        />
      </div>
    </div>
  );
};

const ReviewStep = React.forwardRef<
  ItemsTableRef,
  {
    items: (Item & { itemTypes: ItemType[] })[];
  }
>(({ items }, ref) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Review Items</h3>
        <p className="text-muted-foreground text-sm">
          Edit item details and finalize your grocery trip
        </p>
      </div>
      <ItemsTable items={items} ref={ref} />
    </div>
  );
});

ReviewStep.displayName = "ReviewStep";
