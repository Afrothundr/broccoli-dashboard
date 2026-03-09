"use client";

import { X } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { BottomDrawer } from "@/components/BottomDrawer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQueries } from "@/context/MediaQueriesContext";
import { AtRiskReviewComplete } from "./AtRiskReviewComplete";
import { AtRiskReviewDeck } from "./AtRiskReviewDeck";
import { useAtRiskReview } from "./useAtRiskReview";
import { useAtRiskReviewSession } from "./useAtRiskReviewSession";

export function AtRiskReviewModal() {
  const { isMobile } = useMediaQueries();
  const session = useAtRiskReviewSession();
  const review = useAtRiskReview();

  const shouldOpen =
    isMobile && session.shouldShow && (review.isLoading || !review.isEmpty);

  const [isOpen, setIsOpen] = useState(shouldOpen);

  // Save element focused before modal opens so we can restore it on close
  const previousFocusRef = useRef<Element | null>(null);

  // Track the previous isOpen to detect open transitions
  const wasOpen = useRef(isOpen);

  useEffect(() => {
    if (!wasOpen.current && isOpen) {
      // Modal just opened — save current focus
      previousFocusRef.current = document.activeElement;
    } else if (wasOpen.current && !isOpen) {
      // Modal just closed — restore focus
      if (previousFocusRef.current && "focus" in previousFocusRef.current) {
        (previousFocusRef.current as HTMLElement).focus();
      }
      previousFocusRef.current = null;
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

  // nuqs intent param — deep-link from push notification URL
  const [intent, setIntent] = useQueryState("intent");

  useEffect(() => {
    if (intent === "review") {
      session.setForceOpen(true);
      setIsOpen(true);
      void setIntent(null);
    }
    // session.setForceOpen and setIntent are stable references (useState setter + nuqs setter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent, session.setForceOpen, setIntent]);

  // Service worker postMessage — deep-link when app is already open
  // Stable ref for setForceOpen so the SW listener effect only runs once
  const setForceOpenRef = useRef(session.setForceOpen);
  useEffect(() => {
    setForceOpenRef.current = session.setForceOpen;
  }, [session.setForceOpen]);

  useEffect(() => {
    if (!navigator.serviceWorker) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type === "OPEN_AT_RISK_REVIEW") {
        setForceOpenRef.current(true);
        setIsOpen(true);
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);
    return () =>
      navigator.serviceWorker.removeEventListener("message", handler);
  }, []); // empty — uses ref to avoid re-registering listener on every render

  // Gate: nothing to show
  if (!shouldOpen) return null;

  const reviewed = review.results.length;
  const total = review.queue.length + reviewed;
  const percent = total > 0 ? Math.round((reviewed / total) * 100) : 0;

  const totalCount = review.isLoading ? "…" : String(total);

  function handleClose() {
    setIsOpen(false);
  }

  function handleDontShowToday() {
    session.markComplete();
    setIsOpen(false);
  }

  const isComplete = review.isEmpty && review.results.length > 0;

  return (
    <BottomDrawer
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Kitchen check-in: review at-risk items"
      renderHeader={null}
      classNames={{ content: "h-[100dvh] max-h-[100dvh]" }}
    >
      {/* Custom drag handle */}
      <div className="mx-auto mt-3 mb-4 h-1.5 w-12 flex-shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700" />

      {/* Header row */}
      <div className="mb-1 flex items-start justify-between px-1">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Kitchen check-in
          </h2>
          <p className="text-muted-foreground text-sm">
            {totalCount} item{total !== 1 ? "s" : ""} need
            {total === 1 ? "s" : ""} attention
          </p>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground -mt-1 -mr-1"
              aria-label="Remind me later"
              onClick={handleClose}
            >
              <X size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Remind me later</TooltipContent>
        </Tooltip>
      </div>

      {/* Progress bar */}
      <Progress value={percent} className="my-2 h-1" />

      {/* "Don't show today" link */}
      <div className="mb-4 text-right">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2 transition-colors"
          onClick={handleDontShowToday}
        >
          Don&apos;t show today
        </button>
      </div>

      {/* Body */}
      {isComplete ? (
        <AtRiskReviewComplete
          results={review.results}
          onClose={() => {
            session.markComplete();
            setIsOpen(false);
          }}
        />
      ) : (
        <AtRiskReviewDeck
          queue={review.queue}
          onDecision={review.advance}
          isLoading={review.isLoading}
        />
      )}
    </BottomDrawer>
  );
}
