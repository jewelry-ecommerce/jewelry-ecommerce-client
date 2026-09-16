/** DOM id for hero section */
export const ATSH_HERO_SECTION_ID = "atsh-hero";

/**
 * DOM id + public hash cho section 24 Anh Trai.
 * Deep link: `/bst-collab-tinhhasayhi#24-anh-trai`
 */
export const ATSH_SPIRAL_SECTION_ID = "24-anh-trai";

/** Empty full-viewport section between hero and spiral for extra scroll beat */
export const ATSH_SCROLL_SPACER_SECTION_ID = "atsh-scroll-spacer";

/** Duration for smooth scroll between ATSH sections (ms) — aligned with portfolio-style scroll (pacomepertant-like). */
export const ATSH_SECTION_SCROLL_DURATION_MS = 1400;

/** Wheel delta accumulation before advancing one full-page section. */
export const ATSH_SECTION_WHEEL_THRESHOLD = 72;

/** Easing for section scroll — expo out (GSAP / Lenis-adjacent feel). */
export const ATSH_SECTION_SCROLL_EASE = "expoOut" as const;

export const ATSH_HERO_MOTION = {
  exitDuration: 1.2,
  exitEase: [0.76, 0, 0.24, 1] as const,
  logoEntrance: {
    duration: 1.5,
    ease: [0.34, 1.56, 0.64, 1] as const,
    delay: 0.2,
  },
  logoFloat: {
    duration: 6,
    ease: "easeInOut" as const,
  },
  headlineEntrance: {
    delay: 0.8,
    charDuration: 0.5,
    /** Stagger theo từ — tránh rớt chữ giữa syllable như animate từng ký tự */
    wordDelayStep: 0.06,
  },
  taglineEntrance: {
    duration: 1.2,
    delay: 1.0,
    ease: [0.34, 1.56, 0.64, 1] as const,
    initialScale: 0.9,
    lineDelayStep: 0.1,
  },
  ctaEntrance: {
    duration: 1.0,
    delay: 1.3,
    ease: [0.34, 1.56, 0.64, 1] as const,
    initialScale: 0.8,
  },
  /**
   * Bán kính quỹ đạo particle (tâm = giữa headline & tagline).
   * × orbitRadiusFactor ≈ độ rộng vòng; chọn đủ lớn để bọc logo + CTA.
   */
  orbitRadius: {
    mobile: 250,
    desktop: 340,
  },
  /** Kích thước lớp absolute = orbitRadius × multiplier (chứa glow + particle) */
  orbitLayerSizeMultiplier: 2.8,
  /** Glow ring — căn giữa vùng text (không offset logo) */
  glowRingOffsetY: 0,
  particle: {
    count: 12,
    orbitRadiusFactor: 0.7,
    duration: 4,
    baseDelay: 0.5,
    delayStep: 0.1,
  },
  glowRing: {
    duration: 3,
    delay: 0.5,
    sizeFactor: 1.3,
  },
  /** Primary CTA hover — shared by AtshCtaButton */
  ctaHover: {
    scale: 1.08,
    tapScale: 0.92,
    boxShadow: "0 0 30px rgba(255,255,255,0.4)",
    hoverTransitionDuration: 0.3,
    shimmerDuration: 1.2,
    shimmerEase: [0.4, 0, 0.2, 1] as const,
    borderRadius: 12,
    /** Narrow bright band on full-width layer — animates x -100% → 100% for full horizontal sweep */
    shimmerGradient:
      "linear-gradient(90deg, transparent 0%, transparent 42%, rgba(255,255,255,0.38) 50%, transparent 58%, transparent 100%)",
  },
  ctaLabelHover: {
    duration: 0.3,
    charDelayStep: 0.02,
    yOffset: -5,
    ease: "easeInOut" as const,
    primary: {
      fontWeightFrom: 700,
      fontWeightTo: 600,
    },
    secondary: {
      fontWeightFrom: 700,
      fontWeightTo: 600,
    },
  },
} as const;
