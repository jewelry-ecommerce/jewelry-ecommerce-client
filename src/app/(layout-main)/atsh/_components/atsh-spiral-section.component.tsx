"use client";

import * as React from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";

import AtshCtaButton from "./atsh-cta-button.component";
import AtshSpiralGallery, { type AtshSpiralGalleryConfig } from "./atsh-spiral-gallery.component";
import useAtshStyles from "./atsh.styles";
import useAtshSpiralStyles from "./atsh-spiral.styles";
import {
  ATSH_SPIRAL_ASSETS,
  ATSH_SPIRAL_ENTRANCE,
  getAtshSpiralCardEntranceDelayMs,
  getAtshSpiralBreakpointConfig,
  getAtshSpiralStageDimensions,
  getAtshSpiralStageScale,
  type AtshSpiralBreakpointConfig,
} from "../_constants/atsh-spiral.constants";
import { mapAtshBrothersToSpiralCards } from "../_utils/atsh-brothers.util";
import { useAtshBrothersData } from "./atsh-brothers.provider";
import { isAtshSpiralSectionActive, refreshCachedAtshSectionIndex, subscribeAtshSectionIndex } from "../_utils/atsh-section-scroll.util";

const MotionBox = motion.create(Box);
const MotionLogoInner = motion.create(Box);

type SpiralLayoutState = {
  breakpointConfig: AtshSpiralBreakpointConfig;
  stageDimensions: ReturnType<typeof getAtshSpiralStageDimensions>;
  stageScale: number;
  geometryKey: string;
};

function buildSpiralLayout(frameWidth: number, frameHeight: number): SpiralLayoutState {
  const breakpointConfig = getAtshSpiralBreakpointConfig(frameWidth, frameHeight);
  const stageDimensions = getAtshSpiralStageDimensions(breakpointConfig);
  const stageScale = getAtshSpiralStageScale(frameWidth, frameHeight, stageDimensions.stageWidth, stageDimensions.stageHeight);

  const geometryKey = [
    breakpointConfig.cardWidth,
    breakpointConfig.cylinderRadius,
    breakpointConfig.cylinderHeight,
    breakpointConfig.spiralRounds,
    breakpointConfig.helixPitchScale,
    stageDimensions.stageWidth,
    stageDimensions.stageHeight,
    stageScale,
  ].join(":");

  return { breakpointConfig, stageDimensions, stageScale, geometryKey };
}

type AtshSpiralSectionProps = {
  contentViewportHeight?: string;
};

