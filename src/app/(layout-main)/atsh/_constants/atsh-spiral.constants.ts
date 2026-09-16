export const ATSH_SPIRAL_IMAGE_BASE = "/image/atsh/spiral";

export const ATSH_SPIRAL_ASSETS = {
  centerLogo: `${ATSH_SPIRAL_IMAGE_BASE}/spiral-center-logo.png`,
  card: `${ATSH_SPIRAL_IMAGE_BASE}/spiral-card.png`,
} as const;

/** Staged entrance when spiral section becomes active: delay → logo → cards */
export const ATSH_SPIRAL_ENTRANCE = {
  initialDelayMs: 400,
  logoDurationSec: 0.8,
  logoDelaySec: 0.05,
  logoEase: [0.25, 0.1, 0.25, 1] as const,
  /** Cards start shortly after logo begins (overlap), not after logo finishes */
  cardStartAfterLogoMs: 120,
  /** Per-card stagger: base + (index / totalCards) * spread */
  cardStaggerBaseSec: 0.5,
  cardStaggerSpreadSec: 1,
  cardOpacityDurationSec: 1,
  cardMotionDurationSec: 1.2,
} as const;

export function getAtshSpiralCardEntranceDelayMs() {
  const { initialDelayMs, logoDelaySec, cardStartAfterLogoMs } = ATSH_SPIRAL_ENTRANCE;
  return initialDelayMs + logoDelaySec * 1000 + cardStartAfterLogoMs;
}

export function getAtshSpiralCardStaggerDelaySec(index: number, totalCards: number) {
  const { cardStaggerBaseSec, cardStaggerSpreadSec } = ATSH_SPIRAL_ENTRANCE;
  if (totalCards <= 0) return cardStaggerBaseSec;
  return cardStaggerBaseSec + (index / totalCards) * cardStaggerSpreadSec;
}

/** Slug anh trai theo đúng thứ tự hiển thị trên spiral (24 anh trai). */
export const ATSH_SPIRAL_BROTHER_SLUG_ORDER = [
  "quang-hung-masterd",
  "duong-domic",
  "phap-kieu",
  "hurrykng",
  "song-luan",
  "jsol",
  "wean",
  "captain-boy",
  "ali-hoang-duong",
  "bui-truong-linh",
  "son-k",
  "cody-nam-vo",
  "vuong-binh",
  "jaysonlei",
  "dillan",
  "congb",
  "wren-evans",
  "dang-hong-hai",
  "the-thien",
  "coolkid",
  "xuan-dinh-ky",
  "kim-long",
  "hyo",
  "ivan",
] as const;

export const ATSH_SPIRAL_CARD_BREAKPOINT = 810;
/** Content viewport height — short screens use mobile tier even when width is larger (e.g. landscape). */
export const ATSH_SPIRAL_CARD_BREAKPOINT_HEIGHT = 810;
/** Tablet tier: above mobile card breakpoint until theme `lg` (1200px). */
export const ATSH_SPIRAL_DESKTOP_BREAKPOINT = 1200;
export const ATSH_SPIRAL_CARD_SIZE_DESKTOP = 310;
export const ATSH_SPIRAL_CARD_SIZE_TABLET = 270;
export const ATSH_SPIRAL_CARD_SIZE_MOBILE = 220;

export type AtshSpiralBreakpointTier = "mobile" | "tablet" | "desktop";

export function isAtshSpiralMobileViewport(viewportWidth: number, viewportHeight?: number) {
  if (viewportWidth <= 0) return false;

  const isNarrow = viewportWidth <= ATSH_SPIRAL_CARD_BREAKPOINT;
  const isShort = viewportHeight != null && viewportHeight > 0 && viewportHeight <= ATSH_SPIRAL_CARD_BREAKPOINT_HEIGHT;

  return isNarrow || isShort;
}

export function getAtshSpiralBreakpointTier(viewportWidth: number, viewportHeight?: number): AtshSpiralBreakpointTier {
  if (isAtshSpiralMobileViewport(viewportWidth, viewportHeight)) return "mobile";
  if (viewportWidth >= ATSH_SPIRAL_DESKTOP_BREAKPOINT) return "desktop";
  return "tablet";
}

const ATSH_SPIRAL_STAGE_HEIGHT_BUFFER = 32;
const ATSH_SPIRAL_MIN_CYLINDER_HEIGHT = 200;

const ATSH_SPIRAL_CYLINDER_BASE = {
  show: true,
  color: "#FFFFFF",
  opacity: 0,
} as const;

const ATSH_SPIRAL_CARD_STYLE_BASE = {
  borderRadius: 16,
  shadow: "0 20px 60px rgba(0,0,0,0.5)",
  /** Figma Card Variant3/Variant4 hover — node 20919-329598 / 329599 */
  hoverShadow: "0 0 40px rgba(255, 255, 255, 0.32)",
} as const;

