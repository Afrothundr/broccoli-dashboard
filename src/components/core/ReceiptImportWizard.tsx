import { useEffect, useState } from "react";
import { type CombinedItemType } from "./Inventory";
import { type Item, type Receipt } from "@/generated/prisma";
import { ItemForm } from "./ItemForm";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../ui/carousel";
import { useItemTypes } from "@/hooks/useItemTypes";
import { useItems } from "@/hooks/useItems";
import { type UpdateItemSchemaType } from "@/schemas/update-item";
import { useGroceryTrips } from "@/hooks/useGroceryTrips";
import { queueItemUpdates } from "@/utils";

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

  const { createItem } = useItems();
  const { updateReceipt, isLoading: isUpdatingReceipt } = useGroceryTrips();

  const nextStep = () => {
    const nextIndex = itemIndex + 1;
    if (nextIndex <= importedData.length - 1) {
      setItemIndex(nextIndex);
    } else {
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
                data?.price?.toString().replaceAll("$", "") || "0",
              ),
              itemTypes: itemTypeFound ? [itemTypeFound] : [],
            }
          );
        })
        .filter(Boolean);
      setImportedData(mergedData as (CombinedItemType | ImportedItemProps)[]);
    }
  }, [receipt, itemIndex, itemTypes]);

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
    nextStep();
  };

  return (
    <Carousel className="mx-auto w-[85%]">
      <CarouselContent>
        {Object.values(importedData).map((activeItem, index) => {
          const defaultValues: Partial<UpdateItemSchemaType> = {
            ...activeItem,
            price: activeItem?.price?.toString() ?? "",
            itemTypes:
              activeItem?.itemTypes?.map((type) => ({
                id: type.id,
              })) ?? [],
          };

          return (
            <CarouselItem key={index}>
              <div className="p-1">
                <ItemForm
                  defaultValues={defaultValues}
                  onCancel={() => handleSkip(index)}
                  onSubmit={(val) => handleNewItemSave(val)}
                  isImport
                  isLoading={isUpdatingReceipt}
                />
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};
