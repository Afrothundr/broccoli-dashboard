"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CombinedItemType } from "@/components/core/Inventory";
import { AtRiskReviewCard } from "./AtRiskReviewCard";
import type { ReviewDecision } from "./useAtRiskReview";

const HINT_LS_KEY = "broccoli:atRiskReview:hintSeen";

const SCALE_BY_DEPTH = [1, 0.96, 0.92] as const;
const Y_BY_DEPTH = [0, 8, 16] as const;
const Z_BY_DEPTH = [3, 2, 1] as const;

interface AtRiskReviewDeckProps {
  queue: CombinedItemType[];
  onDecision: (itemId: number, decision: ReviewDecision) => void;
  isLoading?: boolean;
}

export function AtRiskReviewDeck({
  queue,
  onDecision,
  isLoading = false,
}: AtRiskReviewDeckProps) {
  const prefersReducedMotion = useReducedMotion();
  const [showHint, setShowHint] = useState(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintDismissed = useRef(false);

  // Capture the initial queue length so the useEffect below can reference it
  // without taking a reactive dependency on queue (we only want to run once on mount).
  const initialQueueLength = useRef(queue.length);

  // Set up the swipe hint on first render
  useEffect(() => {
    let alreadySeen = false;
    try {
      alreadySeen = !!localStorage.getItem(HINT_LS_KEY);
    } catch {
      // localStorage unavailable (SSR / private browsing)
    }

    if (!alreadySeen && initialQueueLength.current > 0) {
      hintTimerRef.current = setTimeout(() => {
        if (!hintDismissed.current) {
          setShowHint(true);
        }
      }, 2000);
    }

    return () => {
      if (hintTimerRef.current !== null) {
        clearTimeout(hintTimerRef.current);
      }
    };
  }, []); // intentionally fires once on mount — uses ref to avoid reactive dep

  function handleDecision(itemId: number, decision: ReviewDecision) {
    // Dismiss the swipe hint on the first real action (not a skip)
    if (decision.type !== "skipped" && !hintDismissed.current) {
      hintDismissed.current = true;
      setShowHint(false);
      try {
        localStorage.setItem(HINT_LS_KEY, "1");
      } catch {
        // ignore
      }
    }

    onDecision(itemId, decision);
  }

  if (isLoading) {
    return (
      <div className="bg-muted mx-auto min-h-[400px] w-full max-w-sm animate-pulse rounded-2xl" />
    );
  }

  if (queue.length === 0) {
    return null;
  }

  const visibleCards = queue.slice(0, 3);

  return (
    <div className="relative min-h-[520px] w-full">
      <AnimatePresence mode="popLayout">
        {visibleCards.map((item, index) => (
          <motion.div
            key={item.id}
            className="absolute w-full"
            initial={{
              scale: SCALE_BY_DEPTH[index] ?? 0.92,
              y: Y_BY_DEPTH[index] ?? 16,
              zIndex: Z_BY_DEPTH[index] ?? 1,
              opacity: 0,
            }}
            animate={{
              scale: SCALE_BY_DEPTH[index] ?? 0.92,
              y: Y_BY_DEPTH[index] ?? 16,
              zIndex: Z_BY_DEPTH[index] ?? 1,
              opacity: 1,
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.15 },
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 300, damping: 30 }
            }
          >
            <AtRiskReviewCard
              item={item}
              isTop={index === 0}
              onDecision={(decision) => handleDecision(item.id, decision)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Swipe hint overlay */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            key="swipe-hint"
            className="pointer-events-none absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.3 }}
          >
            <motion.div
              animate={prefersReducedMotion ? {} : { x: [0, -14, 14, 0] }}
              transition={
                prefersReducedMotion
                  ? {}
                  : {
                      duration: 1.4,
                      repeat: Infinity,
                      repeatDelay: 0.6,
                      ease: "easeInOut",
                    }
              }
              className="bg-background/80 border-border text-muted-foreground flex items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-md backdrop-blur-sm"
            >
              <ArrowLeftRight size={16} />
              <span>Swipe to review</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