export default function AtshSpiralSection({ contentViewportHeight }: AtshSpiralSectionProps) {
  const { classes } = useAtshSpiralStyles();
  const { classes: atshClasses, cx: atshCx } = useAtshStyles();
  const brothersData = useAtshBrothersData();
  const [isSpiralInView, setIsSpiralInView] = React.useState(false);
  const [hasLogoAnimatedIn, setHasLogoAnimatedIn] = React.useState(false);
  const [hasCardsAnimatedIn, setHasCardsAnimatedIn] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const entranceStartedRef = React.useRef(false);
  const pageFrameRef = React.useRef<HTMLDivElement | null>(null);
  const [spiralLayout, setSpiralLayout] = React.useState<SpiralLayoutState | null>(null);

  React.useEffect(() => {
    const frame = pageFrameRef.current;
    if (!frame) return;

    let rafId = 0;

    const updateLayout = () => {
      const el = pageFrameRef.current;
      if (!el) return;

      const { width, height } = el.getBoundingClientRect();
      if (width <= 0 || height <= 0) {
        rafId = requestAnimationFrame(updateLayout);
        return;
      }

      setSpiralLayout((prev) => {
        const next = buildSpiralLayout(width, height);
        if (prev?.geometryKey === next.geometryKey) return prev;
        return next;
      });
    };

    updateLayout();
    const observer = new ResizeObserver(() => {
      updateLayout();
      refreshCachedAtshSectionIndex();
    });
    observer.observe(frame);
    window.addEventListener("resize", updateLayout);
    window.visualViewport?.addEventListener("resize", updateLayout);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
      window.visualViewport?.removeEventListener("resize", updateLayout);
    };
  }, [contentViewportHeight]);

  React.useEffect(() => {
    setPrefersReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  React.useEffect(() => {
    const syncInView = () => setIsSpiralInView(isAtshSpiralSectionActive());

    syncInView();
    const unsubscribe = subscribeAtshSectionIndex(syncInView);
    window.addEventListener("scroll", syncInView, { passive: true });
    window.addEventListener("resize", syncInView, { passive: true });

    return () => {
      unsubscribe();
      window.removeEventListener("scroll", syncInView);
      window.removeEventListener("resize", syncInView);
    };
  }, []);

  React.useEffect(() => {
    if (!isSpiralInView || entranceStartedRef.current) return;

    entranceStartedRef.current = true;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setHasLogoAnimatedIn(true);
      setHasCardsAnimatedIn(true);
      return;
    }

    const logoTimer = window.setTimeout(() => setHasLogoAnimatedIn(true), ATSH_SPIRAL_ENTRANCE.initialDelayMs);
    const cardsTimer = window.setTimeout(() => setHasCardsAnimatedIn(true), getAtshSpiralCardEntranceDelayMs());

    return () => {
      window.clearTimeout(logoTimer);
      window.clearTimeout(cardsTimer);
    };
  }, [isSpiralInView]);

  const spiralCards = React.useMemo(() => mapAtshBrothersToSpiralCards(brothersData), [brothersData]);

  const galleryConfig: AtshSpiralGalleryConfig | null = React.useMemo(() => {
    if (!spiralLayout) return null;
    const bp = spiralLayout.breakpointConfig;
    return {
      cards: spiralCards,
      cylinderRadius: bp.cylinderRadius,
      cylinderHeight: bp.cylinderHeight,
      cardWidth: bp.cardWidth,
      cardHeight: bp.cardHeight,
      spiralSpeed: bp.spiralSpeed,
      rotationSpeed: bp.rotationSpeedDegPerSecond,
      descentSpeed: bp.descentSpeedPxPerSecond,
      cardSpacing: bp.cardSpacing,
      spiralRounds: bp.spiralRounds,
      helixPitchScale: bp.helixPitchScale,
      perspective: bp.perspective,
      showCylinder: bp.cylinder.show,
      cylinderColor: bp.cylinder.color,
      cylinderOpacity: bp.cylinder.opacity,
      cardBorderRadius: bp.card.borderRadius,
      cardShadow: bp.card.shadow,
      cardHoverShadow: bp.card.hoverShadow,
      autoRotate: true,
      scrollSensitivity: bp.scrollSensitivity,
      touchSensitivity: bp.touchSensitivity,
      smoothing: bp.smoothing,
      scrollSmoothing: bp.scrollSmoothing,
      scrollBoostsAutoSpeed: bp.scrollBoostsAutoSpeed,
      scrollSpeedBoostFactor: bp.scrollSpeedBoostFactor,
      scrollSpeedBoostMax: bp.scrollSpeedBoostMax,
      scrollSpeedBoostDecayPerSec: bp.scrollSpeedBoostDecayPerSec,
    };
  }, [spiralLayout, spiralCards]);

  const { stageDimensions, stageScale } = spiralLayout ?? {
    stageDimensions: { stageWidth: 0, stageHeight: 0 },
    stageScale: 1,
  };

  return (
    <MotionBox
      className={classes.section}
      component="section"
      sx={
        contentViewportHeight
          ? {
              height: contentViewportHeight,
              minHeight: contentViewportHeight,
              overflow: "hidden",
            }
          : undefined
      }
    >
      <Box className={classes.inner} sx={contentViewportHeight ? { height: "100%" } : undefined}>
        <Box ref={pageFrameRef} className={classes.pageFrame} sx={contentViewportHeight ? { height: "100%" } : { minHeight: "100dvh" }}>
          {spiralLayout && galleryConfig ? (
            <Box
              className={classes.stageScaleWrap}
              sx={{
                width: stageDimensions.stageWidth,
                height: stageDimensions.stageHeight,
                transform: `scale(${stageScale})`,
              }}
            >
              <Box
                className={classes.stage}
                sx={{
                  width: stageDimensions.stageWidth,
                  height: stageDimensions.stageHeight,
                }}
              >
                <AtshSpiralGallery
                  key={spiralLayout.geometryKey}
                  className={classes.gallery}
                  config={galleryConfig}
                  isActive={isSpiralInView}
                  cardEntranceActive={hasCardsAnimatedIn}
                  centerOverlay={
                    <Box className={classes.centerLogoWrap} aria-hidden>
                      <MotionLogoInner
                        sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.5 }}
                        animate={
                          prefersReducedMotion
                            ? undefined
                            : {
                                opacity: hasLogoAnimatedIn ? 1 : 0,
                                scale: hasLogoAnimatedIn ? 1 : 0.5,
                              }
                        }
                        transition={
                          prefersReducedMotion
                            ? undefined
                            : {
                                duration: ATSH_SPIRAL_ENTRANCE.logoDurationSec,
                                delay: ATSH_SPIRAL_ENTRANCE.logoDelaySec,
                                ease: ATSH_SPIRAL_ENTRANCE.logoEase,
                              }
                        }
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ATSH_SPIRAL_ASSETS.centerLogo}
                          alt="ATSH spiral center logo"
                          className={classes.centerLogoImg}
                          draggable={false}
                        />
                      </MotionLogoInner>
                    </Box>
                  }
                />
              </Box>
            </Box>
          ) : null}

          <Box
            className={classes.ctaWrap}
            sx={{
              visibility: hasCardsAnimatedIn ? "visible" : "hidden",
              pointerEvents: hasCardsAnimatedIn ? "auto" : "none",
            }}
          >
            <AtshCtaButton
              label="Xem tất cả sản phẩm"
              href="/products"
              wrapClassName={atshClasses.ctaButtonWrap}
              className={atshCx(atshClasses.ctaButton, atshClasses.ctaPrimary)}
              entrance={{ isInView: hasCardsAnimatedIn, delay: 0 }}
            />
          </Box>
        </Box>
      </Box>
    </MotionBox>
  );
}