const ATSH_SPIRAL_LERP_BASE = {
  /** Lerp khi auto-rotate — mượt, không giật */
  smoothing: 0.18,
  /** Lerp khi wheel/touch — bám input nhanh hơn nhưng vẫn mượt */
  scrollSmoothing: 0.42,
} as const;

/** Hệ số tốc độ auto-rotate khi hover card (0–1; thấp hơn = chậm hơn, không dừng hẳn). */
export const ATSH_SPIRAL_HOVER_SPEED_MULTIPLIER = 0.32;

/** Tốc độ blend hệ số hover về mục tiêu (càng cao càng phản hồi nhanh). */
export const ATSH_SPIRAL_HOVER_SPEED_BLEND_RATE = 7;

/** Desktop wheel tăng tốc quay thêm trên nền auto-rotate liên tục (pacomepertant-style). */
const ATSH_SPIRAL_SCROLL_SPEED_BOOST_DESKTOP = {
  scrollBoostsAutoSpeed: true,
  scrollSpeedBoostFactor: 0.0045,
  scrollSpeedBoostMax: 4,
  scrollSpeedBoostDecayPerSec: 2.8,
} as const;

/** Vertical stretch per helix tier — 1 = Figma base pitch, >1 = steeper (demo ~1.75). */
const ATSH_SPIRAL_HELIX_PITCH_DESKTOP = 1.6;
const ATSH_SPIRAL_HELIX_PITCH_MOBILE = 1.4;

/** Figma Spiral Gallery desktop (≥1200px) */
const ATSH_SPIRAL_MOTION_DESKTOP = {
  spiralSpeed: 0.5,
  rotationSpeedDegPerSecond: 24,
  descentSpeedPxPerSecond: 64,
  cardSpacing: 500,
  spiralRounds: 2,
  helixPitchScale: ATSH_SPIRAL_HELIX_PITCH_DESKTOP,
  cylinder: ATSH_SPIRAL_CYLINDER_BASE,
  card: ATSH_SPIRAL_CARD_STYLE_BASE,
  ...ATSH_SPIRAL_LERP_BASE,
} as const;

/** Figma Spiral Gallery mobile (≤420px) — node 20919-329599 */
const ATSH_SPIRAL_MOTION_MOBILE = {
  spiralSpeed: 0.5,
  rotationSpeedDegPerSecond: 20,
  descentSpeedPxPerSecond: 32,
  cardSpacing: 50,
  spiralRounds: 2,
  helixPitchScale: ATSH_SPIRAL_HELIX_PITCH_MOBILE,
  cylinder: ATSH_SPIRAL_CYLINDER_BASE,
  card: ATSH_SPIRAL_CARD_STYLE_BASE,
  ...ATSH_SPIRAL_LERP_BASE,
} as const;

export type AtshSpiralBreakpointConfig = {
  /** Stage clip box — sync with Figma frame (19839-185602 / 616 / 491) */
  stageWidth: number;
  stageHeight: number;
  cardWidth: number;
  cardHeight: number;
  perspective: number;
  cylinderRadius: number;
  cylinderHeight: number;
  scrollSensitivity: number;
  touchSensitivity: number;
  spiralSpeed: number;
  rotationSpeedDegPerSecond: number;
  descentSpeedPxPerSecond: number;
  cardSpacing: number;
  spiralRounds: number;
  /** Multiplier on helix vertical pitch (demo uses ~1.65–1.75). */
  helixPitchScale: number;
  cylinder: {
    show: boolean;
    color: string;
    opacity: number;
  };
  card: {
    borderRadius: number;
    shadow: string;
    hoverShadow: string;
  };
  smoothing: number;
  scrollSmoothing: number;
  /** Wheel boosts `spiralSpeed` instead of scrubbing timeline (desktop). */
  scrollBoostsAutoSpeed?: boolean;
  scrollSpeedBoostFactor?: number;
  scrollSpeedBoostMax?: number;
  scrollSpeedBoostDecayPerSec?: number;
};

/** Figma mobile Spiral Gallery (≤420px) — node 20919-329599 */
export const ATSH_SPIRAL_CONFIG_MOBILE: AtshSpiralBreakpointConfig = {
  stageWidth: 560,
  stageHeight: 771,
  cardWidth: ATSH_SPIRAL_CARD_SIZE_MOBILE,
  cardHeight: ATSH_SPIRAL_CARD_SIZE_MOBILE,
  perspective: 1800,
  cylinderRadius: 320,
  cylinderHeight: 450,
  scrollSensitivity: 0.0045,
  touchSensitivity: 0.018,
  ...ATSH_SPIRAL_MOTION_MOBILE,
};

/** Figma tablet Spiral Gallery (421px–1199px) — stage 881×1076 */
export const ATSH_SPIRAL_CONFIG_TABLET: AtshSpiralBreakpointConfig = {
  stageWidth: 881,
  stageHeight: 1076,
  cardWidth: ATSH_SPIRAL_CARD_SIZE_TABLET,
  cardHeight: ATSH_SPIRAL_CARD_SIZE_TABLET,
  perspective: 2400,
  cylinderRadius: 480,
  cylinderHeight: 1000,
  scrollSensitivity: 0.004,
  touchSensitivity: 0.012,
  ...ATSH_SPIRAL_MOTION_DESKTOP,
};

