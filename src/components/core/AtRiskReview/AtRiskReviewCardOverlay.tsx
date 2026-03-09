import { type MotionValue, motion, useTransform } from 'framer-motion';
import { Trash2, Utensils } from 'lucide-react';

interface AtRiskReviewCardOverlayProps {
  dragX: MotionValue<number>;
  threshold: number;
}

export function AtRiskReviewCardOverlay({ dragX, threshold }: AtRiskReviewCardOverlayProps) {
  const eatOpacity = useTransform(dragX, [0, threshold], [0, 1]);
  const discardOpacity = useTransform(dragX, [-threshold, 0], [1, 0]);

  return (
    <>
      {/* Right overlay — Eaten */}
      <motion.div
        style={{ opacity: eatOpacity }}
        className='absolute inset-0 rounded-2xl border-2 border-green-500/50 bg-green-500/20 dark:bg-green-400/20 flex flex-col items-center justify-center z-10 pointer-events-none'
      >
        <Utensils size={48} className='text-green-700 dark:text-green-300' />
        <span className='text-2xl font-bold text-green-700 dark:text-green-300 mt-2'>EATEN</span>
      </motion.div>

      {/* Left overlay — Discard */}
      <motion.div
        style={{ opacity: discardOpacity }}
        className='absolute inset-0 rounded-2xl border-2 border-red-500/50 bg-red-500/20 dark:bg-red-400/20 flex flex-col items-center justify-center z-10 pointer-events-none'
      >
        <Trash2 size={48} className='text-red-700 dark:text-red-300' />
        <span className='text-2xl font-bold text-red-700 dark:text-red-300 mt-2'>DISCARD</span>
      </motion.div>
    </>
  );
}
