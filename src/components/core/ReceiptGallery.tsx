"use client";
import Image from "next/image";
import type { Receipt } from "@/generated/prisma";
import { ImageUpload } from "./ImageUpload";
import { cn } from "@/lib/utils";
import { Spinner } from "../Spinner";
import { AlertCircle } from "lucide-react";

// Utility functions for image shimmer effect
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

interface ReceiptGalleryProps {
  receipts: Receipt[];
  tripId: number;
  handleReceiptClick: (index: number) => void;
  activeReceipt?: number;
  refetchTrip: () => void;
}

export const ReceiptGallery: React.FC<ReceiptGalleryProps> = ({
  receipts,
  tripId,
  handleReceiptClick,
  activeReceipt,
  refetchTrip,
}) => {
  return (
    <div className="mb-4 flex flex-col gap-2">
      <p className="text-md leading-none font-semibold">Receipts</p>
      <div className="flex gap-3">
        {receipts.map((receipt, index) => {
          const classes = cn(
            "h-15 w-15 rounded-full flex items-center justify-center",
            {
              "border-primary border-4": receipt.id === activeReceipt,
            },
          );

          // Render based on receipt status
          if (receipt.status === "PROCESSING") {
            return (
              <div
                key={receipt.id}
                className={cn(classes, "border-2 border-gray-300 bg-gray-100")}
              >
                <Spinner size="sm" className="text-gray-500" />
              </div>
            );
          }

          if (receipt.status === "ERROR") {
            return (
              <div
                key={receipt.id}
                className={cn(
                  classes,
                  "cursor-pointer border-2 border-red-300 bg-red-100",
                )}
                onClick={() => handleReceiptClick(index)}
              >
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
            );
          }

          // Default case for IMPORTED status - show the image
          return (
            <Image
              src={receipt.url}
              alt={`receipt ${index}`}
              key={receipt.id}
              className={classes}
              width={15}
              height={15}
              placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
              onClick={() => handleReceiptClick(index)}
            />
          );
        })}
        <ImageUpload
          style="button"
          groceryTripId={tripId}
          refetch={refetchTrip}
        />
      </div>
    </div>
  );
};
