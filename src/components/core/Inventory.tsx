/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useItems } from "@/hooks/useItems";
import { useState } from "react";
import {
  type Item,
  ItemStatusType,
  type ItemType,
} from "@/generated/prisma/client";
import { Image } from "@imagekit/next";
import { Skeleton } from "../ui/skeleton";
import { DataPagination } from "../ui/DataPagination";
import { Search } from "lucide-react";
import { useDebounce } from "use-debounce";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { SimpleDialog } from "../SimpleDialog";
import type { UpdateItemSchemaType } from "@/schemas/update-item";
import { ItemForm } from "./ItemForm";
import { Badge } from "../ui/badge";

function getItemStatusColor(status: ItemStatusType) {
  switch (status) {
    case ItemStatusType.BAD:
      return "data-[state=on]:bg-red-400 px-4";
    case ItemStatusType.OLD:
      return "data-[state=on]:bg-yellow-400 px-4";
    case ItemStatusType.FRESH:
      return "data-[state=on]:bg-green-400 px-4";
    case ItemStatusType.EATEN:
      return "data-[state=on]:bg-violet-400 px-4";
    case ItemStatusType.DISCARDED:
      return "data-[state=on]:bg-neutral-400 px-6 sm:text-ellipsis";
  }
}

function getBadgeColor(status: ItemStatusType) {
  switch (status) {
    case ItemStatusType.BAD:
      return "red-400";
    case ItemStatusType.OLD:
      return "yellow-400";
    case ItemStatusType.FRESH:
      return "green-400";
    case ItemStatusType.EATEN:
      return "violet-400";
    case ItemStatusType.DISCARDED:
      return "neutral-400";
  }
}

export type CombinedItemType = Item & {
  itemTypes: ItemType[];
};

export const Inventory = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ItemStatusType[]>([
    ItemStatusType.BAD,
    ItemStatusType.OLD,
    ItemStatusType.FRESH,
  ]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const PAGINATION_WINDOW = 3;
  const [debouncedSearch] = useDebounce(search, 500);
  const { items, isLoading, updateItem, isPending } = useItems({
    search: debouncedSearch,
    filters,
  });
  const [isItemOpen, setIsItemOpen] = useState(false);
  const [itemToUpdate, setItemToUpdate] = useState<UpdateItemSchemaType>();

  const handleItemSubmit = async (values: UpdateItemSchemaType) => {
    updateItem(values);
    setIsItemOpen(false);
    setItemToUpdate(undefined);
  };

  if (isLoading || isPending) {
    return (
      <Card className="col-span-4 p-6 md:row-span-2">
        {/* Header skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>

        {/* Search and filters skeleton */}
        <div className="flex flex-col gap-1">
          <div className="relative">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-12" />
            <Skeleton className="h-9 w-12" />
            <Skeleton className="h-9 w-12" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>

        {/* Items skeleton */}
        <div className="mt-6 space-y-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="col-span-4 p-6 md:row-span-2">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Inventory</h2>
      </div>
      <div className="flex flex-col gap-1">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border py-2 pl-10 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search..."
            type="search"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <ToggleGroup
          type="multiple"
          size={"lg"}
          className="mt-3 flex-wrap"
          value={filters}
          onValueChange={(change) => {
            setFilters(change as unknown as ItemStatusType[]);
            setPage(1);
          }}
        >
          {Object.values(ItemStatusType).map((type) => (
            <ToggleGroupItem
              key={type}
              value={type}
              aria-label={`Status: ${type}`}
              className={getItemStatusColor(type)}
            >
              {type.toLowerCase()}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="mt-6 space-y-4">
        {items.slice(PAGE_SIZE * (page - 1), PAGE_SIZE * page).map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-lg border p-3"
          >
            <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full">
              <Image
                urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL}
                src={`/icons/${item.itemTypes[0]?.name}.png`}
                height={50}
                width={50}
                alt={item.itemTypes[0]?.name ?? "item"}
              />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm leading-none font-medium">
                {item.itemTypes[0]?.name}
              </p>
              <p className="text-muted-foreground text-xs">{item.name}</p>
            </div>
            <Badge
              color={getBadgeColor(item.status)}
              className="text-slate-900"
            >
              {item.status.toLowerCase()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setItemToUpdate(item);
                setIsItemOpen(true);
              }}
            >
              Edit
            </Button>
          </div>
        ))}
      </div>
      <DataPagination
        currentPage={page}
        totalItems={items.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        paginationWindow={PAGINATION_WINDOW}
      />
      <SimpleDialog
        open={isItemOpen && !!itemToUpdate}
        showCancel={false}
        onOpenChange={() => setIsItemOpen(false)}
        submitText="Update"
        title="Update Item"
        mobileView="bottom-drawer"
      >
        <ItemForm
          defaultValues={itemToUpdate}
          onSubmit={handleItemSubmit}
          onCancel={() => setIsItemOpen(false)}
        />
      </SimpleDialog>
    </Card>
  );
};
