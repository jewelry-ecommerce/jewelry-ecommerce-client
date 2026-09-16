"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ATSH_SPIRAL_ENTRANCE,
  ATSH_SPIRAL_HOVER_SPEED_BLEND_RATE,
  ATSH_SPIRAL_HOVER_SPEED_MULTIPLIER,
  getAtshSpiralCardStaggerDelaySec,
} from "../_constants/atsh-spiral.constants";
import {
  ATSH_SECTION_IDS,
  isAtshSpiralSectionActive,
  setAtshSpiralHash,
  refreshCachedAtshSectionIndex,
  subscribeAtshSectionIndex,
} from "../_utils/atsh-section-scroll.util";

export type AtshSpiralCard = {
  src: string;
  alt?: string;
  href?: string;
};

export type AtshSpiralGalleryConfig = {
  cards: AtshSpiralCard[];
  cylinderRadius: number;
  cylinderHeight: number;
  cardWidth: number;
  cardHeight: number;
  spiralSpeed: number;
  rotationSpeed: number;
  descentSpeed: number;
  cardSpacing: number;
  spiralRounds: number;
  helixPitchScale: number;
  perspective: number;
  showCylinder: boolean;
  cylinderColor: string;
  cylinderOpacity: number;
  cardBorderRadius: number;
  cardShadow: string;
  cardHoverShadow: string;
  autoRotate: boolean;
  scrollSensitivity: number;
  /** Touch drag sensitivity; defaults to scrollSensitivity when omitted */
  touchSensitivity?: number;
  smoothing: number;
  scrollSmoothing: number;
  /** Wheel boosts auto-rotate speed; when false, wheel scrubs timeline directly. */
  scrollBoostsAutoSpeed?: boolean;
  scrollSpeedBoostFactor?: number;
  scrollSpeedBoostMax?: number;
  scrollSpeedBoostDecayPerSec?: number;
  /** Auto-rotate speed multiplier while a card is hovered (0–1). */
  hoverSpeedMultiplier?: number;
};

type Props = {
  config: AtshSpiralGalleryConfig;
  className?: string;
  style?: React.CSSProperties;
  centerOverlay?: React.ReactNode;
  /** When false, pause rAF loop to reduce CPU/GPU usage. */
  isActive?: boolean;
  /** When true, run card drop-down entrance animation (orchestrated by parent). */
  cardEntranceActive?: boolean;
};

const SPIRAL_SECTION_INDEX = ATSH_SECTION_IDS.length - 1;
const SHADOW_TRANSITION = "box-shadow 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)";
const ENTRANCE_EASE = [0.25, 0.1, 0.25, 1] as const;
const ENTRANCE_BOUNCE_EASE = [0.34, 1.56, 0.64, 1] as const;
const MAX_FRAME_DELTA_SEC = 0.05;
const TIME_SYNC_EPSILON = 0.0005;
/** Match SSR/client inline transform precision to avoid hydration mismatch */
const SPIRAL_TRANSFORM_PRECISION = 3;
/** Wheel input — short window for higher lerp only, does not pause auto-rotate (pacomepertant-style). */
const SPIRAL_USER_SCROLL_IDLE_MS = 120;

function normalizeWheelDelta(deltaY: number, deltaMode: number) {
  if (deltaMode === WheelEvent.DOM_DELTA_LINE) return deltaY * 16;
  if (deltaMode === WheelEvent.DOM_DELTA_PAGE) return deltaY * (typeof window !== "undefined" ? window.innerHeight : 800);
  return deltaY;
}

const roundSpiralPx = (value: number) => `${Number(value.toFixed(SPIRAL_TRANSFORM_PRECISION))}px`;

const roundSpiralDeg = (value: number) => `${Number(value.toFixed(SPIRAL_TRANSFORM_PRECISION))}deg`;

const formatSpiralCardTransform = (x: number, y: number, z: number, rotateY: number) =>
  `translate3d(${roundSpiralPx(x)}, ${roundSpiralPx(y)}, ${roundSpiralPx(z)}) rotateY(${roundSpiralDeg(rotateY)})`;

