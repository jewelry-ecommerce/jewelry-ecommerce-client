"use client";

import { Box } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { ATSH_HERO_BACKGROUND, ATSH_SPIRAL_SECTION_ID } from "../_constants/atsh.constants";
import { ATSH_SECTION_SCROLL_DURATION_MS } from "../_constants/atsh-hero-motion.constants";
import { useAtshContentViewportHeight } from "../_hooks/use-atsh-content-viewport-height.hook";
import AtshHeroSection from "./atsh-hero-section.component";
// import AtshSpiralSection from "./atsh-spiral-section.component";
import { siteHeaderHeightCssVar } from "@/utils/constants/layout.constant";
import {
  // ATSH_SECTION_IDS,
  // disableAtshFixedLandingSections,
  // enableAtshFixedLandingSections,
  // hasAtshSpiralHash,
  // initAtshPageScrollOnLoad,
  isAtshCoarsePointerDevice,
  isAtshSpiralSectionInView,
  // navigateAtshToSpiralOnTouch,
  // refreshCachedAtshSectionIndex,
  // registerAtshLandingSectionNavigator,
  scrollAtshToSpiralSection,
  // setAtshFixedSectionIndex,
  // setupAtshSectionIndexCache,
} from "../_utils/atsh-section-scroll.util";

const ATSH_SECTION_TRANSITION_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
// const SPIRAL_SECTION_INDEX = ATSH_SECTION_IDS.length - 1;
// const ATSH_ENABLE_TOUCH_SWIPE_NAV = false;

const AtshApp = () => {
  const { headerHeight } = useAtshContentViewportHeight();
  const pendingSpiralScrollRef = useRef(false);
  const spiralScrollStartedRef = useRef(false);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [isSectionTransitioning, setIsSectionTransitioning] = useState(false);

  // const scrollToSectionIndex = useCallback(
  //   (index: number, options?: { instant?: boolean; durationMs?: number; onComplete?: () => void }) => {
  //     const nextIndex = Math.max(0, Math.min(index, SPIRAL_SECTION_INDEX));

  //     setIsSectionTransitioning(!options?.instant);
  //     setSectionIndex(nextIndex);
  //     setAtshFixedSectionIndex(nextIndex);

  //     if (options?.instant) {
  //       options.onComplete?.();
  //       return;
  //     }

  //     window.setTimeout(() => {
  //       setIsSectionTransitioning(false);
  //       options?.onComplete?.();
  //     }, options?.durationMs ?? ATSH_SECTION_SCROLL_DURATION_MS);
  //   },
  //   [],
  // );

  useEffect(() => {
    if (headerHeight <= 0) return;

    document.documentElement.style.setProperty("--atsh-header-height", `${headerHeight}px`);

    return () => {
      document.documentElement.style.removeProperty("--atsh-header-height");
    };
  }, [headerHeight]);

  // useEffect(() => {
  //   enableAtshFixedLandingSections();
  //   // registerAtshLandingSectionNavigator(scrollToSectionIndex);

  //   pendingSpiralScrollRef.current = initAtshPageScrollOnLoad();
  //   setupAtshSectionIndexCache();

  //   if (pendingSpiralScrollRef.current && isAtshCoarsePointerDevice()) {
  //     spiralScrollStartedRef.current = true;
  //     pendingSpiralScrollRef.current = false;
  //     navigateAtshToSpiralOnTouch();
  //   }

  //   let touchNavStartY = 0;

  //   const handleTouchStartNav = (event: TouchEvent) => {
  //     if (isAtshSpiralSectionInView()) return;
  //     touchNavStartY = event.touches[0]?.clientY ?? 0;
  //   };

  //   const handleTouchEndNav = (event: TouchEvent) => {
  //     if (isAtshSpiralSectionInView()) return;

  //     const endY = event.changedTouches[0]?.clientY ?? touchNavStartY;
  //     const swipeUp = touchNavStartY - endY;
  //     if (swipeUp < 56) return;

  //     navigateAtshToSpiralOnTouch();
  //   };

  //   if (ATSH_ENABLE_TOUCH_SWIPE_NAV) {
  //     window.addEventListener("touchstart", handleTouchStartNav, { passive: true });
  //     window.addEventListener("touchend", handleTouchEndNav, { passive: true });
  //   }

  //   return () => {
  //     refreshCachedAtshSectionIndex();
  //     if (ATSH_ENABLE_TOUCH_SWIPE_NAV) {
  //       window.removeEventListener("touchstart", handleTouchStartNav);
  //       window.removeEventListener("touchend", handleTouchEndNav);
  //     }
  //     registerAtshLandingSectionNavigator(null);
  //     disableAtshFixedLandingSections();
  //   };
  // }, [scrollToSectionIndex]);

  useEffect(() => {
    if (!pendingSpiralScrollRef.current || spiralScrollStartedRef.current) return;
    if (isAtshCoarsePointerDevice()) return;

    const header = document.querySelector("header");
    const resolvedHeaderHeight = header?.offsetHeight ?? headerHeight;
    if (resolvedHeaderHeight <= 0) return;

    spiralScrollStartedRef.current = true;

    scrollAtshToSpiralSection({
      onComplete: () => {
        pendingSpiralScrollRef.current = false;
        if (!isAtshSpiralSectionInView()) {
          spiralScrollStartedRef.current = false;
        }
      },
    });
  }, [headerHeight]);

  // useEffect(() => {
  //   const scrollToSpiralIfNeeded = () => {
  //     if (!hasAtshSpiralHash() || isAtshSpiralSectionInView()) return;

  //     if (isAtshCoarsePointerDevice()) {
  //       navigateAtshToSpiralOnTouch();
  //       return;
  //     }

  //     scrollAtshToSpiralSection();
  //   };

  //   window.addEventListener("hashchange", scrollToSpiralIfNeeded);
  //   return () => {
  //     window.removeEventListener("hashchange", scrollToSpiralIfNeeded);
  //   };
  // }, [scrollToSectionIndex]);

  const viewportTop = headerHeight > 0 ? `${headerHeight}px` : siteHeaderHeightCssVar();

  return (
    <Box
      sx={{
        position: "fixed",
        top: viewportTop,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        zIndex: 1,
        backgroundColor: "#0d0618",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          backgroundImage: `url(${ATSH_HERO_BACKGROUND})`,
          backgroundSize: "cover",
          backgroundPosition: { xs: "center bottom", md: "center center" },
          backgroundRepeat: "no-repeat",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            transform: `translateY(-${sectionIndex * 100}%)`,
            transition: isSectionTransitioning ? `transform ${ATSH_SECTION_SCROLL_DURATION_MS}ms ${ATSH_SECTION_TRANSITION_EASE}` : "none",
            willChange: isSectionTransitioning ? "transform" : "auto",
          }}
        >
          <Box sx={{ flex: "0 0 100%", height: "100%", minHeight: 0 }}>
            <AtshHeroSection contentViewportHeight="100%" />
          </Box>
          {/* <Box
            component="section"
            id={ATSH_SPIRAL_SECTION_ID}
            sx={{
              flex: "0 0 100%",
              height: "100%",
              minHeight: 0,
            }}
          >
            <AtshSpiralSection contentViewportHeight="100%" />
          </Box> */}
        </Box>
      </Box>
    </Box>
  );
};

export default AtshApp;
