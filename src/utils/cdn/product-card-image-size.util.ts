import type { CdnImageTransform } from "./cdn-image.util";
import { CDN_IMAGE_RETINA_DPR, clampCdnImageDevicePixelRatio, getCdnImageDevicePixelRatio } from "./cdn-image-dpr.util";
import { clampCdnImageTransformSize } from "./cdn-image.util";

/** Product card image aspect (matches CSS `aspectRatio: "350 / 440"`). */
export const PRODUCT_CARD_ASPECT_WIDTH = 350;
export const PRODUCT_CARD_ASPECT_HEIGHT = 440;
export const PRODUCT_CARD_ASPECT_RATIO = PRODUCT_CARD_ASPECT_HEIGHT / PRODUCT_CARD_ASPECT_WIDTH;

/** Round CDN widths up to this step so resize does not thrash image URLs. */
export const PRODUCT_CARD_CDN_WIDTH_STEP = 25;

export const PRODUCT_CARD_CDN_QUALITY = 95;
export const PRODUCT_CARD_CDN_FORMAT = "webp" as const;

export function bucketCdnWidth(value: number, step = PRODUCT_CARD_CDN_WIDTH_STEP): number {
  if (!Number.isFinite(value) || value <= 0) {
    return step;
  }

  return Math.max(step, Math.ceil(value / step) * step);
}

/**
 * Builds a CDN resize transform from the card image's on-screen CSS width.
 * Multiplies by devicePixelRatio (max 3) so retina displays stay sharp,
 * then clamps to CDN max dimensions (never upscale past typical originals).
 */
export function buildProductCardCdnTransform(
  displayWidthCssPx: number,
  devicePixelRatio: number = getCdnImageDevicePixelRatio(),
): CdnImageTransform {
  const dpr = clampCdnImageDevicePixelRatio(devicePixelRatio);
  const width = bucketCdnWidth(displayWidthCssPx * dpr);
  const height = Math.round(width * PRODUCT_CARD_ASPECT_RATIO);

  return clampCdnImageTransformSize({
    width,
    height,
    quality: PRODUCT_CARD_CDN_QUALITY,
    format: PRODUCT_CARD_CDN_FORMAT,
  });
}

/**
 * Fallback before ResizeObserver measures the card.
 * Uses design CSS size × retina DPR so search / slider / wishlist first paint stays sharp on iPhone.
 */
export const DEFAULT_PRODUCT_CARD_CDN_TRANSFORM: CdnImageTransform = buildProductCardCdnTransform(
  PRODUCT_CARD_ASPECT_WIDTH,
  CDN_IMAGE_RETINA_DPR,
);

export function isSameCdnTransform(a: CdnImageTransform, b: CdnImageTransform): boolean {
  return a.width === b.width && a.height === b.height && a.quality === b.quality && a.format === b.format;
}
