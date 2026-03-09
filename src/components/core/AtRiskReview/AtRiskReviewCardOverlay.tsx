import { type MotionValue, motion, useTransform } from "framer-motion";
import { Trash2, Utensils } from "lucide-react";

interface AtRiskReviewCardOverlayProps {
  dragX: MotionValue<number>;
  threshold: number;
}

export function AtRiskReviewCardOverlay({
  dragX,
  threshold,
}: AtRiskReviewCardOverlayProps) {
  const eatOpacity = useTransform(dragX, [0, threshold], [0, 1]);
  const discardOpacity = useTransform(dragX, [-threshold, 0], [1, 0]);

  return (
    <>
      {/* Right overlay — Eaten */}
      <motion.div
        style={{ opacity: eatOpacity }}
        className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl border-2 border-green-500/50 bg-green-500/20 dark:bg-green-400/20"
      >
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/80 px-8 py-5 shadow-sm backdrop-blur-sm dark:bg-zinc-900/80">
          <Utensils size={48} className="text-green-800 dark:text-green-300" />
          <span className="text-2xl font-bold text-green-800 dark:text-green-300">
            EATEN
          </span>
        </div>
      </motion.div>

      {/* Left overlay — Discard */}
      <motion.div
        style={{ opacity: discardOpacity }}
        className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl border-2 border-red-500/50 bg-red-500/20 dark:bg-red-400/20"
      >
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/80 px-8 py-5 shadow-sm backdrop-blur-sm dark:bg-zinc-900/80">
          <Trash2 size={48} className="text-red-700 dark:text-red-300" />
          <span className="text-2xl font-bold text-red-700 dark:text-red-300">
            DISCARD
          </span>
        </div>
      </motion.div>
    </>
  );
}
