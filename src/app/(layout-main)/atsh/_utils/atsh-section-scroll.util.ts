import { ATSH_HERO_SECTION_ID, ATSH_SECTION_SCROLL_DURATION_MS, ATSH_SPIRAL_SECTION_ID } from "../_constants/atsh-hero-motion.constants";
import { isAtshLandingPath } from "../_constants/atsh.constants";

export const ATSH_SECTION_IDS = [ATSH_HERO_SECTION_ID, ATSH_SPIRAL_SECTION_ID] as const;

type AtshLandingSectionNavigator = (index: number, options?: AtshSmoothScrollOptions) => void;

let landingSectionNavigator: AtshLandingSectionNavigator | null = null;
let atshSectionScrollInProgress = false;
let atshUsesFixedLandingSections = false;
let atshFixedSectionIndex = 0;
let cachedSectionIndex = 0;
let sectionIndexListeners: Set<(index: number) => void> | null = null;
let sectionIndexCacheAttached = false;

export function registerAtshLandingSectionNavigator(navigator: AtshLandingSectionNavigator | null) {
  landingSectionNavigator = navigator;
}

export function enableAtshFixedLandingSections() {
  atshUsesFixedLandingSections = true;
  atshFixedSectionIndex = 0;
}

export function disableAtshFixedLandingSections() {
  atshUsesFixedLandingSections = false;
  atshFixedSectionIndex = 0;
  cachedSectionIndex = 0;
  atshSectionScrollInProgress = false;
  sectionIndexCacheAttached = false;
}

export function setAtshFixedSectionIndex(index: number) {
  const next = Math.max(0, Math.min(index, ATSH_SECTION_IDS.length - 1));
  if (next === atshFixedSectionIndex) {
    return;
  }

  atshFixedSectionIndex = next;
  cachedSectionIndex = next;
  syncAtshUrlHashForSectionIndex(next);
  sectionIndexListeners?.forEach((listener) => listener(next));
}

export function markAtshSectionScrollStarted() {
  atshSectionScrollInProgress = true;
}

export function markAtshSectionScrollEnded() {
  atshSectionScrollInProgress = false;
}

export function isAtshSectionScrollInProgress() {
  return atshSectionScrollInProgress;
}

export type AtshSmoothScrollOptions = {
  durationMs?: number;
  instant?: boolean;
  onComplete?: () => void;
};

function smoothScrollToSectionIndex(sectionIndex: number, options?: AtshSmoothScrollOptions) {
  if (sectionIndex === atshFixedSectionIndex) {
    options?.onComplete?.();
    return () => undefined;
  }

  markAtshSectionScrollStarted();
  landingSectionNavigator?.(sectionIndex, {
    instant: options?.instant,
    durationMs: options?.durationMs,
    onComplete: () => {
      markAtshSectionScrollEnded();
      options?.onComplete?.();
    },
  });

  return () => undefined;
}

export function smoothScrollToSectionId(sectionId: string, options?: AtshSmoothScrollOptions) {
  const sectionIndex = ATSH_SECTION_IDS.indexOf(sectionId as (typeof ATSH_SECTION_IDS)[number]);
  if (sectionIndex < 0) {
    options?.onComplete?.();
    return () => undefined;
  }

  return smoothScrollToSectionIndex(sectionIndex, options);
}

/** Public hash — `#24-anh-trai`. */
export const ATSH_SPIRAL_HASH = `#${ATSH_SPIRAL_SECTION_ID}` as const;

export const ATSH_PENDING_SPIRAL_SCROLL_KEY = "atsh-pending-spiral-scroll";

function getAtshPathnameUrl() {
  return window.location.pathname + window.location.search;
}

export function normalizeAtshSpiralHash(hash: string): string {
  const trimmed = hash.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

/** True khi URL hash trỏ tới section 24 Anh Trai (`#24-anh-trai`). */
export function isAtshSpiralSectionHash(hash: string | null | undefined): boolean {
  if (!hash) return false;
  return normalizeAtshSpiralHash(hash) === ATSH_SPIRAL_HASH;
}

export function hasAtshSpiralHash() {
  if (typeof window === "undefined") return false;
  return isAtshSpiralSectionHash(window.location.hash);
}

export function setAtshSpiralHash() {
  if (typeof window === "undefined") return;
  if (!isAtshLandingPath(window.location.pathname)) return;
  if (window.location.hash === ATSH_SPIRAL_HASH) return;
  window.history.replaceState(window.history.state, "", `${getAtshPathnameUrl()}${ATSH_SPIRAL_HASH}`);
}

export function clearAtshSpiralHash() {
  if (typeof window === "undefined") return;
  if (!isAtshSpiralSectionHash(window.location.hash)) return;
  window.history.replaceState(window.history.state, "", getAtshPathnameUrl());
}

function syncAtshUrlHashForSectionIndex(index: number) {
  const spiralIndex = ATSH_SECTION_IDS.length - 1;
  if (index >= spiralIndex) setAtshSpiralHash();
  else if (hasAtshSpiralHash()) clearAtshSpiralHash();
}

export function markAtshSpiralScrollPending() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ATSH_PENDING_SPIRAL_SCROLL_KEY, "1");
}

