"use client";
import { useItemTypes } from "@/hooks/useItemTypes";
import {
  updateItemFormSchema,
  type UpdateItemFormSchemaType,
  type UpdateItemSchemaType,
} from "@/schemas/update-item";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import Select from "react-select";
import { FormFieldInput } from "../FormFieldInput";
import { FormFieldWrapper } from "../FormFieldWrapper";
import { useEffect } from "react";
import { Slider } from "../ui/slider";
import { ItemStatusType } from "@/generated/prisma";
import { FormFieldSegmentedControl } from "../FormFieldSegmentedControl";
import { Clock7, Trash, Utensils } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Spinner } from "../Spinner";

export function getItemStatusColor(status?: ItemStatusType) {
  switch (status) {
    case ItemStatusType.BAD:
      return "red-400";
    case ItemStatusType.OLD:
      return "yellow-400";
    case ItemStatusType.FRESH:
      return "green-400";
    case ItemStatusType.EATEN:
      return "stone-400";
    case ItemStatusType.DISCARDED:
      return "neutral-400";
    default:
      return "";
  }
}

export const ItemForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isImport = false,
  isLoading = false,
}: {
  defaultValues?: Partial<UpdateItemSchemaType>;
  onSubmit: (values: UpdateItemSchemaType) => void;
  onCancel: () => void;
  isImport?: boolean;
  isLoading?: boolean;
}) => {
  const { allTypes: itemTypes, isLoading: isLoadingItemTypes } = useItemTypes();
  const form = useForm<UpdateItemFormSchemaType>({
    resolver: async (data, context, options) => {
      const transformedData = {
        ...data,
        itemTypes: data.itemTypes
          ? [{ id: Number.parseInt(data.itemTypes as unknown as string) }]
          : [],
      };
      return zodResolver(updateItemFormSchema)(
        transformedData,
        context,
        options,
      );
    },
    defaultValues: {
      name: "",
      description: "",
      price: "0",
      quantity: 1,
      unit: "",
      importId: "",
      itemTypes: undefined,
      percentConsumed: defaultValues?.percentConsumed ?? 0,
      status: defaultValues?.status ?? ItemStatusType.FRESH,
    },
  });
  const { reset, setValue, watch } = form;
  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        itemTypes: defaultValues?.itemTypes?.[0]?.id?.toString(),
        price: Number.parseFloat(`${defaultValues.price}`)
          .toFixed(2)
          .toString(),
        status:
          defaultValues.status === ItemStatusType.DISCARDED ||
          defaultValues.status === ItemStatusType.EATEN
            ? defaultValues.status
            : undefined,
      } as UpdateItemFormSchemaType & { itemTypes: string });
    }
  }, [defaultValues, reset]);

  const handleSubmit = (values: UpdateItemFormSchemaType) => {
    const parsedValues = {
      ...values,
      id: values.id ?? defaultValues?.id,
      price: values.price,
      quantity: values.quantity ?? defaultValues?.quantity ?? 1,
      groceryTripId: values.groceryTripId ?? defaultValues?.groceryTripId,
      percentConsumed:
        values.percentConsumed ?? defaultValues?.percentConsumed ?? 0,
      status: values.status ?? defaultValues?.status,
    };
    onSubmit(parsedValues as UpdateItemSchemaType);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-2 p-1"
      >
        <FormFieldInput
          label="Name"
          name="name"
          type="text"
          placeholder="Name"
        />
        <FormFieldInput
          label="Price"
          name="price"
          type="number"
          min={0}
          max={10000}
          step={0.01}
          currency={true}
          placeholder="0.00"
        />
        <FormFieldWrapper name="itemTypes" label="Item Type">
          {(field) => {
            const selectedOption = itemTypes.find(
              (type) => type.id.toString() === field.value,
            );
            return (
              <Select
                {...field}
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
                  field.onChange(selected ? selected.value : "");
                }}
                isSearchable
                placeholder="Select item type"
                isLoading={isLoadingItemTypes}
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
          }}
        </FormFieldWrapper>
        {!isImport && (
          <FormFieldSegmentedControl
            name="status"
            label={
              <div className="flex items-center gap-1">
                <span>Status:</span>
                <Badge
                  color={getItemStatusColor(
                    watch("status")! || defaultValues?.status,
                  )}
                >
                  {watch("status") ?? defaultValues?.status}
                </Badge>
              </div>
            }
            wrapperClassName="flex flex-col w-fit"
            options={[
              {
                label: "In progress",
                value: defaultValues?.status ?? "",
                leftIcon: Clock7,
              },
              {
                label: "Eaten",
                value: ItemStatusType.EATEN,
                leftIcon: Utensils,
              },
              {
                label: "Discarded",
                value: ItemStatusType.DISCARDED,
                leftIcon: Trash,
              },
            ]}
          />
        )}
        {!isImport && (
          <FormFieldWrapper
            name="percentConsumed"
            label="How much did you eat?"
          >
            {(field) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              const { value, ...rest } = field;
              return (
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-muted-foreground text-sm">0%</span>
                  <Slider
                    {...rest}
                    defaultValue={[value]}
                    onValueCommit={(commit) =>
                      setValue("percentConsumed", commit?.[0] ?? 0)
                    }
                  />
                  <span className="text-muted-foreground text-sm">100%</span>
                </div>
              );
            }}
          </FormFieldWrapper>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="grow-2"
          >
            {isLoading && <Spinner />}
            Cancel
          </Button>
          <Button
            type="submit"
            variant={isImport ? "outline" : "default"}
            disabled={isLoading}
            className="grow-2"
          >
            {isLoading && <Spinner />}
            {isImport ? "Import" : "Update"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export const UpdateItemForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: {
  defaultValues?: Partial<UpdateItemSchemaType>;
  onSubmit: (values: UpdateItemSchemaType) => void;
  onCancel: () => void;
  isImport?: boolean;
  isLoading?: boolean;
}) => {
  const form = useForm<UpdateItemFormSchemaType>({
    resolver: async (data, context, options) => {
      const transformedData = {
        ...data,
        percentConsumed: Number(data.percentConsumed) ?? 0,
        itemTypes: data.itemTypes
          ? [{ id: Number.parseInt(data.itemTypes as unknown as string) }]
          : [],
      };
      return zodResolver(updateItemFormSchema)(
        transformedData,
        context,
        options,
      );
    },
    defaultValues: {
      name: "",
      description: "",
      price: "0",
      quantity: 1,
      unit: "",
      importId: "",
      itemTypes: undefined,
      percentConsumed: defaultValues?.percentConsumed ?? 0,
      status: defaultValues?.status ?? ItemStatusType.FRESH,
    },
  });
  const { reset, setValue, watch } = form;
  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        itemTypes: defaultValues?.itemTypes?.[0]?.id?.toString(),
        price: Number.parseFloat(`${defaultValues.price}`)
          .toFixed(2)
          .toString(),
        status:
          defaultValues.status === ItemStatusType.DISCARDED ||
          defaultValues.status === ItemStatusType.EATEN
            ? defaultValues.status
            : undefined,
      } as UpdateItemFormSchemaType & { itemTypes: string });
    }
  }, [defaultValues, reset]);

  const handleSubmit = (values: UpdateItemFormSchemaType) => {
    const parsedValues = {
      ...values,
      id: values.id ?? defaultValues?.id,
      price: values.price,
      quantity: values.quantity ?? defaultValues?.quantity ?? 1,
      groceryTripId: values.groceryTripId ?? defaultValues?.groceryTripId,
      percentConsumed:
        values.percentConsumed ?? defaultValues?.percentConsumed ?? 0,
      status: values.status ?? defaultValues?.status,
    };
    onSubmit(parsedValues as UpdateItemSchemaType);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="bg-muted/50 flex flex-col items-center gap-2 rounded-lg p-6">
          <span className="text-muted-foreground text-sm font-medium">
            Percentage Consumed
          </span>
          <span className="text-5xl font-bold tabular-nums">
            {watch("percentConsumed")}%
          </span>
        </div>

        <div className="space-y-4">
          <input
            type="range"
            min="0"
            max="100"
            value={watch("percentConsumed")}
            onChange={(e) =>
              setValue("percentConsumed", Number(e.target.value))
            }
            className="bg-muted accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg"
          />
          <div className="grid grid-cols-5 gap-2">
            {[0, 25, 50, 75, 100].map((percentage) => (
              <Button
                type="button"
                key={percentage}
                variant={
                  watch("percentConsumed") === percentage
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => setValue("percentConsumed", percentage)}
                className="h-10 text-xs font-medium"
              >
                {percentage}%
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <label className="mb-3 text-sm font-medium">
            Did you finish? What happened to it?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={watch("status") === "EATEN" ? "default" : "outline"}
              onClick={() =>
                watch("status") === "EATEN"
                  ? setValue("status", undefined)
                  : setValue("status", ItemStatusType.EATEN)
              }
              className={`flex h-30 flex-col items-center justify-center gap-2 ${
                watch("status") === "EATEN"
                  ? "bg-green-700 text-white hover:bg-green-800 dark:bg-green-800 dark:hover:bg-green-700"
                  : ""
              }`}
            >
              <Utensils className="h-6 w-6" />
              <span className="font-semibold">Eaten</span>
              <span
                className={
                  watch("status") === "EATEN"
                    ? "text-sm text-green-100"
                    : "text-muted-foreground text-sm"
                }
              >
                Ate it all!
              </span>
            </Button>
            <Button
              type="button"
              variant={watch("status") === "DISCARDED" ? "default" : "outline"}
              onClick={() =>
                watch("status") === "DISCARDED"
                  ? setValue("status", undefined)
                  : setValue("status", ItemStatusType.DISCARDED)
              }
              className={`flex h-30 flex-col items-center justify-center gap-2 ${
                watch("status") === "DISCARDED"
                  ? "bg-red-700 text-white hover:bg-red-800 dark:bg-red-900 dark:hover:bg-red-800"
                  : ""
              }`}
            >
              <Trash className="h-6 w-6" />
              <span className="font-semibold">Discarded</span>
              <span
                className={
                  watch("status") === "DISCARDED"
                    ? "text-sm text-red-100"
                    : "text-muted-foreground text-sm"
                }
              >
                Threw some away...
              </span>
            </Button>
          </div>
        </div>
        <hr className="mt-6" />
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-12 flex-1 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isLoading}
            className="h-12 flex-1"
          >
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
