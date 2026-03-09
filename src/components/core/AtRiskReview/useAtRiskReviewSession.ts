import { useCallback, useState } from 'react';
import { api } from '@/trpc/react';

const STORAGE_KEY = 'broccoli:atRiskReview:lastCompletedDate';

function shouldShowReview(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return true;
    return stored !== new Date().toDateString();
  } catch {
    // localStorage unavailable (SSR or private browsing edge cases)
    return true;
  }
}

export function useAtRiskReviewSession() {
  const [forceOpen, setForceOpen] = useState(false);

  const markReviewCompleteMutation = api.user.markReviewComplete.useMutation();

  const markComplete = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toDateString());
    } catch {
      // Ignore storage errors
    }
    markReviewCompleteMutation.mutate();
  }, [markReviewCompleteMutation]);

  return {
    shouldShow: shouldShowReview() || forceOpen,
    markComplete,
    forceOpen,
    setForceOpen,
  };
}
