import { rewriteCdnImageUrlTransform, type CdnImageTransform } from "@/utils/cdn/cdn-image.util";
import { CDN_IMAGE_RETINA_DPR, scaleCdnTransformByDevicePixelRatio } from "@/utils/cdn/cdn-image-dpr.util";

export const CATEGORY_SCROLLER_CARD_SIZE = 160;
export const CATEGORY_SCROLLER_ASPECT_RATIO = "1 / 1";

export const CATEGORY_SCROLLER_CDN_TRANSFORM: CdnImageTransform = scaleCdnTransformByDevicePixelRatio(
  {
    width: CATEGORY_SCROLLER_CARD_SIZE,
    height: CATEGORY_SCROLLER_CARD_SIZE,
    quality: 90,
    format: "webp",
  },
  CDN_IMAGE_RETINA_DPR,
);

export const normalizeCategoryScrollerImageUrl = (src?: string | null): string | undefined => {
  const trimmed = src?.trim();
  if (!trimmed) return undefined;
  return rewriteCdnImageUrlTransform(trimmed, CATEGORY_SCROLLER_CDN_TRANSFORM);
};
