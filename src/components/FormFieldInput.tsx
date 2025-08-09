"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import {
	FormFieldWrapper,
	type FormFieldWrapperProps,
} from "@/components/FormFieldWrapper";
import type { FieldValues, FieldPath } from "react-hook-form";

export interface FormFieldInputProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children"> {
	placeholder?: string;
	type?: string;
	disabled?: boolean;
	min?: number;
	max?: number;
	currency?: boolean;
	step?: number;
}

export function FormFieldInput<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	placeholder,
	type = "text",
	disabled,
	min,
	max,
	step,
	currency = false,
	...wrapperProps
}: FormFieldInputProps<TFieldValues, TName>) {
	return (
		<FormFieldWrapper<TFieldValues, TName> {...wrapperProps}>
			{(field) => (
				<div className="relative">
					{currency && (
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<span className="text-muted-foreground">$</span>
						</div>
					)}

					<Input
						className={currency ? "pl-9" : ""}
						type={type}
						placeholder={placeholder}
						{...field}
						disabled={disabled}
						min={min}
						max={max}
						step={step}
					/>
				</div>
			)}
		</FormFieldWrapper>
	);
}
