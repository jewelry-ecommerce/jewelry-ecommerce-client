import { rewriteCdnImageUrlTransform, type CdnImageTransform } from "@/utils/cdn/cdn-image.util";
import { CDN_IMAGE_RETINA_DPR, scaleCdnTransformByDevicePixelRatio } from "@/utils/cdn/cdn-image-dpr.util";
import type { StorefrontBreakpoint } from "@/hooks/use-storefront-breakpoint.hook";

export const PRODUCT_GRID_BANNER_ASPECT_RATIO = {
  desktop: "756 / 1129",
  tablet: "810 / 880",
  mobile: "420 /420",
} as const;

const PRODUCT_GRID_BANNER_CSS_TRANSFORMS: Record<StorefrontBreakpoint, CdnImageTransform> = {
  desktop: { width: 756, height: 1129, quality: 95, format: "webp" },
  tablet: { width: 810, height: 880, quality: 95, format: "webp" },
  mobile: { width: 420, height: 420, quality: 95, format: "webp" },
};

const PRODUCT_GRID_BANNER_CDN_TRANSFORMS: Record<StorefrontBreakpoint, CdnImageTransform> = {
  desktop: scaleCdnTransformByDevicePixelRatio(PRODUCT_GRID_BANNER_CSS_TRANSFORMS.desktop, CDN_IMAGE_RETINA_DPR),
  tablet: scaleCdnTransformByDevicePixelRatio(PRODUCT_GRID_BANNER_CSS_TRANSFORMS.tablet, CDN_IMAGE_RETINA_DPR),
  mobile: scaleCdnTransformByDevicePixelRatio(PRODUCT_GRID_BANNER_CSS_TRANSFORMS.mobile, CDN_IMAGE_RETINA_DPR),
};

export const normalizeProductGridBannerImageUrl = (
  src: string | null | undefined,
  breakpoint: StorefrontBreakpoint,
): string | undefined => {
  const trimmed = src?.trim();
  if (!trimmed) return undefined;
  return rewriteCdnImageUrlTransform(trimmed, PRODUCT_GRID_BANNER_CDN_TRANSFORMS[breakpoint]);
};
