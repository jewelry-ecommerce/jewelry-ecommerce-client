import type { AtshSpiralCard } from "@/app/(layout-main)/atsh/_components/atsh-spiral-gallery.component";
import {
  ATSH_HEARTLOCK_LOGO,
  ATSH_IMAGE_BASE,
  ATSH_PAGE_PATH,
  ATSH_SPIRAL_CARD_NAV_TARGET,
  type AtshSpiralCardNavTarget,
} from "@/app/(layout-main)/atsh/_constants/atsh.constants";
import { ATSH_SPIRAL_BROTHER_SLUG_ORDER } from "@/app/(layout-main)/atsh/_constants/atsh-spiral.constants";
import type {
  AtshBrotherRecord,
  AtshBrotherResponsiveImage,
  AtshBrothersData,
  AtshCollabLogoItem,
  AtshExploreCta,
  AtshHeroContent,
  AtshSpiralProductsCta,
} from "./atsh-brothers.interface";

/** Kích thước Figma desktop — HEARTLOCK / Anh Trai Say Hi. */
export const ATSH_COLLAB_LOGO_SIZE = {
  heartlock: { width: 232, height: 121 },
  atsh: { width: 240, height: 192 },
} as const;

/** Fallback khi CMS chưa có `meta.sharedAssets.collabLogos`. */
export const ATSH_COLLAB_LOGOS_DEFAULTS: AtshCollabLogoItem[] = [
  {
    id: "heartlock",
    src: ATSH_HEARTLOCK_LOGO,
    alt: "HEARTLOCK",
    width: ATSH_COLLAB_LOGO_SIZE.heartlock.width,
    height: ATSH_COLLAB_LOGO_SIZE.heartlock.height,
  },
  {
    id: "atsh",
    src: `${ATSH_IMAGE_BASE}/atsh-logo.png`,
    alt: "TINH HÀ 'SAY HI'",
    width: ATSH_COLLAB_LOGO_SIZE.atsh.width,
    height: ATSH_COLLAB_LOGO_SIZE.atsh.height,
  },
];

function normalizeCollabLogoItem(raw: unknown): AtshCollabLogoItem | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as Record<string, unknown>;
  const src = typeof item.src === "string" ? item.src.trim() : "";
  const width = typeof item.width === "number" && item.width > 0 ? item.width : NaN;
  const height = typeof item.height === "number" && item.height > 0 ? item.height : NaN;

  if (!src || !Number.isFinite(width) || !Number.isFinite(height)) return null;

  const id = typeof item.id === "string" && item.id.trim() ? item.id.trim() : undefined;
  const alt = typeof item.alt === "string" && item.alt.trim() ? item.alt.trim() : undefined;

  return {
    ...(id ? { id } : {}),
    src,
    ...(alt ? { alt } : {}),
    width,
    height,
  };
}

/**
 * Logo collab hero từ `meta.sharedAssets.collabLogos`.
 * Thứ tự mảng = trái → phải (đổi chỗ phần tử để swap).
 * Fallback: `heartlockLogo` / `atshLogo` string, rồi default local assets.
 */
export function resolveAtshCollabLogos(brothersData: AtshBrothersData): AtshCollabLogoItem[] {
  const assets = brothersData.meta.sharedAssets;
  const fromCms = Array.isArray(assets?.collabLogos)
    ? assets.collabLogos.map(normalizeCollabLogoItem).filter((logo): logo is AtshCollabLogoItem => logo != null)
    : [];

  if (fromCms.length > 0) {
    return fromCms.map((logo) => ({
      ...logo,
      alt: logo.alt || "Logo",
    }));
  }

  const heartlockSrc =
    typeof assets?.heartlockLogo === "string" && assets.heartlockLogo.trim()
      ? assets.heartlockLogo.trim()
      : ATSH_COLLAB_LOGOS_DEFAULTS[0].src;
  const atshSrc =
    typeof assets?.atshLogo === "string" && assets.atshLogo.trim() ? assets.atshLogo.trim() : ATSH_COLLAB_LOGOS_DEFAULTS[1].src;

  return [
    { ...ATSH_COLLAB_LOGOS_DEFAULTS[0], src: heartlockSrc },
    { ...ATSH_COLLAB_LOGOS_DEFAULTS[1], src: atshSrc },
  ];
}

