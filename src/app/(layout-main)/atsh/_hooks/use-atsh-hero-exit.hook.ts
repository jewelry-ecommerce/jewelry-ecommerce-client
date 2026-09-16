"use client";

import { useCallback } from "react";
import {
  isAtshCoarsePointerDevice,
  navigateAtshToSpiralOnTouch,
  refreshCachedAtshSectionIndex,
  scrollAtshToSpiralSection,
} from "../_utils/atsh-section-scroll.util";

export const useAtshHeroExit = () => {
  const handleExploreClick = useCallback(
    (e: React.MouseEvent<HTMLElement> | React.PointerEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
      if (typeof window === "undefined") return;

      e.preventDefault();
      e.stopPropagation();

      if (isAtshCoarsePointerDevice()) {
        navigateAtshToSpiralOnTouch();
        return;
      }

      scrollAtshToSpiralSection({
        onComplete: () => {
          refreshCachedAtshSectionIndex();
          requestAnimationFrame(() => refreshCachedAtshSectionIndex());
        },
      });
    },
    [],
  );

  return {
    handleExploreClick,
  };
};
