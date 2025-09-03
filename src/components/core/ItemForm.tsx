"use client";
import { useItemTypes } from "@/hooks/useItemTypes";
import {
  updateItemFormSchema,
  type UpdateItemFormSchemaType,
  type UpdateItemSchemaType,
} from "@/schemas/update-item";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { AdvancedSelect } from "../AdvancedSelect";
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
        itemTypes: data.itemTypes.length
          ? data.itemTypes.map((type) => ({
              id: Number.parseInt(type as unknown as string),
            }))
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
      itemTypes: [],
      percentConsumed: defaultValues?.percentConsumed ?? 0,
      status: defaultValues?.status ?? ItemStatusType.FRESH,
    },
  });
  const { reset, setValue, watch } = form;
  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        itemTypes: defaultValues?.itemTypes?.map((type) =>
          type?.id?.toString(),
        ),
        price: Number.parseFloat(`${defaultValues.price}`)
          .toFixed(2)
          .toString(),
        status:
          defaultValues.status === ItemStatusType.DISCARDED ||
          defaultValues.status === ItemStatusType.EATEN
            ? defaultValues.status
            : undefined,
      } as UpdateItemFormSchemaType & { itemTypes: string[] });
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
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
          {(field) => (
            <AdvancedSelect
              {...field}
              options={itemTypes.map((type) => ({
                label: type.name,
                value: type.id.toString(),
              }))}
              onValueChange={field.onChange}
              searchable
              placeholder="Select item types"
              loading={isLoadingItemTypes}
            />
          )}
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
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {isLoading && <Spinner />}
            {isImport ? "Skip" : "Cancel"}
          </Button>
          <Button
            type="submit"
            variant={isImport ? "outline" : "default"}
            disabled={isLoading}
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
        itemTypes: data.itemTypes.length
          ? data.itemTypes.map((type) => ({
              id: Number.parseInt(type as unknown as string),
            }))
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
      itemTypes: [],
      percentConsumed: defaultValues?.percentConsumed ?? 0,
      status: defaultValues?.status ?? ItemStatusType.FRESH,
    },
  });
  const { reset, setValue } = form;
  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        itemTypes: defaultValues?.itemTypes?.map((type) =>
          type?.id?.toString(),
        ),
        price: Number.parseFloat(`${defaultValues.price}`)
          .toFixed(2)
          .toString(),
        status:
          defaultValues.status === ItemStatusType.DISCARDED ||
          defaultValues.status === ItemStatusType.EATEN
            ? defaultValues.status
            : undefined,
      } as UpdateItemFormSchemaType & { itemTypes: string[] });
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
        <div className="space-y-3">
          <label className="text-sm font-medium dark:text-gray-300">
            Status
          </label>
          <div className="mb-3 grid grid-cols-1 gap-2">
            {[
              {
                label: "In progress",
                value: undefined,
                leftIcon: Clock7,
                activeColor: "bg-gray-700!",
              },
              {
                label: "Eaten",
                value: ItemStatusType.EATEN,
                leftIcon: Utensils,
                activeColor: "bg-green-700!",
              },
              {
                label: "Discarded",
                value: ItemStatusType.DISCARDED,
                leftIcon: Trash,
                activeColor: "bg-red-700!",
              },
            ].map((option) => {
              const Icon = option.leftIcon;
              const isSelected = form.watch("status") === option.value;

              return (
                <Button
                  type="button"
                  variant="outline"
                  key={option.value}
                  onClick={() =>
                    form.setValue("status", option.value as ItemStatusType)
                  }
                  className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all duration-200 ${
                    isSelected
                      ? `${option.activeColor} text-white shadow-lg`
                      : "dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300"
                  } `}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">{option.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
        <FormFieldWrapper
          name="percentConsumed"
          label={
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium dark:text-gray-300">
                How much did you eat?
              </label>
              <span className="mr-6 rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                {form.watch("percentConsumed")}%
              </span>
            </div>
          }
        >
          {(field) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const { value, ...rest } = field;
            return (
              <div className="mt-2 flex flex-col items-center gap-3">
                <Slider
                  {...rest}
                  value={[value ?? 0]}
                  onValueChange={(rest) => {
                    setValue("percentConsumed", Number(rest?.[0]) ?? 0);
                  }}
                  onValueCommit={(commit) => {
                    setValue("percentConsumed", Number(commit?.[0]) ?? 0);
                  }}
                />
                <div className="flex w-full justify-between gap-2">
                  {[0, 25, 50, 75, 100].map((percentage) => (
                    <Button
                      type="button"
                      key={percentage}
                      variant="outline"
                      size="sm"
                      onClick={() => setValue("percentConsumed", percentage)}
                      className={`h-8 flex-1 text-xs dark:border-gray-700 ${
                        (form.watch("percentConsumed") ?? 0) <= percentage
                          ? "dark:text-white"
                          : "bg-gray-400/50"
                      } `}
                    >
                      {percentage}%
                    </Button>
                  ))}
                </div>
              </div>
            );
          }}
        </FormFieldWrapper>
        <hr className="mt-6" />
        <div className="mt-6 flex justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading && <Spinner />}
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading && <Spinner />}Update
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
