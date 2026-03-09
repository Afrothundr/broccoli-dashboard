"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Trash2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AtRiskReviewOnboardingProps {
  onDismiss: () => void;
}

interface SwipeInstructionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  colorClasses: string;
  delay: number;
  prefersReducedMotion: boolean | null;
}

function SwipeInstruction({
  icon,
  label,
  description,
  colorClasses,
  delay,
  prefersReducedMotion,
}: SwipeInstructionProps) {
  return (
    <motion.div
      className="flex items-center gap-4"
      initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0.15 : 0.35,
        delay: prefersReducedMotion ? 0 : delay,
      }}
    >
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${colorClasses}`}
      >
        {icon}
      </div>
      <div className="text-left">
        <p className="font-semibold text-zinc-900 dark:text-white">{label}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function AtRiskReviewOnboarding({
  onDismiss,
}: AtRiskReviewOnboardingProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="flex h-[80%] flex-col items-center justify-between px-2 pb-4"
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -16 }}
      transition={{ duration: prefersReducedMotion ? 0.15 : 0.35 }}
    >
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 pt-4 text-center">
        <motion.span
          className="text-5xl"
          initial={{ scale: prefersReducedMotion ? 1 : 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: prefersReducedMotion ? 0.15 : 0.4,
            delay: prefersReducedMotion ? 0 : 0.1,
            type: prefersReducedMotion ? "tween" : "spring",
            stiffness: 260,
            damping: 18,
          }}
        >
          🥦
        </motion.span>

        <motion.h3
          className="text-xl font-bold text-zinc-900 dark:text-white"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0.15 : 0.3,
            delay: prefersReducedMotion ? 0 : 0.2,
          }}
        >
          How to review your items
        </motion.h3>

        <motion.p
          className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0.15 : 0.3,
            delay: prefersReducedMotion ? 0 : 0.25,
          }}
        >
          Swipe each card or use the buttons to quickly update your at-risk
          items.
        </motion.p>
      </div>

      {/* Swipe direction list */}
      <div className="flex w-full max-w-xs flex-col gap-5 py-2">
        <SwipeInstruction
          icon={
            <Utensils
              size={22}
              className="text-green-800 dark:text-green-300"
            />
          }
          label="Swipe right → Eaten"
          description="Mark the item as fully consumed"
          colorClasses="bg-green-100 dark:bg-green-900/40"
          delay={0.35}
          prefersReducedMotion={prefersReducedMotion}
        />

        <SwipeInstruction
          icon={<Trash2 size={22} className="text-red-700 dark:text-red-300" />}
          label="Swipe left → Discard"
          description="Remove it — it's no longer good"
          colorClasses="bg-red-100 dark:bg-red-900/40"
          delay={0.45}
          prefersReducedMotion={prefersReducedMotion}
        />

        <SwipeInstruction
          icon={
            <ArrowUp size={22} className="text-zinc-600 dark:text-zinc-300" />
          }
          label="Swipe up → Skip"
          description="Come back to it later in the session"
          colorClasses="bg-zinc-100 dark:bg-zinc-800"
          delay={0.55}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>

      {/* CTA */}
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0.15 : 0.3,
          delay: prefersReducedMotion ? 0 : 0.65,
        }}
      >
        <Button className="w-full" size="lg" onClick={onDismiss}>
          Got it, let&apos;s start!
        </Button>
      </motion.div>
    </motion.div>
  );
}
