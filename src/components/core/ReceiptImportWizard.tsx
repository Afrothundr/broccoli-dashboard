import { useEffect, useState } from "react";
import type { CombinedItemType } from "./Inventory";
import type { Item, Receipt } from "@/generated/prisma";
import { ItemForm } from "./ItemForm";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "../ui/carousel";
import { useItemTypes } from "@/hooks/useItemTypes";
import { useItems } from "@/hooks/useItems";
import type { UpdateItemSchemaType } from "@/schemas/update-item";
import { useGroceryTrips } from "@/hooks/useGroceryTrips";
import { queueItemUpdates } from "@/utils";
import { Button } from "../ui/button";
import {
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  SkipForward,
  Edit,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";

type ImportedItemProps = {
  name?: string;
  price?: number;
  quantity?: number;
  importId: string;
  unit?: string;
  itemTypes?: {
    id: number;
    name: string;
  }[];
  category?: string;
};

export const ReceiptImportWizard = ({
  receipt,
  refetchTrip,
}: {
  receipt: Receipt & { items: Item[] };
  refetchTrip: () => void;
}) => {
  const { types: itemTypes } = useItemTypes();
  const [itemIndex, setItemIndex] = useState(0);
  const [importedData, setImportedData] = useState<
    (CombinedItemType | ImportedItemProps)[]
  >([]);
  const [api, setApi] = useState<CarouselApi>();
  const [isSkipping, setIsSkipping] = useState(false);
  const [showFormForItems, setShowFormForItems] = useState<Set<number>>(
    new Set(),
  );

  const { createItem } = useItems();
  const { updateReceipt, isLoading: isUpdatingReceipt } = useGroceryTrips();

  const totalItems = importedData.length;
  const currentItemNumber = itemIndex + 1;
  const itemsRemaining = totalItems - currentItemNumber;
  const progressPercentage =
    totalItems > 0 ? (currentItemNumber / totalItems) * 100 : 0;

  useEffect(() => {
    if (!api) {
      return;
    }

    setItemIndex(api.selectedScrollSnap());

    api.on("select", () => {
      setItemIndex(api.selectedScrollSnap());
    });
  }, [api]);

  const nextStep = () => {
    const nextIndex = itemIndex + 1;
    if (nextIndex <= importedData.length - 1) {
      setItemIndex(nextIndex);
      api?.scrollTo(nextIndex);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const scrapedData = JSON.parse(receipt.scrapedData as string);
    if (scrapedData && "items" in scrapedData) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const mergedData = (scrapedData.items as ImportedItemProps[])
        .map((data) => {
          const foundSubmittedItem = receipt?.items?.find(
            (item) => item.importId === data?.importId,
          );
          const itemTypeFound = itemTypes?.find(
            (item) => item.name === data.category,
          );
          return (
            !foundSubmittedItem && {
              ...data,
              price: Number.parseFloat(
                data?.price?.toString().replaceAll("$", "") ?? "0",
              ),
              itemTypes: itemTypeFound ? [itemTypeFound] : [],
            }
          );
        })
        .filter(Boolean);
      setImportedData(mergedData as (CombinedItemType | ImportedItemProps)[]);
    }
  }, [receipt, itemTypes]);

  const handleNewItemSave = async (values: UpdateItemSchemaType) => {
    if (!receipt.groceryTripId) return;
    try {
      const item = await createItem({
        ...values,
        groceryTripId: receipt.groceryTripId,
        quantity: 1,
        percentConsumed: 0,
        status: "FRESH",
      });
      refetchTrip();
      const itemType = itemTypes.find(
        (item) => item.id === Number.parseInt(`${values.itemTypes[0]?.id}`),
      );
      await updateReceipt({
        id: receipt.id,
        itemId: item.id,
      });
      await queueItemUpdates(item, itemType);

      nextStep();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSkip = async (index: number) => {
    setIsSkipping(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const scrapedData = JSON.parse(receipt.scrapedData as string);
      if ("items" in scrapedData) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const items = scrapedData.items as unknown[];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        items.splice(index, 1);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const newData = {
          ...scrapedData,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          items,
        };

        await updateReceipt({
          id: receipt.id,
          scrapedData: JSON.stringify(newData),
        });
      }
      refetchTrip();
      nextStep();
    } catch (error) {
      console.error("Error skipping item:", error);
    } finally {
      setIsSkipping(false);
    }
  };

  const hasRequiredFields = (
    item: CombinedItemType | ImportedItemProps,
  ): boolean => {
    return !!(
      item.name &&
      item.name.trim() !== "" &&
      item.price !== undefined &&
      item.price !== null &&
      item.itemTypes &&
      item.itemTypes.length > 0
    );
  };

  const handleQuickImport = async (
    item: CombinedItemType | ImportedItemProps,
  ) => {
    if (!receipt.groceryTripId || !hasRequiredFields(item)) return;

    const values: UpdateItemSchemaType = {
      id: 0,
      name: item.name!,
      description: "",
      price: item.price!.toString(),
      quantity: item.quantity ?? 1,
      unit: item.unit ?? "",
      groceryTripId: receipt.groceryTripId,
      importId: item.importId,
      itemTypes: item.itemTypes!.map((type) => ({ id: type.id })),
      percentConsumed: 0,
      status: "FRESH",
    };

    await handleNewItemSave(values);
  };

  const toggleFormVisibility = (index: number) => {
    setShowFormForItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (importedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center">
        <PackageCheck className="text-muted-foreground h-12 w-12" />
        <div>
          <h3 className="mb-1 text-lg font-semibold">All items imported!</h3>
          <p className="text-muted-foreground text-sm">
            There are no more items to review from this receipt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="default"
              color="blue"
              className="text-sm font-semibold"
            >
              Item {currentItemNumber} of {totalItems}
            </Badge>
            {itemsRemaining > 0 && (
              <span className="text-muted-foreground text-sm">
                ({itemsRemaining} remaining)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => api?.scrollPrev()}
              disabled={
                !api?.canScrollPrev() || isUpdatingReceipt || isSkipping
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => api?.scrollNext()}
              disabled={
                !api?.canScrollNext() || isUpdatingReceipt || isSkipping
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-muted-foreground text-right text-xs">
            {Math.round(progressPercentage)}% complete
          </p>
        </div>
      </div>

      {/* Carousel */}
      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent>
          {Object.values(importedData).map((activeItem, itemIdx) => {
            const defaultValues: Partial<UpdateItemSchemaType> = {
              ...activeItem,
              price: activeItem?.price?.toString() ?? "",
              itemTypes:
                activeItem?.itemTypes?.map((type) => ({
                  id: type.id,
                })) ?? [],
            };

            const hasAllRequiredFields = hasRequiredFields(activeItem);
            const showForm =
              !hasAllRequiredFields || showFormForItems.has(itemIdx);
            const missingFields: string[] = [];
            if (!activeItem.name || activeItem.name.trim() === "") {
              missingFields.push("name");
            }
            if (activeItem.price === undefined || activeItem.price === null) {
              missingFields.push("price");
            }
            if (!activeItem.itemTypes || activeItem.itemTypes.length === 0) {
              missingFields.push("category");
            }

            return (
              <CarouselItem key={`item-${itemIdx}-${activeItem.importId}`}>
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-lg border p-3">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          Detected Item
                        </p>
                        <h4 className="mt-1 text-lg font-semibold">
                          {activeItem?.name ?? "Unnamed Item"}
                        </h4>
                      </div>
                      {activeItem?.price && (
                        <Badge
                          variant="outline"
                          color="green"
                          className="text-base font-semibold"
                        >
                          $
                          {Number.parseFloat(
                            activeItem.price.toString(),
                          ).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    {"category" in activeItem && activeItem?.category && (
                      <p className="text-muted-foreground text-sm">
                        Category:{" "}
                        <span className="font-medium">
                          {activeItem.category}
                        </span>
                      </p>
                    )}
                  </div>

                  {!hasAllRequiredFields && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Missing required fields: {missingFields.join(", ")}.
                        Please fill in the form below.
                      </AlertDescription>
                    </Alert>
                  )}

                  {hasAllRequiredFields && !showForm && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleQuickImport(activeItem)}
                        disabled={isUpdatingReceipt || isSkipping}
                        className="flex-1"
                        size="lg"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Import Item
                      </Button>
                      <Button
                        onClick={() => toggleFormVisibility(itemIdx)}
                        disabled={isUpdatingReceipt || isSkipping}
                        variant="outline"
                        size="lg"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleSkip(itemIdx)}
                        disabled={isUpdatingReceipt || isSkipping}
                        variant="ghost"
                        size="lg"
                      >
                        Skip
                      </Button>
                    </div>
                  )}

                  {showForm && (
                    <ItemForm
                      defaultValues={defaultValues}
                      onCancel={() => handleSkip(itemIdx)}
                      onSubmit={(val) => handleNewItemSave(val)}
                      isImport
                      isLoading={isUpdatingReceipt || isSkipping}
                    />
                  )}

                  {itemsRemaining > 0 && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
                      <div className="flex items-start gap-2">
                        <SkipForward className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Quick Tip
                          </p>
                          <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-300">
                            {hasAllRequiredFields && !showForm
                              ? 'Click "Import Item" to quickly add this item, or "Edit" to make changes first.'
                              : 'Click "Skip" to move to the next item, or use the arrow buttons above to navigate.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