export const ATSH_SPIRAL_PRODUCTS_CTA_DEFAULTS = {
  label: "Xem tất cả sản phẩm",
  href: "/san-pham",
} as const;

export const ATSH_EXPLORE_CTA_DEFAULTS = {
  label: "Khám phá ngay",
  /** Không fallback URL — thiếu href từ CMS thì để rỗng, không tự trỏ spiral. */
  href: "",
} as const;

export function getAtshBrotherBySlug(slug: string, brothersData: AtshBrothersData): AtshBrotherRecord | undefined {
  return brothersData.brothers.find((brother) => brother.slug === slug);
}

/**
 * Resolves the stable key used for spiral slot + image file mapping.
 * Always use this instead of `brother.slug` when looking up spiral order.
 */
export function resolveAtshBrotherSpiralKey(brother: AtshBrotherRecord): string {
  return brother.spiralKey || brother.slug;
}

/**
 * Resolves the collection slug used for catalog API calls.
 * Falls back to spiralKey (then slug) so old CMS records without the field still work.
 */
export function resolveAtshBrotherCollectionSlug(brother: AtshBrotherRecord): string {
  return brother.collectionSlug || resolveAtshBrotherSpiralKey(brother);
}

/**
 * Chuẩn hoá href CMS: path (`/san-pham/...`) giữ nguyên; full URL → chỉ lấy pathname + search + hash.
 */
export function normalizeAtshInternalHref(raw: string | undefined | null): string {
  if (typeof raw !== "string") {
    return "";
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    return `${url.pathname}${url.search}${url.hash}` || "/";
  } catch {
    return trimmed.startsWith("?") ? trimmed : `/${trimmed}`;
  }
}

/**
 * Href CTA card spiral theo `ATSH_SPIRAL_CARD_NAV_TARGET`.
 * - singer → `routes.singerPage`
 * - collection → `routes.collectionPage` (CMS nhập); thiếu thì không gắn link
 */
export function resolveAtshSpiralCardHref(
  brother: AtshBrotherRecord,
  navTarget: AtshSpiralCardNavTarget = ATSH_SPIRAL_CARD_NAV_TARGET,
): string | undefined {
  if (navTarget === "singer") {
    const singerHref = normalizeAtshInternalHref(brother.routes?.singerPage);
    return singerHref || undefined;
  }

  const collectionHref = normalizeAtshInternalHref(brother.routes?.collectionPage);
  return collectionHref || undefined;
}

/**
 * Path redirect khi trang chi tiết singer đang ẩn (mode collection).
 * Ưu tiên `routes.collectionPage`; không có thì về landing ATSH.
 */
export function resolveAtshSingerDetailRedirectHref(brother: AtshBrotherRecord | undefined): string {
  const collectionHref = normalizeAtshInternalHref(brother?.routes.collectionPage);
  return collectionHref || ATSH_PAGE_PATH;
}

/**
 * CTA "Xem tất cả sản phẩm" trên hero + spiral — lấy từ `meta.sharedContent.spiralProductsCta` (CMS).
 */
export function resolveAtshSpiralProductsCta(brothersData: AtshBrothersData): Required<AtshSpiralProductsCta> {
  const cta = brothersData.meta.sharedContent?.spiralProductsCta;
  const label = typeof cta?.label === "string" ? cta.label.trim() : "";
  const href = typeof cta?.href === "string" ? cta.href.trim() : "";

  return {
    label: label || ATSH_SPIRAL_PRODUCTS_CTA_DEFAULTS.label,
    href: href || ATSH_SPIRAL_PRODUCTS_CTA_DEFAULTS.href,
  };
}

/**
 * CTA "Khám phá ngay" trên hero — lấy từ `meta.sharedContent.exploreCta` (CMS).
 * Không có `href` từ API thì để rỗng (không default sang spiral).
 */
