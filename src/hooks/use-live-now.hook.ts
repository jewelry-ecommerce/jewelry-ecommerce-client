import { useEffect, useState } from "react";

const useLiveNow = (enabled: boolean, intervalMs: number = 1000) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());

    if (!enabled) {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [enabled, intervalMs]);

  return now;
};

export default useLiveNow;
