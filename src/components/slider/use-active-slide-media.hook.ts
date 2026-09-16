import { useEffect, useState, type RefObject } from "react";

type UseActiveSlideMediaOptions = {
  containerRef: RefObject<HTMLElement | null>;
  selectedIndex: number;
  enabled: boolean;
  playbackCycle?: number;
  onComplete: () => void;
};

export function useActiveSlideMedia({ containerRef, selectedIndex, enabled, playbackCycle = 0, onComplete }: UseActiveSlideMediaOptions) {
  const [isMediaDriven, setIsMediaDriven] = useState(false);
  const [mediaDurationMs, setMediaDurationMs] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setIsMediaDriven(false);
      setMediaDurationMs(0);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const slides = container.querySelectorAll<HTMLElement>(".embla__slide");
    const video = slides[selectedIndex]?.querySelector<HTMLVideoElement>("video") ?? null;

    setMediaDurationMs(0);

    if (!video) {
      setIsMediaDriven(false);
      return;
    }

    setIsMediaDriven(true);
    video.loop = false;

    const handleEnded = () => {
      onComplete();
    };

    const startPlayback = () => {
      if (video.duration && Number.isFinite(video.duration)) {
        setMediaDurationMs(video.duration * 1000);
      }

      video.currentTime = 0;
      void video.play().catch(() => undefined);
    };

    video.addEventListener("ended", handleEnded);

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      startPlayback();
    } else {
      video.addEventListener("loadedmetadata", startPlayback, { once: true });
    }

    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("loadedmetadata", startPlayback);
    };
  }, [containerRef, selectedIndex, enabled, playbackCycle, onComplete]);

  return { isMediaDriven, mediaDurationMs };
}
