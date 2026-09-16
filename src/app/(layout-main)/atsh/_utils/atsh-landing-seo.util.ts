import type { AtshBrothersMeta } from "./atsh-brothers.interface";

/** SEO landing BST Collab — lấy từ `meta.seo` trong JSON CMS / atsh-brothers.json. */
export interface AtshLandingSeo {
  title?: string;
  keywords?: string;
  /** Meta description trong giai gian Pre-order (trước `preOrderEndsAt`). */
  descriptionPreOrder?: string;
  /** Meta description từ `preOrderEndsAt` trở đi. */
  descriptionAfterPreOrder?: string;
  /**
   * Mốc kết thúc Pre-order (ISO 8601).
   * VD. `2026-09-05T00:00:00+07:00` = 00:00 ngày 05/09/2026 (VN).
   */
  preOrderEndsAt?: string;
  /** Ảnh OG/Twitter khi share — absolute URL hoặc path `/image/...`. */
  imageUrl?: string;
}

export interface AtshLandingSeoResolved {
  title: string;
  keywords: string;
  description: string;
  imageUrl: string;
  preOrderEndsAt: string | null;
  isPreOrderPeriod: boolean;
}

export const ATSH_LANDING_SEO_DEFAULTS: Readonly<{
  title: string;
  keywords: string;
  descriptionPreOrder: string;
  descriptionAfterPreOrder: string;
  preOrderEndsAt: string;
  imageUrl: string;
}> = {
  title: 'HEARTLOCKxTinh Hà "Say Hi" | BST Trang Sức Độc Quyền',
  keywords:
    "heartlock tinh hà say hi tinh hà say hi bộ sưu tập tinh hà say hi trang sức tinh hà say hi bộ sưu tập trang sức collab pre order heartlock tinh hà say hi preorder heartlock tinh hà say hi đặt hàng trước bst tinh hà say hi",
  descriptionPreOrder:
    'Khám phá bộ sưu tập trang sức collab độc quyền HEARTLOCK x Tinh Hà "Say Hi", với các thiết kế mang dấu ấn riêng của 24 Anh Trai. Mở bán Pre-Order từ 17.08.2026.',
  descriptionAfterPreOrder:
    'Khám phá bộ sưu tập trang sức collab độc quyền HEARTLOCK x Tinh Hà "Say Hi", sở hữu ngay các thiết kế mang dấu ấn riêng của 24 Anh Trai.',
  preOrderEndsAt: "2026-09-05T00:00:00+07:00",
  /** Fallback local — BE/CMS nên ghi đè bằng CDN URL trong `meta.seo.imageUrl`. */
  imageUrl: "/image/atsh/hero-bg-desktop-1.png",
};

function readSeoString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeAtshLandingSeo(raw: unknown): AtshLandingSeo | undefined {
  if (!raw || typeof raw !== "object") return undefined;

  const record = raw as Record<string, unknown>;
  const title = readSeoString(record.title);
  const keywords = readSeoString(record.keywords);
  const descriptionPreOrder = readSeoString(record.descriptionPreOrder);
  const descriptionAfterPreOrder = readSeoString(record.descriptionAfterPreOrder);
  const preOrderEndsAt = readSeoString(record.preOrderEndsAt);
  const imageUrl = readSeoString(record.imageUrl);

  if (!title && !keywords && !descriptionPreOrder && !descriptionAfterPreOrder && !preOrderEndsAt && !imageUrl) {
    return undefined;
  }

  return {
    ...(title ? { title } : {}),
    ...(keywords ? { keywords } : {}),
    ...(descriptionPreOrder ? { descriptionPreOrder } : {}),
    ...(descriptionAfterPreOrder ? { descriptionAfterPreOrder } : {}),
    ...(preOrderEndsAt ? { preOrderEndsAt } : {}),
    ...(imageUrl ? { imageUrl } : {}),
  };
}

/**
 * Trước `preOrderEndsAt` → description Pre-order; từ mốc đó trở đi → description after.
 * Parse ISO fail / thiếu mốc → coi như đã hết Pre-order (dùng after).
 */
export function isAtshPreOrderPeriod(preOrderEndsAt: string | null | undefined, now: Date = new Date()): boolean {
  const raw = typeof preOrderEndsAt === "string" ? preOrderEndsAt.trim() : "";
  if (!raw) return false;

  const endsAt = new Date(raw);
  if (Number.isNaN(endsAt.getTime())) return false;

  return now.getTime() < endsAt.getTime();
}

export function resolveAtshLandingSeoDescription(
  seo: AtshLandingSeo | undefined,
  now: Date = new Date(),
): { description: string; isPreOrderPeriod: boolean; preOrderEndsAt: string | null } {
  const preOrderEndsAt = readSeoString(seo?.preOrderEndsAt) || ATSH_LANDING_SEO_DEFAULTS.preOrderEndsAt;
  const isPreOrderPeriod = isAtshPreOrderPeriod(preOrderEndsAt, now);

  const descriptionPreOrder = readSeoString(seo?.descriptionPreOrder) || ATSH_LANDING_SEO_DEFAULTS.descriptionPreOrder;
  const descriptionAfterPreOrder = readSeoString(seo?.descriptionAfterPreOrder) || ATSH_LANDING_SEO_DEFAULTS.descriptionAfterPreOrder;

  return {
    description: isPreOrderPeriod ? descriptionPreOrder : descriptionAfterPreOrder,
    isPreOrderPeriod,
    preOrderEndsAt,
  };
}

/** Absolute URL cho OG/Twitter — nhận CDN full URL hoặc path site. */
export function resolveAtshLandingSeoImageUrl(imageUrl: string | undefined, siteUrl: string): string {
  const raw = readSeoString(imageUrl) || ATSH_LANDING_SEO_DEFAULTS.imageUrl;
  if (/^https?:\/\//i.test(raw)) return raw;

  const base = siteUrl.replace(/\/$/, "");
  return `${base}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

export function resolveAtshLandingSeo(meta: AtshBrothersMeta | undefined | null, now: Date = new Date()): AtshLandingSeoResolved {
  const seo = meta?.seo;
  const { description, isPreOrderPeriod, preOrderEndsAt } = resolveAtshLandingSeoDescription(seo, now);

  return {
    title: readSeoString(seo?.title) || ATSH_LANDING_SEO_DEFAULTS.title,
    keywords: readSeoString(seo?.keywords) || ATSH_LANDING_SEO_DEFAULTS.keywords,
    description,
    imageUrl: readSeoString(seo?.imageUrl) || ATSH_LANDING_SEO_DEFAULTS.imageUrl,
    preOrderEndsAt,
    isPreOrderPeriod,
  };
}
