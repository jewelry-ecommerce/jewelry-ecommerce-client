import { clampCdnImageTransformSize, type CdnImageTransform } from "./cdn-image.util";

export { CDN_IMAGE_MAX_TRANSFORM_HEIGHT, CDN_IMAGE_MAX_TRANSFORM_WIDTH, clampCdnImageTransformSize } from "./cdn-image.util";

/** Cap DPR so CDN requests stay bounded (iPhone retina is typically 3). */
export const CDN_IMAGE_MAX_DPR = 3;

/**
 * Static retina multiplier for SSR / preload transforms where `window` is unavailable.
 * Matches common iPhone devicePixelRatio so LCP URLs stay sharp without a client refetch.
 */
export const CDN_IMAGE_RETINA_DPR = CDN_IMAGE_MAX_DPR;

export function clampCdnImageDevicePixelRatio(dpr: number): number {
  if (!Number.isFinite(dpr) || dpr <= 1) return 1;
  return Math.min(Math.ceil(dpr), CDN_IMAGE_MAX_DPR);
}

export function getCdnImageDevicePixelRatio(): number {
  if (typeof window === "undefined") return 1;
  return clampCdnImageDevicePixelRatio(window.devicePixelRatio || 1);
}

export function scaleCdnTransformByDevicePixelRatio(
  transform: CdnImageTransform,
  devicePixelRatio: number = getCdnImageDevicePixelRatio(),
): CdnImageTransform {
  const dpr = clampCdnImageDevicePixelRatio(devicePixelRatio);
  if (dpr === 1) return clampCdnImageTransformSize(transform);

  return clampCdnImageTransformSize({
    ...transform,
    width: Math.round(transform.width * dpr),
    height: Math.round(transform.height * dpr),
  });
}
