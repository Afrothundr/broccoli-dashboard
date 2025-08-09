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
  defaultValues?: UpdateItemSchemaType;
  onSubmit: (values: UpdateItemSchemaType) => void;
  onCancel: () => void;
  isImport?: boolean;
  isLoading?: boolean;
}) => {
  const { types: itemTypes, isLoading: isLoadingItemTypes } = useItemTypes();
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
      status: ItemStatusType.FRESH,
    },
  });
  const { reset, setValue, watch } = form;
  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        itemTypes: defaultValues.itemTypes.map((type) => type?.id?.toString()),
        price: defaultValues.price.toFixed(2),
        status:
          defaultValues.status === ItemStatusType.DISCARDED ||
          defaultValues.status === ItemStatusType.EATEN
            ? defaultValues.status
            : undefined,
      });
    }
  }, [defaultValues, reset]);

  const handleSubmit = (values: UpdateItemFormSchemaType) => {
    const parsedValues = {
      ...values,
      price: Number.parseFloat(values.price as unknown as string),
      status: values.status ?? defaultValues?.status,
    };
    onSubmit(parsedValues as UpdateItemFormSchemaType);
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
                    (watch("status") as ItemStatusType) ||
                      defaultValues?.status,
                  )}
                >
                  {watch("status") || defaultValues?.status}
                </Badge>
              </div>
            }
            wrapperClassName="flex flex-col w-fit"
            options={[
              { label: "In progress", value: "", leftIcon: Clock7 },
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
              const { value, ...rest } = field;
              return (
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-muted-foreground text-sm">0%</span>
                  <Slider
                    {...rest}
                    defaultValue={[value]}
                    onValueCommit={(commit) =>
                      setValue("percentConsumed", commit?.[0] || 0)
                    }
                  />
                  <span className="text-muted-foreground text-sm">100%</span>
                </div>
              );
            }}
          </FormFieldWrapper>
        )}
        <div className="mt-6 flex justify-end gap-3">
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
