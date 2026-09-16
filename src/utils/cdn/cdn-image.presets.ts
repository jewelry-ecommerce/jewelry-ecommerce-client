import type { CdnImageTransform } from "./cdn-image.util";
import { clampCdnImageTransformSize } from "./cdn-image.util";
import { CDN_IMAGE_RETINA_DPR, scaleCdnTransformByDevicePixelRatio } from "./cdn-image-dpr.util";

/**
 * Display / design CSS sizes unless noted. Retina sharpness:
 * - CSS-sized marketing presets below are baked at `CDN_IMAGE_RETINA_DPR` then clamped
 * - Product cards prefer measured `scaleCdnTransformByDevicePixelRatio` / builder
 *
 * Large banners may still clamp under CDN max — `CdnImage` falls back to original on 400.
 */
const CDN_IMAGE_PRESET_BASE = {
  /** Product card design 350×440 — use with DPR scale + clamp (fallback). */
  productCard: {
    width: 350,
    height: 440,
    quality: 95,
    format: "webp",
  },
  /** Alias — prefer measured transform; this is CSS baseline ×3 before clamp. */
  productCardRetina: {
    width: 1050,
    height: 1320,
    quality: 95,
    format: "webp",
  },
  /** Variant swatch on product card (display ~24×24). */
  swatch: {
    width: 72,
    height: 72,
    quality: 90,
    format: "webp",
  },
  /** PDP gallery — desktop stack / mobile slider (~50% col, full width) */
  galleryMain: {
    width: 800,
    height: 1006,
    quality: 95,
    format: "webp",
  },
  /** PDP lightbox zoom — higher resolution */
  galleryZoom: {
    width: 1200,
    height: 1509,
    quality: 95,
    format: "webp",
  },
  /** Quà tặng / bao bì đi kèm (display 68×68) */
  giftThumb: {
    width: 136,
    height: 136,
    quality: 90,
    format: "webp",
  },
  /** Giỏ hàng — line item desktop/tablet (display 110×130) */
  cartLineItem: {
    width: 220,
    height: 260,
    quality: 90,
    format: "webp",
  },
  /** Giỏ hàng — line item mobile (display 96×113.45) */
  cartLineItemMobile: {
    width: 192,
    height: 227,
    quality: 90,
    format: "webp",
  },
  /** Mini cart drawer — line item (display 88×100) */
  cartMiniLineItem: {
    width: 176,
    height: 200,
    quality: 90,
    format: "webp",
  },
  /** Giỏ hàng — quà tặng kèm (display 68×88) */
  cartGiftLineItem: {
    width: 136,
    height: 176,
    quality: 90,
    format: "webp",
  },
  /** Dialog nhận thông báo (display 58×58) */
  notifyThumb: {
    width: 116,
    height: 116,
    quality: 90,
    format: "webp",
  },
  /** PDP variant swatch (display 24×24 × retina, within clamp) */
  variantSwatch: {
    width: 72,
    height: 72,
    quality: 90,
    format: "webp",
  },
  /** Home — banner slider full width desktop (1512×804 CSS) */
  bannerFullscreen: {
    width: 1512,
    height: 804,
    quality: 95,
    format: "webp",
  },
  /** Home — banner slider tablet (810×880 CSS) */
  bannerFullscreenTablet: {
    width: 810,
    height: 880,
    quality: 95,
    format: "webp",
  },
  /** Home — banner slider mobile (420×620 CSS) */
  bannerFullscreenMobile: {
    width: 420,
    height: 620,
    quality: 95,
    format: "webp",
  },
  /** Home — double banner campaign desktop (756×804 CSS) */
  bannerSquare: {
    width: 756,
    height: 804,
    quality: 95,
    format: "webp",
  },
  /** Home — double banner campaign tablet (810×880 CSS) */
  bannerSquareTablet: {
    width: 810,
    height: 880,
    quality: 95,
    format: "webp",
  },
  /** Home — double banner campaign mobile (420×620 CSS) */
  bannerSquareMobile: {
    width: 420,
    height: 620,
    quality: 95,
    format: "webp",
  },
  /** Home — hero grid cell (378×378 CSS) */
  bannerHeroGrid: {
    width: 378,
    height: 378,
    quality: 95,
    format: "webp",
  },
  /** Home — IMAGE_GALLERY tile (365×400 CSS) */
  galleryTile: {
    width: 365,
    height: 400,
    quality: 95,
    format: "webp",
  },
  /** Home — INFO_CARDS / trust strips (full-bleed width, landscape-friendly) */
  infoCard: {
    width: 1512,
    height: 600,
    quality: 95,
    format: "webp",
  },
  /** Category nav scroller (160×160 CSS) */
  categoryNav: {
    width: 160,
    height: 160,
    quality: 90,
    format: "webp",
  },
  /** Product collection showcase card (257×306 CSS) */
  productCollectionShowcase: {
    width: 257,
    height: 306,
    quality: 95,
    format: "webp",
  },
  /** Product listing grid banner desktop (756×1129 CSS) */
  productListBanner: {
    width: 756,
    height: 1129,
    quality: 95,
    format: "webp",
  },
  /** Product listing grid banner tablet (810×880 CSS) */
  productListBannerTablet: {
    width: 810,
    height: 880,
    quality: 95,
    format: "webp",
  },
  /** Product listing grid banner mobile (420×420 CSS) */
  productListBannerMobile: {
    width: 420,
    height: 420,
    quality: 95,
    format: "webp",
  },
  /** Product card bottom full-width badge (display ~350×40) */
  productBadgeBottomFull: {
    width: 350,
    height: 40,
    quality: 90,
    format: "webp",
  },
} as const satisfies Record<string, CdnImageTransform>;

/** CSS design sizes that must be requested at retina DPR when used via `preset=` alone. */
const RETINA_CSS_PRESET_KEYS = new Set<keyof typeof CDN_IMAGE_PRESET_BASE>([
  "galleryMain",
  "bannerFullscreen",
  "bannerFullscreenTablet",
  "bannerFullscreenMobile",
  "bannerSquare",
  "bannerSquareTablet",
  "bannerSquareMobile",
  "bannerHeroGrid",
  "galleryTile",
  "infoCard",
  "categoryNav",
  "productCollectionShowcase",
  "productListBanner",
  "productListBannerTablet",
  "productListBannerMobile",
  "productBadgeBottomFull",
]);

/** Presets clamped for CDN — safe to pass straight into `resolveCdnImageUrl`. */
export const CDN_IMAGE_PRESETS = Object.fromEntries(
  Object.entries(CDN_IMAGE_PRESET_BASE).map(([key, transform]) => {
    const presetKey = key as keyof typeof CDN_IMAGE_PRESET_BASE;
    const sized = RETINA_CSS_PRESET_KEYS.has(presetKey)
      ? scaleCdnTransformByDevicePixelRatio(transform, CDN_IMAGE_RETINA_DPR)
      : clampCdnImageTransformSize(transform);
    return [key, sized];
  }),
) as { [K in keyof typeof CDN_IMAGE_PRESET_BASE]: CdnImageTransform };