/** Figma desktop — stage 1270×1000 */
export const ATSH_SPIRAL_CONFIG_DESKTOP: AtshSpiralBreakpointConfig = {
  stageWidth: 1270,
  stageHeight: 1000,
  cardWidth: ATSH_SPIRAL_CARD_SIZE_DESKTOP,
  cardHeight: ATSH_SPIRAL_CARD_SIZE_DESKTOP,
  perspective: 2400,
  cylinderRadius: 480,
  cylinderHeight: 1000,
  scrollSensitivity: 0.004,
  touchSensitivity: 0.012,
  ...ATSH_SPIRAL_MOTION_DESKTOP,
  ...ATSH_SPIRAL_SCROLL_SPEED_BOOST_DESKTOP,
};

/** @deprecated Use getAtshSpiralBreakpointConfig — kept for imports */
export const ATSH_SPIRAL_CONFIG = ATSH_SPIRAL_CONFIG_DESKTOP;

function clampSpiralConfigToViewportHeight(
  config: AtshSpiralBreakpointConfig,
  viewportHeight: number,
  buffer = ATSH_SPIRAL_STAGE_HEIGHT_BUFFER,
): AtshSpiralBreakpointConfig {
  if (viewportHeight <= 0) return config;

  let next = config;
  let dims = getAtshSpiralStageDimensions(next, buffer);

  if (dims.stageHeight <= viewportHeight) return next;

  const maxCylinderHeight = viewportHeight - next.cardHeight - buffer;
  next = {
    ...next,
    cylinderHeight: Math.max(ATSH_SPIRAL_MIN_CYLINDER_HEIGHT, Math.min(next.cylinderHeight, maxCylinderHeight)),
    stageHeight: Math.min(next.stageHeight, viewportHeight),
  };

  dims = getAtshSpiralStageDimensions(next, buffer);
  if (dims.stageHeight <= viewportHeight) return next;

  return {
    ...next,
    stageHeight: Math.max(
      getAtshSpiralMinStageHeight(next.cardHeight, next.cylinderHeight, next.spiralRounds, next.helixPitchScale, buffer),
      viewportHeight,
    ),
  };
}

/**
 * Responsive spiral config — mobile when width ≤810px or content height ≤810px;
 * tablet 811–1199px; desktop ≥1200px.
 * Tablet/desktop clamp cylinder height to fit viewport without downscaling cards.
 */
export function getAtshSpiralBreakpointConfig(viewportWidth: number, viewportHeight?: number): AtshSpiralBreakpointConfig {
  const tier = getAtshSpiralBreakpointTier(viewportWidth, viewportHeight);

  let config =
    tier === "mobile"
      ? { ...ATSH_SPIRAL_CONFIG_MOBILE }
      : tier === "tablet"
        ? { ...ATSH_SPIRAL_CONFIG_TABLET }
        : { ...ATSH_SPIRAL_CONFIG_DESKTOP };

  if (tier !== "mobile" && viewportHeight != null) {
    config = clampSpiralConfigToViewportHeight(config, viewportHeight);
  }

  return config;
}

/** Min stage width — card orbit must fit inside clip box (2 × radius + card). */
export function getAtshSpiralMinStageWidth(cardWidth: number, cylinderRadius: number, buffer = 16) {
  return 2 * (cylinderRadius + cardWidth / 2) + buffer;
}

/** Min stage height — full helix vertical span + card. */
export function getAtshSpiralMinStageHeight(
  cardHeight: number,
  cylinderHeight: number,
  spiralRounds: number,
  helixPitchScale: number,
  buffer = 32,
) {
  const totalHeight = cylinderHeight * spiralRounds;
  return helixPitchScale * totalHeight + cardHeight + buffer;
}

/** Effective stage size: Figma frame vs minimum 3D bounds (whichever is larger). */
export function getAtshSpiralStageDimensions(config: AtshSpiralBreakpointConfig, buffer = 16) {
  return {
    stageWidth: Math.max(config.stageWidth, getAtshSpiralMinStageWidth(config.cardWidth, config.cylinderRadius, buffer)),
    stageHeight: Math.max(
      config.stageHeight,
      getAtshSpiralMinStageHeight(config.cardHeight, config.cylinderHeight, config.spiralRounds, config.helixPitchScale, buffer),
    ),
  };
}

/** Stage scale that preserves target card size (never below 1). */
export function getAtshSpiralStageScale(frameWidth: number, frameHeight: number, stageWidth: number, stageHeight: number) {
  if (frameWidth <= 0 || frameHeight <= 0 || stageWidth <= 0 || stageHeight <= 0) return 1;
  const fitScale = Math.min(frameWidth / stageWidth, frameHeight / stageHeight);
  return Math.min(1, Math.max(fitScale, 1));
}
