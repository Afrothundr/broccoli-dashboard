"use client";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import heicConvert from "heic-convert";
import { useRouter } from "next/navigation";
import pRetry from "p-retry";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { UploadButton, UploadDropzone } from "@/server/uploadthing/uploadthing";

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
  refetch?: () => Promise<void> | void;
  checkReceiptStatus?: () => Promise<boolean> | boolean;
  onSuccess?: () => void;
  onError?: () => void;
  style?: "button" | "dropzone" | "floating";
  label?: string;
}) => {
  const {
    createReceipt,
    createTrip,
    trips,
    refetch: refetchTrips,
  } = useGroceryTrips();
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
            <PlusCircle className="mr-0" />
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

        try {
          // Step 1: Create or get grocery trip
          let tripId = groceryTripId;
          if (!tripId) {
            const fallbackGroceryTrip = await createTrip({
              name: `${dayjs().format("dddd")} grocery trip`,
            });
            tripId = fallbackGroceryTrip?.id || 0;
          }

          // Step 2: Create receipts and queue them for processing
          const receiptIds: number[] = [];
          for (const image of res) {
            const receipt = await createReceipt({
              url: image.url,
              groceryTripId: tripId,
            });
            receiptIds.push(receipt?.id || 0);
            await processImageQueue({
              receiptId: receipt?.id || 0,
              url: image.ufsUrl,
            });
          }

          console.log(
            `Created ${receiptIds.length} receipts, starting polling...`,
          );

          // Step 3: Poll for receipt status changes
          const pollReceiptStatus = async (): Promise<boolean> => {
            // Refetch both the global trips data and the specific trip/gallery data
            await Promise.all([refetchTrips?.(), refetch?.()]);

            // Find the current trip in the updated trips data
            const currentTrip = trips.find((t) => t.id === tripId);

            if (!currentTrip) {
              console.warn("Trip not found after refetch");
              return false;
            }

            // Check if all our receipts are done processing
            const ourReceipts = currentTrip.receipts.filter((r) =>
              receiptIds.includes(r.id),
            );

            const allDone = ourReceipts.every(
              (receipt) => receipt.status !== "PROCESSING",
            );

            const processingCount = ourReceipts.filter(
              (r) => r.status === "PROCESSING",
            ).length;
            const importedCount = ourReceipts.filter(
              (r) => r.status === "IMPORTED",
            ).length;
            const errorCount = ourReceipts.filter(
              (r) => r.status === "ERROR",
            ).length;

            console.log(
              `Receipt status: ${processingCount} processing, ${importedCount} imported, ${errorCount} errors`,
            );

            return allDone;
          };

          // Step 4: Use pRetry to poll with exponential backoff
          await pRetry(
            async () => {
              const isReady = await pollReceiptStatus();

              if (!isReady) {
                throw new Error("Receipts still processing");
              }

              // Also call the custom status check if provided
              if (checkReceiptStatus) {
                const customCheckPassed = await checkReceiptStatus();
                if (!customCheckPassed) {
                  throw new Error("Custom status check failed");
                }
              }
            },
            {
              retries: 15,
              factor: 2,
              minTimeout: 1000,
              maxTimeout: 20000,
              onFailedAttempt: (error) => {
                console.log(
                  `Polling attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`,
                );
              },
            },
          );

          console.log("All receipts processed successfully!");

          // Step 5: Final refetch to ensure UI is in sync
          await Promise.all([refetchTrips?.(), refetch?.()]);

          onSuccess?.();
          toast.success("File(s) uploaded and processed!");

          if (style === "floating") {
            router.push("#");
          }
        } catch (error) {
          console.error("Error during upload completion:", error);
          onError?.();

          if (
            error instanceof Error &&
            error.message.includes("still processing")
          ) {
            toast.error(
              "Receipt processing timed out. Please refresh to see the latest status.",
            );
          } else {
            toast.error("There was a problem processing your upload");
          }
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
