import * as React from "react";

declare module "@radix-ui/react-slot" {
  export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode;
    [key: string]: any;
  }

  export const Slot: React.ForwardRefExoticComponent<
    SlotProps & React.RefAttributes<HTMLElement>
  >;

  export const Slottable: React.FC<{ children: React.ReactNode }>;
}
