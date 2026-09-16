import { useState, useEffect, useMemo } from "react";

interface UseCountdownProps {
  initialSeconds?: number | null;
  expiryAt?: string | null;
  enabled?: boolean;
}

export const useCountdown = ({ initialSeconds, expiryAt, enabled = true }: UseCountdownProps) => {
  const initialRemainingMs = useMemo(() => {
    if (!enabled) return null;

    // Ưu tiên absolute expiry từ BE — tránh lệch khi orderRemainingSeconds stale / khác env.
    if (expiryAt) {
      const ts = new Date(expiryAt).getTime();
      if (!Number.isNaN(ts)) return Math.max(0, ts - Date.now());
    }

    if (typeof initialSeconds === "number" && initialSeconds >= 0) {
      return initialSeconds * 1000;
    }

    return null;
  }, [initialSeconds, expiryAt, enabled]);

  const [remainingMs, setRemainingMs] = useState<number | null>(initialRemainingMs);

  useEffect(() => {
    if (initialRemainingMs === null || !enabled) {
      setRemainingMs(null);
      return;
    }

    setRemainingMs(initialRemainingMs);

    let timerId: number | undefined;
    const startedAt = Date.now();

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startedAt;
      const remaining = Math.max(0, initialRemainingMs - elapsed);

      setRemainingMs(remaining);

      if (remaining <= 0) return;

      const msToNextSecond = 1000 - (now % 1000);
      timerId = window.setTimeout(tick, msToNextSecond);
    };

    tick();

    return () => {
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, [initialRemainingMs, enabled]);

  const formatTime = () => {
    if (remainingMs === null) return "--:--";
    const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return {
    remainingMs,
    formattedTime: formatTime(),
    isExpired: remainingMs !== null && remainingMs <= 0,
  };
};
