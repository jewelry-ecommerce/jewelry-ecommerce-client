import { rewriteCdnImageUrlTransform, type CdnImageTransform } from "@/utils/cdn/cdn-image.util";
import { CDN_IMAGE_RETINA_DPR, scaleCdnTransformByDevicePixelRatio } from "@/utils/cdn/cdn-image-dpr.util";
import type { StorefrontBreakpoint } from "@/hooks/use-storefront-breakpoint.hook";

export const BANNER_COLLECTION_ASPECT_RATIO = {
  desktop: "1512 / 804",
  tablet: "810 / 880",
  mobile: "420 / 620",
} as const;

const BANNER_COLLECTION_CSS_TRANSFORMS: Record<StorefrontBreakpoint, CdnImageTransform> = {
  desktop: { width: 1512, height: 804, quality: 95, format: "webp" },
  tablet: { width: 810, height: 880, quality: 95, format: "webp" },
  mobile: { width: 420, height: 620, quality: 95, format: "webp" },
};

const BANNER_COLLECTION_CDN_TRANSFORMS: Record<StorefrontBreakpoint, CdnImageTransform> = {
  desktop: scaleCdnTransformByDevicePixelRatio(BANNER_COLLECTION_CSS_TRANSFORMS.desktop, CDN_IMAGE_RETINA_DPR),
  tablet: scaleCdnTransformByDevicePixelRatio(BANNER_COLLECTION_CSS_TRANSFORMS.tablet, CDN_IMAGE_RETINA_DPR),
  mobile: scaleCdnTransformByDevicePixelRatio(BANNER_COLLECTION_CSS_TRANSFORMS.mobile, CDN_IMAGE_RETINA_DPR),
};

export const normalizeBannerCollectionImageUrl = (src: string | null | undefined, breakpoint: StorefrontBreakpoint): string | undefined => {
  const trimmed = src?.trim();
  if (!trimmed) return undefined;
  return rewriteCdnImageUrlTransform(trimmed, BANNER_COLLECTION_CDN_TRANSFORMS[breakpoint]);
};