export function resolveAtshExploreCta(brothersData: AtshBrothersData): Required<AtshExploreCta> {
  const cta = brothersData.meta.sharedContent?.exploreCta;
  const label = typeof cta?.label === "string" ? cta.label.trim() : "";
  const href = typeof cta?.href === "string" ? cta.href.trim() : "";

  return {
    label: label || ATSH_EXPLORE_CTA_DEFAULTS.label,
    href,
  };
}

/**
 * True khi CTA explore vẫn là scroll in-page tới spiral (hash), không phải điều hướng route khác.
 */
export function isAtshExploreInPageScrollHref(href: string): boolean {
  const normalized = href.trim();
  if (!normalized) return false;
  if (normalized.startsWith("#")) return true;
  return /#24-anh-trai\/?$/i.test(normalized);
}

/**
 * Title + mô tả hero landing — chỉ lấy từ `meta.sharedContent.hero` (CMS).
 * Field nào thiếu / rỗng thì để trống (UI sẽ không render).
 */
export function resolveAtshHeroContent(brothersData: AtshBrothersData): AtshHeroContent {
  const hero = brothersData.meta.sharedContent?.hero;
  const headline = typeof hero?.headline === "string" ? hero.headline.trim() : "";
  const title = typeof hero?.title === "string" ? hero.title.trim() : "";
  const description = typeof hero?.description === "string" ? hero.description.trim() : "";

  return {
    ...(headline ? { headline } : {}),
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
  };
}

export function buildAtshBrotherResponsiveImage(
  primary?: AtshBrotherResponsiveImage,
  fallback?: string | AtshBrotherResponsiveImage,
): AtshBrotherResponsiveImage {
  if (primary) {
    return {
      mobile: primary.mobile,
      tablet: primary.tablet,
      desktop: primary.desktop ?? primary.mobile,
    };
  }

  if (fallback && typeof fallback === "object") {
    return {
      mobile: fallback.mobile,
      tablet: fallback.tablet,
      desktop: fallback.desktop ?? fallback.mobile,
    };
  }

  const src = typeof fallback === "string" ? fallback : "";
  return { mobile: src, tablet: src, desktop: src };
}

export function resolveAtshBrotherSpiralCardSrc(slug: string, brothersData: AtshBrothersData): string {
  const brother = getAtshBrotherBySlug(slug, brothersData);
  return brother?.cardImage?.trim() || "";
}

export function mapAtshBrotherToSpiralCard(
  brother: AtshBrotherRecord,
  brothersData: AtshBrothersData,
  spiralCardSrc?: string,
): AtshSpiralCard {
  return {
    // Ưu tiên URL cardImage người dùng nhập; không fallback ảnh local.
    src: spiralCardSrc ?? brother.cardImage?.trim() ?? resolveAtshBrotherSpiralCardSrc(brother.slug, brothersData),
    alt: brother.images.spiralCard?.alt || brother.displayName,
    href: resolveAtshSpiralCardHref(brother),
  };
}

export function mapAtshBrothersToSpiralCards(brothersData: AtshBrothersData): AtshSpiralCard[] {
  // Build index by spiralKey so the map works even when URL slug changes.
  const brothersBySpiralKey = new Map(brothersData.brothers.map((brother) => [resolveAtshBrotherSpiralKey(brother), brother]));

  return ATSH_SPIRAL_BROTHER_SLUG_ORDER.flatMap((spiralKey) => {
    const brother = brothersBySpiralKey.get(spiralKey);
    if (!brother) {
      return [];
    }

    return [mapAtshBrotherToSpiralCard(brother, brothersData)];
  });
}

/** Spiral cards khi CMS chưa sẵn sàng — ảnh + slug tĩnh, link tới trang singer. */
export function mapAtshSpiralCardsFallback(): AtshSpiralCard[] {
  return ATSH_SPIRAL_BROTHER_SLUG_ORDER.map((slug) => ({
    src: "",
    alt: slug,
    href: `/atsh/singer/${slug}`,
  }));
}
