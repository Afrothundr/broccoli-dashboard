"use client";

import {
  AnimatePresence,
  type MotionStyle,
  motion,
  type PanInfo,
  useAnimation,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { ChevronDown, Trash2, Utensils } from "lucide-react";
import { useState } from "react";
import { CustomBadge } from "@/components/CustomBadge";
import type { CombinedItemType } from "@/components/core/Inventory";
import { Button } from "@/components/ui/button";
import { ItemStatusType } from "@/generated/prisma/client";
import { getDaysUntilExpiration } from "@/utils/expiration";
import { AtRiskReviewCardDetails } from "./AtRiskReviewCardDetails";
import { AtRiskReviewCardOverlay } from "./AtRiskReviewCardOverlay";
import type { ReviewDecision } from "./useAtRiskReview";

const SWIPE_THRESHOLD = 80;

interface AtRiskReviewCardProps {
  item: CombinedItemType;
  onDecision: (decision: ReviewDecision) => void;
  style?: MotionStyle;
  isTop: boolean;
}

function getStatusStripClass(status: ItemStatusType): string {
  switch (status) {
    case ItemStatusType.BAD:
      return "border-t-4 border-red-600 bg-red-50 dark:bg-red-950/30";
    case ItemStatusType.OLD:
      return "border-t-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30";
    case ItemStatusType.FRESH:
      return "border-t-4 border-orange-500 bg-orange-50 dark:bg-orange-950/30";
    default:
      return "border-t-4 border-muted bg-muted/30";
  }
}

/**
 * Returns badge color tokens as [lightColor, darkColor].
 * Light-mode uses 700/800-scale to meet 4.5:1 contrast on the tinted strip bg.
 * Dark-mode keeps the original 400-scale which already passes (4.57–6.72:1).
 */
function getStatusBadgeColors(status: ItemStatusType): {
  color: string;
  darkColor: string;
} {
  switch (status) {
    case ItemStatusType.BAD:
      return { color: "red-800", darkColor: "red-400" };
    case ItemStatusType.OLD:
      // amber-800 (#92400e) gives 6.2:1 on the yellow-tinted bg in light mode
      return { color: "amber-800", darkColor: "yellow-400" };
    case ItemStatusType.FRESH:
      // orange-800 (#9a3412) gives ~5.5:1 on the orange-tinted bg in light mode
      return { color: "orange-800", darkColor: "orange-400" };
    default:
      return { color: "stone-700", darkColor: "stone-400" };
  }
}

function getUrgencyCopy(item: CombinedItemType): string {
  switch (item.status) {
    case ItemStatusType.BAD:
      return "Use immediately";
    case ItemStatusType.OLD:
      return "Going bad soon";
    case ItemStatusType.FRESH: {
      const days = getDaysUntilExpiration(item);
      return `Expires in ${days} day${days !== 1 ? "s" : ""}`;
    }
    default:
      return "";
  }
}

export function AtRiskReviewCard({
  item,
  onDecision,
  style,
  isTop,
}: AtRiskReviewCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  // Always call useTransform (hooks must not be conditional), but only apply
  // the result when the user hasn't requested reduced motion.
  const rotateTransform = useTransform(dragX, [-200, 0, 200], [-15, 0, 15]);
  const controls = useAnimation();

  const [showDetails, setShowDetails] = useState(false);

  function handleDragEnd(_: PointerEvent, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      if ("vibrate" in navigator) navigator.vibrate(50);
      onDecision({ type: "eaten" });
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      if ("vibrate" in navigator) navigator.vibrate(50);
      onDecision({ type: "discarded" });
    } else if (info.offset.y < -SWIPE_THRESHOLD) {
      onDecision({ type: "skipped" });
    } else {
      dragX.set(0);
      dragY.set(0);
    }
  }

  async function handleEatenButtonClick() {
    if ("vibrate" in navigator) navigator.vibrate(50);
    if (prefersReducedMotion) {
      await controls.start({ opacity: 0, transition: { duration: 0.2 } });
    } else {
      await controls.start({
        x: 300,
        opacity: 0,
        transition: { duration: 0.3 },
      });
    }
    onDecision({ type: "eaten" });
  }

  async function handleDiscardButtonClick() {
    if ("vibrate" in navigator) navigator.vibrate(50);
    if (prefersReducedMotion) {
      await controls.start({ opacity: 0, transition: { duration: 0.2 } });
    } else {
      await controls.start({
        x: -300,
        opacity: 0,
        transition: { duration: 0.3 },
      });
    }
    onDecision({ type: "discarded" });
  }

  const stripClass = getStatusStripClass(item.status as ItemStatusType);
  const { color: badgeColor, darkColor: badgeDarkColor } = getStatusBadgeColors(
    item.status as ItemStatusType,
  );
  const urgency = getUrgencyCopy(item);
  const itemTypeName = item.itemTypes[0]?.name;

  return (
    <motion.div
      drag={isTop ? true : false}
      dragConstraints={{ left: 0, right: 0, top: -100, bottom: 0 }}
      dragElastic={0.7}
      whileDrag={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{
        x: dragX,
        y: dragY,
        rotate: prefersReducedMotion ? 0 : rotateTransform,
        ...style,
      }}
      className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl select-none dark:bg-zinc-900"
    >
      {/* Status top strip */}
      <div className={`px-4 pt-3 pb-2 ${stripClass}`}>
        <div className="flex items-center justify-between">
          <CustomBadge color={badgeColor} darkColor={badgeDarkColor} size="sm">
            {item.status}
          </CustomBadge>
          {/* Use text-foreground instead of text-muted-foreground so urgency copy
              clears 4.5:1 on the tinted strip backgrounds (muted-fg only gives ~4.1:1) */}
          <span className="text-foreground text-sm">{urgency}</span>
        </div>
      </div>

      {/* Card body */}
      <div className="relative px-4 py-3">
        {/* Swipe overlays — absolutely positioned over the card body */}
        <AtRiskReviewCardOverlay dragX={dragX} threshold={SWIPE_THRESHOLD} />

        {/* Item info */}
        <div className="mb-3">
          <h2 className="text-2xl leading-tight font-bold">{item.name}</h2>
          {itemTypeName && (
            <p className="text-muted-foreground mt-0.5 text-sm">
              {itemTypeName}
            </p>
          )}
          <p className="text-muted-foreground mt-1 text-sm">
            Currently {item.percentConsumed}% consumed
          </p>
        </div>

        {/* Action buttons — only shown on top card */}
        {isTop && (
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                autoFocus={isTop}
                type="button"
                className="flex-1 gap-1.5 bg-green-700 text-white hover:bg-green-800"
                onClick={handleEatenButtonClick}
              >
                <Utensils size={16} />
                Eaten
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1 gap-1.5"
                onClick={handleDiscardButtonClick}
              >
                <Trash2 size={16} />
                Discard
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-1.5"
              onClick={() => setShowDetails((prev) => !prev)}
            >
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`}
              />
              Update details
            </Button>
          </div>
        )}
      </div>

      {/* Expandable details panel */}
      <AnimatePresence>
        {isTop && showDetails && (
          <AtRiskReviewCardDetails
            item={item}
            onConfirm={(decision) => {
              setShowDetails(false);
              onDecision(decision);
            }}
            onCancel={() => setShowDetails(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
