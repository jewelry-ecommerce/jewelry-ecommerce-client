import React, { useCallback, useEffect, useRef } from "react";
import { ProgressContainer, ProgressSegment, ProgressBar, sliderProgressKeyframes } from "./slider.style";

interface SliderProcessProps {
  totalCount: number;
  selectedIndex: number;
  autoplay: boolean;
  autoplaySpeed: number;
  onNext: () => void;
  onSelect: (index: number) => void;
  customDurations?: (number | undefined)[];
  mediaDriven?: boolean;
  mediaDurationMs?: number;
  playbackCycle?: number;
  visible?: boolean;
}

const SliderProcess: React.FC<SliderProcessProps> = ({
  totalCount,
  selectedIndex,
  autoplay,
  autoplaySpeed,
  onNext,
  onSelect,
  customDurations = [],
  mediaDriven = false,
  mediaDurationMs = 0,
  playbackCycle = 0,
  visible = true,
}) => {
  const lastTriggeredIndexRef = useRef<number>(-1);

  const customDuration = customDurations[selectedIndex];
  const timerDurationMs = customDuration ?? autoplaySpeed;
  const segmentDurationMs = mediaDriven ? mediaDurationMs : timerDurationMs;
  const animationKey = `${selectedIndex}-${playbackCycle}-${segmentDurationMs}`;

  const triggerNext = useCallback(() => {
    if (lastTriggeredIndexRef.current !== selectedIndex) {
      lastTriggeredIndexRef.current = selectedIndex;
      onNext();
    }
  }, [onNext, selectedIndex]);

  useEffect(() => {
    lastTriggeredIndexRef.current = -1;
  }, [selectedIndex, playbackCycle, mediaDriven, timerDurationMs]);

  // Autoplay khi progress bar bị ẩn (slide ảnh)
  useEffect(() => {
    if (!autoplay || visible || mediaDriven || timerDurationMs <= 0) return;

    const timeoutId = window.setTimeout(triggerNext, timerDurationMs);
    return () => window.clearTimeout(timeoutId);
  }, [autoplay, visible, mediaDriven, timerDurationMs, selectedIndex, playbackCycle, triggerNext]);

  const handleAnimationEnd = useCallback(
    (event: React.AnimationEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || !autoplay || mediaDriven) return;
      triggerNext();
    },
    [autoplay, mediaDriven, triggerNext],
  );

  if (!visible) return null;

  return (
    <ProgressContainer>
      {Array.from({ length: totalCount }).map((_, i) => {
        const isPast = i < selectedIndex;
        const isCurrent = i === selectedIndex;
        const shouldAnimate = isCurrent && autoplay && segmentDurationMs > 0;

        return (
          <ProgressSegment key={i} onClick={() => onSelect(i)} type="button" aria-label={`Go to slide ${i + 1}`}>
            <ProgressBar
              key={isCurrent ? animationKey : undefined}
              onAnimationEnd={shouldAnimate && !mediaDriven ? handleAnimationEnd : undefined}
              sx={{
                transform: isPast ? "scaleX(1)" : !isCurrent ? "scaleX(0)" : undefined,
                animation: shouldAnimate ? `${sliderProgressKeyframes} ${segmentDurationMs}ms linear forwards` : "none",
              }}
            />
          </ProgressSegment>
        );
      })}
    </ProgressContainer>
  );
};

export default SliderProcess;
