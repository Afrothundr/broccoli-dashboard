"use client";
import { useEffect, useState } from "react";
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
import { Button } from "../ui/button";
import { InputSelectTrigger, SearchableSelect } from "../SearchableSelect";
import { useItemTypes } from "@/hooks/useItemTypes";
import { useItems } from "@/hooks/useItems";
interface ItemsTableProps {
  items: any[];
  onCancel: () => void;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({ items, onCancel }) => {
  const [itemState, setItemState] = useState<Record<number, any>>({});
  const { types: itemTypes } = useItemTypes();
  const { updateItem } = useItems();

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Name",
      size: 5,
      cell: ({ row, table, row: { getValue }, column: { id: columnId } }) => {
        const initialValue =
          itemState[row.original.id]?.name || getValue("name");
        const [value, setValue] = useState(initialValue);
        const onBlur = () => {
          table.options.meta?.updateData(columnId, row.original, value);
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
            defaultValue={initialValue as string}
            value={value as string}
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
          table.options.meta?.updateData(columnId, row.original, value);
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
        const initialValue = (getValue("itemTypes") as any[]) || [];
        const initialValueId = initialValue[0]?.id;
        const startingValue =
          itemState?.[row.original.id]?.itemTypes || initialValueId;
        const [value, setValue] = useState(startingValue);
        const updateTableState = (val: string) => {
          table.options.meta?.updateData(columnId, row.original, val);
        };
        useEffect(() => {
          setValue(`${startingValue}`);
        }, [startingValue]);

        return (
          <SearchableSelect
            options={itemTypes.map((type) => ({
              label: type.name,
              value: type.id.toString(),
            }))}
            value={`${value}`}
            onValueChange={(val) => {
              setValue(val);
              updateTableState(val);
            }}
            placeholder="Select item type"
          >
            {(provided) => <InputSelectTrigger {...provided} />}
          </SearchableSelect>
        );
      },
    },
  ];

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (columnId, original, value) => {
        setItemState((state) => {
          const currentOptions = state[original.id] ?? {};
          const originalItemTypes = original?.itemTypes?.[0]?.id;
          return {
            ...state,
            [original.id]: {
              ...original,
              ...currentOptions,
              itemTypes: currentOptions.itemTypes || originalItemTypes,
              [columnId]: value,
            },
          };
        });
      },
    },
  });

  const onSave = () => {
    for (const update of Object.values(itemState)) {
      const itemUpdate = {
        ...update,
        price: Number.parseFloat(`${update.price}`),
        itemTypes: [{ id: Number.parseInt(`${update.itemTypes}`) }],
      };
      updateItem(itemUpdate);
    }
    onCancel();
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-md mb-3 leading-none font-semibold">Items</p>
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
      <div className="mt-6 mb-4 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>Save and Close</Button>
      </div>
    </div>
  );
};
