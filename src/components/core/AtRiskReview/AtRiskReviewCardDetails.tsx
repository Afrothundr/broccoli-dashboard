import { motion } from "framer-motion";
import { useState } from "react";
import type { CombinedItemType } from "@/components/core/Inventory";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ItemStatusType } from "@/generated/prisma/client";

interface AtRiskReviewCardDetailsProps {
  item: CombinedItemType;
  onConfirm: (decision: {
    type: "updated";
    percentConsumed: number;
    status?: ItemStatusType;
  }) => void;
  onCancel: () => void;
}

export function AtRiskReviewCardDetails({
  item,
  onConfirm,
  onCancel,
}: AtRiskReviewCardDetailsProps) {
  const [percentConsumed, setPercentConsumed] = useState(item.percentConsumed);
  const [statusOverride, setStatusOverride] = useState<
    ItemStatusType | undefined
  >(undefined);

  const isDiscarded = statusOverride === ItemStatusType.DISCARDED;
  const isAllEaten =
    statusOverride === ItemStatusType.EATEN || percentConsumed === 100;

  function handlePercentChange(value: number) {
    setPercentConsumed(value);
    if (value === 100) {
      setStatusOverride(ItemStatusType.EATEN);
    }
  }

  function handleConfirm() {
    onConfirm({ type: "updated", percentConsumed, status: statusOverride });
  }

  const quickPicks = [0, 25, 50, 75, 100];

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
      className="overflow-hidden"
    >
      <div className="flex flex-col gap-4 px-4 pt-2 pb-4">
        {/* Percentage display */}
        <div className={isDiscarded ? "pointer-events-none opacity-50" : ""}>
          <p className="text-center text-5xl font-bold tabular-nums">
            {percentConsumed}%
          </p>

          {/* Range slider */}
          <Slider
            min={0}
            max={100}
            step={1}
            value={[percentConsumed]}
            onValueChange={([val]) =>
              handlePercentChange(val ?? percentConsumed)
            }
            className="mt-3"
          />

          {/* Quick-pick buttons */}
          <div className="mt-2 grid grid-cols-5 gap-1">
            {quickPicks.map((val) => (
              <Button
                key={val}
                type="button"
                variant={percentConsumed === val ? "default" : "outline"}
                size="sm"
                onClick={() => handlePercentChange(val)}
                className="px-0 text-xs"
              >
                {val}%
              </Button>
            ))}
          </div>
        </div>

        {/* Status action row */}
        <div className="grid grid-cols-3 gap-1">
          <Button
            type="button"
            variant={!statusOverride && !isAllEaten ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusOverride(undefined)}
            className="flex h-auto flex-col gap-0.5 py-2 text-xs"
          >
            <span>🍽</span>
            <span>Still eating</span>
          </Button>
          <Button
            type="button"
            variant={
              statusOverride === ItemStatusType.EATEN || percentConsumed === 100
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() => {
              setStatusOverride(ItemStatusType.EATEN);
              setPercentConsumed(100);
            }}
            className="flex h-auto flex-col gap-0.5 py-2 text-xs"
          >
            <span>✅</span>
            <span>All eaten</span>
          </Button>
          <Button
            type="button"
            variant={
              statusOverride === ItemStatusType.DISCARDED
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() => setStatusOverride(ItemStatusType.DISCARDED)}
            className="flex h-auto flex-col gap-0.5 py-2 text-xs"
          >
            <span>🗑</span>
            <span>Threw it out</span>
          </Button>
        </div>

        {/* Confirm button */}
        <Button
          className="w-full bg-green-700 text-white hover:bg-green-800"
          onClick={handleConfirm}
        >
          Save &amp; Next →
        </Button>

        {/* Cancel link */}
        <div className="text-center">
          <button
            type="button"
            className="text-muted-foreground text-sm underline"
            onClick={onCancel}
          >
            Never mind
          </button>
        </div>
      </div>
    </motion.div>
  );
}
