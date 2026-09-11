"use client";

import { useCallback, useEffect, useState } from "react";
import { getProgress } from "@/lib/api";
import type { UserProgress } from "@/lib/types";
import { useUserId } from "@/hooks/useUserId";

export const PROGRESS_REFRESH_EVENT = "nexus-ai-progress-refresh";

export function requestProgressRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROGRESS_REFRESH_EVENT));
  }
}

export function useProgress() {
  const { userId } = useUserId();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getProgress(userId);
      setProgress(result);
    } catch (refreshError) {
      setProgress(null);
      setError(refreshError instanceof Error ? refreshError.message : "Unable to load progress.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const handleRefresh = () => {
      void refresh();
    };

    window.addEventListener(PROGRESS_REFRESH_EVENT, handleRefresh);

    return () => {
      window.removeEventListener(PROGRESS_REFRESH_EVENT, handleRefresh);
    };
  }, [refresh]);

  return {
    userId,
    progress,
    loading,
    error,
    refresh,
    setProgress
  };
}
