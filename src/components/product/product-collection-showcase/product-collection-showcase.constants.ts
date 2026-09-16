import { rewriteCdnImageUrlTransform, type CdnImageTransform } from "@/utils/cdn/cdn-image.util";
import { CDN_IMAGE_RETINA_DPR, scaleCdnTransformByDevicePixelRatio } from "@/utils/cdn/cdn-image-dpr.util";

export const PRODUCT_COLLECTION_SHOWCASE_CARD_WIDTH = 257;
export const PRODUCT_COLLECTION_SHOWCASE_CARD_HEIGHT = 306;
export const PRODUCT_COLLECTION_SHOWCASE_ASPECT_RATIO = `${PRODUCT_COLLECTION_SHOWCASE_CARD_WIDTH} / ${PRODUCT_COLLECTION_SHOWCASE_CARD_HEIGHT}`;

export const PRODUCT_COLLECTION_SHOWCASE_CDN_TRANSFORM: CdnImageTransform = scaleCdnTransformByDevicePixelRatio(
  {
    width: PRODUCT_COLLECTION_SHOWCASE_CARD_WIDTH,
    height: PRODUCT_COLLECTION_SHOWCASE_CARD_HEIGHT,
    quality: 95,
    format: "webp",
  },
  CDN_IMAGE_RETINA_DPR,
);

export const normalizeProductCollectionShowcaseImageUrl = (src?: string | null): string | undefined => {
  const trimmed = src?.trim();
  if (!trimmed) return undefined;
  return rewriteCdnImageUrlTransform(trimmed, PRODUCT_COLLECTION_SHOWCASE_CDN_TRANSFORM);
};
