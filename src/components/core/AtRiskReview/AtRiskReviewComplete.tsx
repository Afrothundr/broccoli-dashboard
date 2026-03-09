"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ItemStatusType } from "@/generated/prisma/client";
import type { ReviewResult } from "./useAtRiskReview";

interface AtRiskReviewCompleteProps {
  results: ReviewResult[];
  onClose: () => void;
}

interface StatBadgeProps {
  emoji: string;
  label: string;
}

function StatBadge({ emoji, label }: StatBadgeProps) {
  return (
    <span className="bg-muted flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium">
      {emoji} {label}
    </span>
  );
}

export function AtRiskReviewComplete({
  results,
  onClose,
}: AtRiskReviewCompleteProps) {
  const eatenCount = useMemo(
    () =>
      results.filter(
        (r) =>
          r.decision.type === "eaten" ||
          (r.decision.type === "updated" &&
            (r.decision.status === ItemStatusType.EATEN ||
              r.decision.percentConsumed === 100)),
      ).length,
    [results],
  );

  const discardedCount = useMemo(
    () =>
      results.filter(
        (r) =>
          r.decision.type === "discarded" ||
          (r.decision.type === "updated" &&
            r.decision.status === ItemStatusType.DISCARDED),
      ).length,
    [results],
  );

  const updatedCount = useMemo(
    () =>
      results.filter(
        (r) =>
          r.decision.type === "updated" &&
          r.decision.status !== ItemStatusType.EATEN &&
          r.decision.status !== ItemStatusType.DISCARDED,
      ).length,
    [results],
  );

  const skippedCount = useMemo(
    () => results.filter((r) => r.decision.type === "skipped").length,
    [results],
  );

  // Fire confetti once on mount if anything was eaten
  useEffect(() => {
    if (eatenCount > 0) {
      void import("canvas-confetti").then(({ default: confetti }) => {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#85c941", "#4ade80", "#22c55e"],
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty deps — intentionally fires once on mount

  const headline =
    eatenCount > 0 && discardedCount === 0 && skippedCount === 0
      ? "All done! 🎉"
      : eatenCount > 0 || discardedCount > 0
        ? "Nice work checking in! 🥦"
        : "No worries, check back tomorrow.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex h-full flex-col items-center justify-center gap-6 px-4 text-center"
    >
      <span className="text-6xl">{eatenCount > 0 ? "🥦" : "✨"}</span>

      <h2 className="text-2xl font-bold">{headline}</h2>

      <p className="text-muted-foreground">Your inventory is up to date.</p>

      {(eatenCount > 0 ||
        discardedCount > 0 ||
        updatedCount > 0 ||
        skippedCount > 0) && (
        <div className="flex flex-wrap justify-center gap-2">
          {eatenCount > 0 && (
            <StatBadge emoji="🍽" label={`${eatenCount} eaten`} />
          )}
          {discardedCount > 0 && (
            <StatBadge emoji="🗑" label={`${discardedCount} discarded`} />
          )}
          {updatedCount > 0 && (
            <StatBadge emoji="✏" label={`${updatedCount} updated`} />
          )}
          {skippedCount > 0 && (
            <StatBadge emoji="⏭" label={`${skippedCount} skipped`} />
          )}
        </div>
      )}

      <Button className="w-full" onClick={onClose}>
        Done
      </Button>
    </motion.div>
  );
}