export default function AtshSpiralGallery(props: Props) {
  const { config, className, style, centerOverlay, isActive = true, cardEntranceActive = false } = props;
  const {
    cards,
    cylinderRadius,
    cylinderHeight,
    cardWidth,
    cardHeight,
    spiralSpeed,
    rotationSpeed,
    descentSpeed,
    spiralRounds,
    helixPitchScale,
    perspective,
    showCylinder,
    cylinderColor,
    cylinderOpacity,
    cardBorderRadius,
    cardShadow,
    cardHoverShadow,
    autoRotate,
    scrollSensitivity,
    touchSensitivity = scrollSensitivity,
    smoothing,
    scrollSmoothing,
    scrollBoostsAutoSpeed = false,
    scrollSpeedBoostFactor = 0.007,
    scrollSpeedBoostMax = 5,
    scrollSpeedBoostDecayPerSec = 3.5,
    hoverSpeedMultiplier = ATSH_SPIRAL_HOVER_SPEED_MULTIPLIER,
  } = config;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isMotionReady, setIsMotionReady] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const hasAnimatedIn = cardEntranceActive;
  const time = useMotionValue(0);
  const animationRef = React.useRef<number | null>(null);
  const targetTimeRef = React.useRef(0);
  const pendingWheelDeltaRef = React.useRef(0);
  const pendingTouchDeltaRef = React.useRef(0);
  const scrollSpeedBoostRef = React.useRef(0);
  const lastUserScrollAtRef = React.useRef(0);
  const prefersReducedMotionRef = React.useRef(false);
  const isActiveRef = React.useRef(isActive);
  const cardHoverCountRef = React.useRef(0);
  const hoverSpeedBlendRef = React.useRef(1);

  const handleCardHoverChange = React.useCallback((hovered: boolean) => {
    cardHoverCountRef.current = Math.max(0, cardHoverCountRef.current + (hovered ? 1 : -1));
    ensureAnimationLoopRef.current();
  }, []);

  const repeatedCards = React.useMemo(() => {
    const baseCards = cards.length ? cards : [];
    if (!baseCards.length) return [];
    const cardsPerRound = Math.min(8, baseCards.length);
    const totalCardsNeeded = Math.ceil(cardsPerRound * spiralRounds);
    const repeated: AtshSpiralCard[] = [];
    for (let i = 0; i < totalCardsNeeded; i++) repeated.push(baseCards[i % baseCards.length]);
    return repeated;
  }, [cards, spiralRounds]);

  const tickRef = React.useRef<(now: number) => void>(() => undefined);
  const ensureAnimationLoopRef = React.useRef<() => void>(() => undefined);

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    prefersReducedMotionRef.current = reduced;
    setPrefersReducedMotion(reduced);
    setIsMotionReady(true);
  }, []);

  React.useEffect(() => {
    const lastTouchYRef = { current: 0 };

    const markUserScroll = () => {
      lastUserScrollAtRef.current = performance.now();
    };

    const queueWheelDelta = (deltaY: number, deltaMode: number) => {
      markUserScroll();
      const normalized = normalizeWheelDelta(deltaY, deltaMode);

      if (scrollBoostsAutoSpeed) {
        const nextBoost = scrollSpeedBoostRef.current + normalized * scrollSpeedBoostFactor;
        scrollSpeedBoostRef.current = Math.max(-scrollSpeedBoostMax, Math.min(scrollSpeedBoostMax, nextBoost));
        return;
      }

      pendingWheelDeltaRef.current += normalized * scrollSensitivity;
    };

    const handleWheel = (e: WheelEvent) => {
      refreshCachedAtshSectionIndex();
      if (!isAtshSpiralSectionActive()) return;

      e.preventDefault();
      e.stopPropagation();
      queueWheelDelta(e.deltaY, e.deltaMode);
      ensureAnimationLoopRef.current();
    };

    const handleTouchStart = (e: TouchEvent) => {
      refreshCachedAtshSectionIndex();
      if (!isAtshSpiralSectionActive()) return;
      markUserScroll();
      lastTouchYRef.current = e.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      refreshCachedAtshSectionIndex();
      if (!isAtshSpiralSectionActive()) return;

      const touch = e.touches[0];
      if (!touch) return;

      e.preventDefault();
      e.stopPropagation();

      const currentY = touch.clientY;
      // Cùng chiều với wheel: vuốt xuống → delta dương → spiral cuộn xuống.
      const deltaY = currentY - lastTouchYRef.current;
      lastTouchYRef.current = currentY;
      markUserScroll();
      pendingTouchDeltaRef.current += deltaY * touchSensitivity;
      ensureAnimationLoopRef.current();
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });

    return () => {
      window.removeEventListener("wheel", handleWheel, { capture: true });
      window.removeEventListener("touchstart", handleTouchStart, { capture: true });
      window.removeEventListener("touchmove", handleTouchMove, { capture: true });
    };
  }, [scrollBoostsAutoSpeed, scrollSensitivity, scrollSpeedBoostFactor, scrollSpeedBoostMax, touchSensitivity]);

  const stopAnimationLoop = React.useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const ensureAnimationLoop = React.useCallback(() => {
    const shouldRun = isActiveRef.current || isAtshSpiralSectionActive();
    if (!shouldRun || animationRef.current) return;
    animationRef.current = requestAnimationFrame(tickRef.current);
  }, []);

  ensureAnimationLoopRef.current = ensureAnimationLoop;
  isActiveRef.current = isActive;

  React.useEffect(() => {
    isActiveRef.current = isActive;

    let lastTime = performance.now();

    const tick = (now: number) => {
      animationRef.current = null;

      const visible = typeof document !== "undefined" && document.visibilityState === "visible";

      const onSpiralSection = isAtshSpiralSectionActive();
      if (!visible || (!isActiveRef.current && !onSpiralSection)) {
        return;
      }

      const deltaTime = Math.min((now - lastTime) / 1000, MAX_FRAME_DELTA_SEC);
      lastTime = now;

      const isUserScrolling = now - lastUserScrollAtRef.current < SPIRAL_USER_SCROLL_IDLE_MS;
      const wheelDelta = pendingWheelDeltaRef.current;
      const touchDelta = pendingTouchDeltaRef.current;
      const hasWheelInput = wheelDelta !== 0;
      const hasTouchInput = touchDelta !== 0;

      pendingWheelDeltaRef.current = 0;
      pendingTouchDeltaRef.current = 0;

      if (hasTouchInput) {
        targetTimeRef.current += touchDelta;
      }

      if (hasWheelInput && !scrollBoostsAutoSpeed) {
        targetTimeRef.current += wheelDelta;
      }

      if (scrollBoostsAutoSpeed) {
        const decay = Math.exp(-scrollSpeedBoostDecayPerSec * deltaTime);
        scrollSpeedBoostRef.current *= decay;
        if (Math.abs(scrollSpeedBoostRef.current) < 0.01) {
          scrollSpeedBoostRef.current = 0;
        }
      }

      const targetHoverSpeed = cardHoverCountRef.current > 0 ? hoverSpeedMultiplier : 1;
      const hoverBlendLerp = 1 - Math.exp(-ATSH_SPIRAL_HOVER_SPEED_BLEND_RATE * deltaTime);
      hoverSpeedBlendRef.current += (targetHoverSpeed - hoverSpeedBlendRef.current) * hoverBlendLerp;

      // Auto-rotate luôn chạy; hover chỉ giảm tốc (không dừng hẳn).
      const canAutoRotate = autoRotate && !prefersReducedMotionRef.current;
      if (canAutoRotate) {
        const baseSpiralSpeed = scrollBoostsAutoSpeed ? spiralSpeed + scrollSpeedBoostRef.current : spiralSpeed;
        const activeSpiralSpeed = baseSpiralSpeed * hoverSpeedBlendRef.current;
        targetTimeRef.current += deltaTime * activeSpiralSpeed;
      }

      const currentTimeVal = time.get();
      const diff = targetTimeRef.current - currentTimeVal;

      if (Math.abs(diff) > TIME_SYNC_EPSILON) {
        const lerpFactor = hasWheelInput || hasTouchInput || isUserScrolling ? scrollSmoothing : smoothing;
        time.set(currentTimeVal + diff * lerpFactor);
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    tickRef.current = tick;

    ensureAnimationLoop();

    const unsubscribe = subscribeAtshSectionIndex((index) => {
      refreshCachedAtshSectionIndex();
      if (index !== SPIRAL_SECTION_INDEX) {
        stopAnimationLoop();
        pendingWheelDeltaRef.current = 0;
        pendingTouchDeltaRef.current = 0;
        scrollSpeedBoostRef.current = 0;
      } else {
        ensureAnimationLoop();
      }
    });

    const handleVisibility = () => {
      const onSpiralSection = isAtshSpiralSectionActive();
      if (document.visibilityState === "visible" && (isActiveRef.current || onSpiralSection)) {
        ensureAnimationLoop();
      } else {
        stopAnimationLoop();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibility);
      stopAnimationLoop();
    };
  }, [
    autoRotate,
    ensureAnimationLoop,
    isActive,
    scrollBoostsAutoSpeed,
    scrollSmoothing,
    scrollSpeedBoostDecayPerSec,
    smoothing,
    hoverSpeedMultiplier,
    spiralSpeed,
    stopAnimationLoop,
    time,
  ]);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    perspective: `${perspective}px`,
    perspectiveOrigin: "50% 50%",
    ...style,
  };

  const sceneStyle: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
    transform: "translateZ(0)",
  };

  const cylinderStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: `${cylinderRadius * 2}px`,
    height: `${cylinderHeight}px`,
    transform: "translate(-50%, -50%)",
    borderRadius: `${cylinderRadius}px`,
    background: `linear-gradient(180deg, 
      ${cylinderColor}00 0%, 
      ${cylinderColor}${Math.round(cylinderOpacity * 255)
        .toString(16)
        .padStart(2, "0")} 50%, 
      ${cylinderColor}00 100%)`,
    border: `1px solid ${cylinderColor}${Math.round(cylinderOpacity * 128)
      .toString(16)
      .padStart(2, "0")}`,
    boxShadow: `inset 0 0 60px ${cylinderColor}${Math.round(cylinderOpacity * 128)
      .toString(16)
      .padStart(2, "0")}`,
    transformStyle: "preserve-3d",
    pointerEvents: "none",
  };

  return (
    <div ref={containerRef} className={className} style={containerStyle} aria-label="ATSH 3D Spiral Gallery">
      <div style={sceneStyle}>
        {showCylinder && <div style={cylinderStyle} />}

        {isMotionReady &&
          repeatedCards.map((card, index) => (
            <SpiralCard
              key={`${card.src}-${index}`}
              card={card}
              index={index}
              totalCards={repeatedCards.length}
              time={time}
              cylinderRadius={cylinderRadius}
              cylinderHeight={cylinderHeight}
              rotationSpeed={rotationSpeed}
              spiralRounds={spiralRounds}
              helixPitchScale={helixPitchScale}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              cardBorderRadius={cardBorderRadius}
              cardShadow={cardShadow}
              cardHoverShadow={cardHoverShadow}
              hasAnimatedIn={hasAnimatedIn}
              prefersReducedMotion={prefersReducedMotion}
              onHoverChange={handleCardHoverChange}
            />
          ))}

        {centerOverlay}
      </div>
    </div>
  );
}

