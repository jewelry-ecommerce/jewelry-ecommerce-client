import { rewriteCdnImageUrlTransform, type CdnImageTransform } from "@/utils/cdn/cdn-image.util";
import { CDN_IMAGE_RETINA_DPR, scaleCdnTransformByDevicePixelRatio } from "@/utils/cdn/cdn-image-dpr.util";

export const PRODUCT_INFO_CARD_WIDTH = 473;
export const PRODUCT_INFO_CARD_HEIGHT = 270;
export const PRODUCT_INFO_CARD_ASPECT_RATIO = `${PRODUCT_INFO_CARD_WIDTH} / ${PRODUCT_INFO_CARD_HEIGHT}`;

/**
 * Prefer a wide transform so landscape trust strips are not center-cropped into ~1.75:1
 * (that crop + CSS cover was upscaling a thin slice → blur even with sharp `/original.webp`).
 * If CDN rejects (larger than asset), `CdnImage` falls back to original; UI uses natural aspect.
 */
export const PRODUCT_INFO_CARD_CDN_TRANSFORM: CdnImageTransform = scaleCdnTransformByDevicePixelRatio(
  {
    width: 1512,
    height: 600,
    quality: 95,
    format: "webp",
  },
  CDN_IMAGE_RETINA_DPR,
);

export const normalizeProductInfoCardImageUrl = (src?: string | null): string | undefined => {
  const trimmed = src?.trim();
  if (!trimmed) return undefined;
  return rewriteCdnImageUrlTransform(trimmed, PRODUCT_INFO_CARD_CDN_TRANSFORM);
};
