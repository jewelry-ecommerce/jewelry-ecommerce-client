import { rewriteCdnImageUrlTransform, type CdnImageTransform } from "@/utils/cdn/cdn-image.util";
import { CDN_IMAGE_RETINA_DPR, scaleCdnTransformByDevicePixelRatio } from "@/utils/cdn/cdn-image-dpr.util";

export const PRODUCT_GALLERY_TILE_WIDTH = 365;
export const PRODUCT_GALLERY_TILE_HEIGHT = 400;
export const PRODUCT_GALLERY_TILE_ASPECT_RATIO = `${PRODUCT_GALLERY_TILE_WIDTH} / ${PRODUCT_GALLERY_TILE_HEIGHT}`;

export const PRODUCT_GALLERY_TILE_CDN_TRANSFORM: CdnImageTransform = scaleCdnTransformByDevicePixelRatio(
  {
    width: PRODUCT_GALLERY_TILE_WIDTH,
    height: PRODUCT_GALLERY_TILE_HEIGHT,
    quality: 95,
    format: "webp",
  },
  CDN_IMAGE_RETINA_DPR,
);

export const normalizeProductGalleryImageUrl = (src?: string | null): string | undefined => {
  const trimmed = src?.trim();
  if (!trimmed) return undefined;
  return rewriteCdnImageUrlTransform(trimmed, PRODUCT_GALLERY_TILE_CDN_TRANSFORM);
};