type SpiralCardLayout = {
  helixPhaseOffset: number;
  helixLength: number;
  totalHeight: number;
};

type SpiralCardProps = {
  card: AtshSpiralCard;
  index: number;
  totalCards: number;
  time: ReturnType<typeof useMotionValue<number>>;
  cylinderRadius: number;
  cylinderHeight: number;
  cardWidth: number;
  cardHeight: number;
  rotationSpeed: number;
  spiralRounds: number;
  helixPitchScale: number;
  cardBorderRadius: number;
  cardShadow: string;
  cardHoverShadow: string;
  hasAnimatedIn: boolean;
  prefersReducedMotion: boolean;
  onHoverChange?: (hovered: boolean) => void;
};

const SpiralCard = React.memo(function SpiralCard(props: SpiralCardProps) {
  const {
    card,
    index,
    totalCards,
    time,
    cylinderRadius,
    cylinderHeight,
    rotationSpeed,
    spiralRounds,
    helixPitchScale,
    cardWidth,
    cardHeight,
    cardBorderRadius,
    cardShadow,
    cardHoverShadow,
    hasAnimatedIn,
    prefersReducedMotion,
    onHoverChange,
  } = props;
  const router = useRouter();
  const [isHovered, setIsHovered] = React.useState(false);
  const entranceDelay = getAtshSpiralCardStaggerDelaySec(index, totalCards);

  const layout = React.useMemo((): SpiralCardLayout => {
    const helixLength = 2 * Math.PI * spiralRounds;
    const totalHeight = cylinderHeight * spiralRounds;
    return {
      helixPhaseOffset: (index / totalCards) * helixLength,
      helixLength,
      totalHeight,
    };
  }, [cylinderHeight, index, spiralRounds, totalCards]);

  const setHovered = React.useCallback(
    (hovered: boolean) => {
      setIsHovered(hovered);
      onHoverChange?.(hovered);
    },
    [onHoverChange],
  );

  const transform = useTransform(time, (t: number) => {
    const { helixPhaseOffset, helixLength, totalHeight } = layout;
    // One helix phase drives both orbit angle and height — front (angle≈0) aligns with y≈0.
    const phaseRate = (rotationSpeed * Math.PI) / 180;
    const phi = helixPhaseOffset + t * phaseRate;

    const angle = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const phaseWrapped = ((phi % helixLength) + helixLength) % helixLength;
    const yCentered = (phaseWrapped / helixLength) * totalHeight - totalHeight / 2;
    const y = yCentered * helixPitchScale;

    const x = Math.sin(angle) * cylinderRadius;
    const z = Math.cos(angle) * cylinderRadius;
    const rotateY = (angle * 180) / Math.PI;

    return formatSpiralCardTransform(x, y, z, rotateY);
  });

  return (
    <motion.div
      style={{
        position: "absolute",
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        left: "50%",
        top: "50%",
        marginLeft: `${-cardWidth / 2}px`,
        marginTop: `${-cardHeight / 2}px`,
        transformStyle: "preserve-3d",
        transform,
        cursor: "pointer",
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={
        card.href
          ? () => {
              setAtshSpiralHash();
              router.push(card.href!);
            }
          : undefined
      }
      onKeyDown={
        card.href
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setAtshSpiralHash();
                router.push(card.href!);
              }
            }
          : undefined
      }
      role={card.href ? "link" : "button"}
      tabIndex={card.href ? 0 : -1}
      aria-label={card.alt ?? "Spiral card"}
    >
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          borderRadius: `${cardBorderRadius}px`,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.10)",
          background: "transparent",
          boxShadow: isHovered ? cardHoverShadow : cardShadow,
          transition: SHADOW_TRANSITION,
        }}
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.3, y: -200 }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                opacity: hasAnimatedIn ? 1 : 0,
                scale: hasAnimatedIn ? 1 : 0.3,
                y: hasAnimatedIn ? 0 : -200,
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                opacity: {
                  duration: ATSH_SPIRAL_ENTRANCE.cardOpacityDurationSec,
                  delay: entranceDelay,
                  ease: ENTRANCE_EASE,
                },
                scale: {
                  duration: ATSH_SPIRAL_ENTRANCE.cardMotionDurationSec,
                  delay: entranceDelay,
                  ease: ENTRANCE_BOUNCE_EASE,
                },
                y: {
                  duration: ATSH_SPIRAL_ENTRANCE.cardMotionDurationSec,
                  delay: entranceDelay,
                  ease: ENTRANCE_BOUNCE_EASE,
                },
              }
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.src}
          alt={card.alt ?? ""}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          draggable={false}
          decoding="async"
        />
      </motion.div>
    </motion.div>
  );
});
