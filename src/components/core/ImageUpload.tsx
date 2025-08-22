"use client";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import heicConvert from "heic-convert";
import { useRouter } from "next/navigation";
import pRetry from "p-retry";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { UploadButton, UploadDropzone } from "@/server/uploadthing/uploadthing";
import type { GroceryTrip } from "@/generated/prisma";
import { processImageQueue } from "@/app/api/queue/processImageQueue";
import { useGroceryTrips } from "@/hooks/useGroceryTrips";

export const ImageUpload = ({
  groceryTripId,
  refetch,
  checkReceiptStatus,
  onSuccess,
  onError,
  style = "button",
}: {
  groceryTripId?: number;
  refetch?: () => void;
  checkReceiptStatus?: () => unknown;
  onSuccess?: () => void;
  onError?: () => void;
  style?: "button" | "dropzone" | "floating";
  label?: string;
}) => {
  const { createReceipt, createTrip } = useGroceryTrips();
  const router = useRouter();

  const Component = (() => {
    switch (style) {
      case "dropzone":
        return UploadDropzone;
      case "floating":
      case "button":
        return UploadButton;
    }
  })();
  const getContent = () => {
    switch (style) {
      case "button":
        return (
          <div className="bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 inline-flex h-15 w-15 cursor-pointer items-center justify-center rounded-full border-3 border-dashed text-slate-500 shadow-xs transition-all">
            <PlusCircle className="h-5 w-5" />
          </div>
        );
      case "dropzone":
        return <span>Upload</span>;
      case "floating":
        return (
          <div className="z-49 flex">
            <PlusCircle className="mr-0 sm:mr-2" />
            <span className="ml-2">Add Receipt</span>
          </div>
        );
    }
  };

  return (
    <Component
      endpoint="imageUploader"
      content={{
        button: getContent(),
      }}
      className={cn({
        "ut-label!h-auto": style === "button",
      })}
      appearance={{
        button({
          ready,
          isUploading,
        }: {
          ready: boolean;
          isUploading: boolean;
        }) {
          return cn(
            {
              "!bg-[#72b455]": style === "floating",
              "!bg-transparent !h-auto !w-auto": style === "button",
            },
            `custom-button ${ready ? "" : "custom-button-not-ready"} ${
              isUploading ? "custom-button-uploading" : ""
            }`,
          );
        },
        container: cn({
          "!border-none": style === "button",
        }),
        allowedContent: cn({
          "!hidden": style === "floating" || style === "button",
        }),
      }}
      onBeforeUploadBegin={async (input) => {
        const convertedFiles: File[] = [];

        for (const file of input) {
          if (file.type === "image/heic" || file.name.endsWith(".heic")) {
            try {
              const buffer = await file.arrayBuffer();
              const jpegBuffer = await heicConvert({
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                buffer: Buffer.from(buffer) as any,
                format: "JPEG",
              });

              const jpgFile = new File(
                [jpegBuffer],
                file.name.replace(/\.heic$/i, ".jpg"),
                {
                  type: "image/jpeg",
                },
              );

              convertedFiles.push(jpgFile);
            } catch (error) {
              console.error("Error converting HEIC to JPEG:", error);
              onError?.();
              toast.error("There was a problem converting your image");
              break;
            }
          } else {
            convertedFiles.push(file);
          }
        }

        return convertedFiles;
      }}
      onClientUploadComplete={async (res) => {
        if (res.length < 1) return;
        let fallbackGroceryTrip: GroceryTrip | undefined = {
          id: 0,
        } as unknown as GroceryTrip;
        if (!groceryTripId) {
          fallbackGroceryTrip = await createTrip({
            name: `${dayjs().format("dddd")} grocery trip`,
          });
        }
        res?.forEach(async (image, index) => {
          const receipt = await createReceipt({
            url: image.url,
            groceryTripId: groceryTripId || fallbackGroceryTrip?.id || 0,
          });
          await processImageQueue({
            receiptId: receipt?.id || 0,
            url: image.ufsUrl,
          });
          if (res.length === index + 1) {
            await refetch?.();
            if (checkReceiptStatus)
              await pRetry(checkReceiptStatus, { factor: 3 });
            onSuccess?.();
          }
        });

        toast.success("File(s) uploaded!");
        if (style === "floating") {
          await router.push("#");
        }
      }}
      onUploadError={(error: Error) => {
        console.error("ERROR", error);
        onError?.();
        toast.error(error.message);
      }}
    />
  );
};