export function readAtshSpiralScrollIntent() {
  return hasAtshSpiralHash();
}

export function clearAtshSpiralScrollPending() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ATSH_PENDING_SPIRAL_SCROLL_KEY);
}

export function isAtshCoarsePointerDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

function commitAtshSpiralNavigation() {
  clearAtshSpiralScrollPending();
  setAtshSpiralHash();
  cachedSectionIndex = ATSH_SECTION_IDS.length - 1;
  syncAtshUrlHashForSectionIndex(cachedSectionIndex);
  sectionIndexListeners?.forEach((listener) => listener(cachedSectionIndex));
}

/** Mobile/touch: chuyển thẳng sang spiral section (fixed landing). */
export function navigateAtshToSpiralOnTouch() {
  if (typeof window === "undefined") return;

  const spiralIndex = ATSH_SECTION_IDS.length - 1;
  landingSectionNavigator?.(spiralIndex, { instant: true });
  commitAtshSpiralNavigation();
}

export function scrollAtshToSpiralSection(options?: AtshSmoothScrollOptions) {
  if (typeof window === "undefined") return () => undefined;

  if (isAtshCoarsePointerDevice()) {
    navigateAtshToSpiralOnTouch();
    options?.onComplete?.();
    return () => undefined;
  }

  return smoothScrollToSectionId(ATSH_SPIRAL_SECTION_ID, {
    ...options,
    onComplete: () => {
      clearAtshSpiralScrollPending();
      setAtshSpiralHash();
      options?.onComplete?.();
    },
  });
}

export function getCurrentAtshSectionIndex() {
  if (atshUsesFixedLandingSections) {
    return atshFixedSectionIndex;
  }

  return cachedSectionIndex;
}

export function isAtshSpiralSectionInView() {
  if (atshUsesFixedLandingSections) {
    return atshFixedSectionIndex >= ATSH_SECTION_IDS.length - 1;
  }

  return cachedSectionIndex >= ATSH_SECTION_IDS.length - 1;
}

export function refreshCachedAtshSectionIndex() {
  const next = getCurrentAtshSectionIndex();
  if (next === cachedSectionIndex) return;
  cachedSectionIndex = next;
  syncAtshUrlHashForSectionIndex(next);
  sectionIndexListeners?.forEach((listener) => listener(next));
}

export function isAtshSpiralSectionActive() {
  return isAtshSpiralSectionInView() || getCurrentAtshSectionIndex() === ATSH_SECTION_IDS.length - 1;
}

export function initAtshPageScrollOnLoad(): boolean {
  if (typeof window === "undefined") return false;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  const wantsSpiral = hasAtshSpiralHash();

  if (!wantsSpiral) {
    clearAtshSpiralScrollPending();
    clearAtshSpiralHash();
  }

  const initialIndex = wantsSpiral ? ATSH_SECTION_IDS.length - 1 : 0;

  setAtshFixedSectionIndex(initialIndex);
  landingSectionNavigator?.(initialIndex, { instant: true });
  window.scrollTo(0, 0);

  // Chỉ defer khi chưa có navigator (tránh flash hero rồi scroll lại trên deep link)
  return wantsSpiral && landingSectionNavigator == null;
}

export function getCachedAtshSectionIndex() {
  return cachedSectionIndex;
}

export function subscribeAtshSectionIndex(listener: (index: number) => void) {
  if (!sectionIndexListeners) sectionIndexListeners = new Set();
  sectionIndexListeners.add(listener);
  listener(cachedSectionIndex);
  return () => sectionIndexListeners?.delete(listener);
}

export function setupAtshSectionIndexCache() {
  if (sectionIndexCacheAttached || typeof window === "undefined") return;
  sectionIndexCacheAttached = true;
  refreshCachedAtshSectionIndex();
}

/** Reset module state — dùng trong unit test. */
export function resetAtshSectionScrollStateForTests() {
  landingSectionNavigator = null;
  atshSectionScrollInProgress = false;
  atshUsesFixedLandingSections = false;
  atshFixedSectionIndex = 0;
  cachedSectionIndex = 0;
  sectionIndexListeners = null;
  sectionIndexCacheAttached = false;
}
