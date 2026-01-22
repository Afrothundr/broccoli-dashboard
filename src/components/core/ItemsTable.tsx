/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import {
  type ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../Input";
import Select from "react-select";
import { useItemTypes } from "@/hooks/useItemTypes";
import { useItems } from "@/hooks/useItems";
import { type Item } from "@/generated/prisma";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { useConfirmAlertDelete } from "../AlertContext";
import { useKitzeUI } from "../KitzeUIContext";
import { Card } from "../ui/card";
import { itemRemoverQueue } from "@/utils";

// Extend the TableMeta interface to include our custom updateData method
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData> {
    updateData?: (columnId: string, original: TData, value: string) => void;
  }
}
interface ItemsTableProps {
  items: PartialItem[];
}

export interface ItemsTableRef {
  saveChanges: () => void;
}

type PartialItem = Pick<
  Item & { itemTypes: { id: number }[] },
  "id" | "name" | "price" | "itemTypes"
>;

export const ItemsTable = forwardRef<ItemsTableRef, ItemsTableProps>(
  ({ items }, ref) => {
    const [itemState, setItemState] = useState<Record<number, PartialItem>>({});
    const { allTypes: itemTypes } = useItemTypes();
    const { updateItem, deleteItem } = useItems();
    const confirmDelete = useConfirmAlertDelete();
    const { isMobile } = useKitzeUI();

    // Expose save function to parent via ref
    useImperativeHandle(
      ref,
      () => ({
        saveChanges: () => {
          for (const update of Object.values(itemState)) {
            const itemUpdate = {
              ...update,
              price: `${update.price}`,
              // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
              itemTypes: [{ id: Number.parseInt(`${update.itemTypes}`) }],
            };
            updateItem(itemUpdate);
          }
        },
      }),
      [itemState, updateItem],
    );

    const handleDelete = (item: PartialItem) => {
      confirmDelete({
        title: "Delete Item",
        description: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
        onConfirm: () => {
          deleteItem(item.id);
          itemRemoverQueue({
            ids: [item.id],
            delay: 0,
          });
        },
      });
    };

    const columns: ColumnDef<PartialItem>[] = [
      {
        accessorKey: "name",
        header: "Name",
        size: 5,
        cell: ({ row, table, row: { getValue }, column: { id: columnId } }) => {
          const initialValue =
            itemState[row.original.id]?.name ?? getValue("name");
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [value, setValue] = useState(initialValue);
          const onBlur = () => {
            if (table.options.meta?.updateData && value !== undefined) {
              table.options.meta.updateData(columnId, row.original, value);
            }
          };
          useEffect(() => {
            setValue(initialValue);
          }, [initialValue]);
          return (
            <Input
              name="name"
              type="text"
              placeholder="Name"
              onChange={(e) => setValue(e.target.value)}
              onBlur={onBlur}
              defaultValue={initialValue}
              value={value}
            />
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row, table, row: { getValue }, column: { id: columnId } }) => {
          const initialValue = Number.parseFloat(
            (itemState[row.original.id]?.price as unknown as string) ||
              getValue("price"),
          ).toFixed(2);
          const [value, setValue] = useState(initialValue);
          const onBlur = () => {
            if (table.options.meta?.updateData) {
              table.options.meta.updateData(columnId, row.original, value);
            }
          };
          useEffect(() => {
            setValue(initialValue);
          }, [initialValue]);
          return (
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-muted-foreground">$</span>
              </div>

              <Input
                className={"pl-9"}
                name="price"
                type="number"
                min={0}
                max={10000}
                step={0.01}
                placeholder="0.00"
                defaultValue={initialValue}
                onChange={(e) => setValue(e.target.value)}
                onBlur={onBlur}
                value={value}
              />
            </div>
          );
        },
      },
      {
        accessorKey: "itemTypes",
        header: "Item Type",
        cell: ({ row, table, row: { getValue }, column: { id: columnId } }) => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          const initialValue = (getValue("itemTypes") ?? []) as {
            id: number;
          }[];
          const initialValueId = initialValue?.[0]?.id;
          const startingValue =
            itemState?.[row.original.id]?.itemTypes ?? initialValueId;
          // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
          const [value, setValue] = useState(`${startingValue}`);
          const updateTableState = (val: string) => {
            if (table.options.meta?.updateData) {
              table.options.meta.updateData(columnId, row.original, val);
            }
          };
          const selectedOption = itemTypes.find(
            (type) => type.id.toString() === `${value}`,
          );
          return (
            <Select
              options={itemTypes.map((type) => ({
                label: type.name,
                value: type.id.toString(),
              }))}
              value={
                selectedOption
                  ? {
                      label: selectedOption.name,
                      value: selectedOption.id.toString(),
                    }
                  : null
              }
              onChange={(selected) => {
                const val = selected ? selected.value : "";
                setValue(val);
                updateTableState(val);
              }}
              isSearchable
              placeholder="Select item type"
              classNames={{
                control: (state) =>
                  `!border-input !bg-background !min-h-10 !rounded-md ${
                    state.isFocused ? "!ring-2 !ring-ring !border-input" : ""
                  }`,
                menu: () =>
                  "!bg-popover !border !border-input !rounded-md !shadow-md",
                menuList: () => "!p-1",
                option: (state) =>
                  `!text-sm !rounded-sm !cursor-pointer ${
                    state.isSelected
                      ? "!bg-primary !text-primary-foreground"
                      : state.isFocused
                        ? "!bg-accent !text-accent-foreground"
                        : "!bg-transparent !text-foreground"
                  }`,
                placeholder: () => "!text-muted-foreground !text-sm",
                input: () => "!text-foreground !text-sm",
                singleValue: () => "!text-foreground !text-sm",
                loadingIndicator: () => "!text-muted-foreground",
                clearIndicator: () =>
                  "!text-muted-foreground hover:!text-foreground !cursor-pointer",
                dropdownIndicator: () =>
                  "!text-muted-foreground hover:!text-foreground !cursor-pointer",
              }}
              styles={{
                control: (base) => ({
                  ...base,
                  boxShadow: "none",
                }),
              }}
            />
          );
        },
      },
      {
        id: "actions",
        header: "",
        size: 1,
        cell: ({ row }) => {
          return (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(row.original)}
                className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                aria-label="Delete item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ];

    const table = useReactTable({
      data: items,
      columns,
      getCoreRowModel: getCoreRowModel(),
      meta: {
        updateData: (
          columnId: string,
          original: PartialItem,
          value: string,
        ) => {
          setItemState((state) => {
            const currentOptions: PartialItem =
              state[original.id] ?? ({} as PartialItem);
            const originalItemTypes = original?.itemTypes?.[0]?.id;
            return {
              ...state,
              [original.id]: {
                ...original,
                ...currentOptions,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                itemTypes: currentOptions.itemTypes || originalItemTypes,
                [columnId]: value,
              },
            };
          });
        },
      },
    });

    // Mobile card view
    if (isMobile) {
      return (
        <div className="flex flex-col gap-3">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const cells = row.getVisibleCells();
              const nameCell = cells[0];
              const priceCell = cells[1];
              const itemTypeCell = cells[2];

              return (
                <Card key={row.id} className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <label className="text-muted-foreground mb-1 block text-xs font-medium">
                          Name
                        </label>
                        {nameCell &&
                          flexRender(
                            nameCell.column.columnDef.cell,
                            nameCell.getContext(),
                          )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(row.original)}
                        className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 shrink-0"
                        aria-label="Delete item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs font-medium">
                        Price
                      </label>
                      {priceCell &&
                        flexRender(
                          priceCell.column.columnDef.cell,
                          priceCell.getContext(),
                        )}
                    </div>
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs font-medium">
                        Item Type
                      </label>
                      {itemTypeCell &&
                        flexRender(
                          itemTypeCell.column.columnDef.cell,
                          itemTypeCell.getContext(),
                        )}
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-8">
              <p className="text-muted-foreground text-center">No results.</p>
            </Card>
          )}
        </div>
      );
    }

    // Desktop table view
    return (
      <div className="flex flex-col gap-2">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  },
);

ItemsTable.displayName = "ItemsTable";
