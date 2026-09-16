import {
  BadgePosition,
  type BadgePositionCode,
  type ProductBadgesByVariants,
  type ResolvedBadge,
  type StorefrontProductInput,
} from "./badge.interface";

const BATCH_PRODUCT_LIMIT = 100;

export const PRODUCT_CARD_BADGE_POSITIONS = [
  BadgePosition.TOP_LEFT,
  BadgePosition.TOP_RIGHT,
  BadgePosition.CENTER_LEFT,
  BadgePosition.CENTER_RIGHT,
  BadgePosition.BOTTOM_LEFT,
  BadgePosition.BOTTOM_RIGHT,
  BadgePosition.BOTTOM_CENTER,
  BadgePosition.PRICE_LINE,
] as const;

export type ProductCardBadgePosition = (typeof PRODUCT_CARD_BADGE_POSITIONS)[number];

const SUPPORTED_PRODUCT_CARD_POSITIONS = new Set<BadgePositionCode>(PRODUCT_CARD_BADGE_POSITIONS);

export const isProductBadgeBottomCenter = (position: ProductCardBadgePosition): boolean => position === BadgePosition.BOTTOM_CENTER;

export type ProductBadgeView = {
  type: string;
  text?: string;
  imageUrl?: string;
  position: ProductCardBadgePosition;
  style?: ResolvedBadge["styleConfig"];
};

/** Input tối thiểu để build batch badge (tránh import vòng product-item). */
export type BadgeBatchProductSource = {
  id: string;
  stockStatus?: string;
  variants?: Array<{ variationId?: string; selected?: boolean; stockStatus?: string; stock?: number }>;
  defaultVariationId?: string | null;
};

type BadgeBatchVariantSource = NonNullable<BadgeBatchProductSource["variants"]>[number];

const resolveVariantStockQuantity = (variant?: BadgeBatchVariantSource, productStockStatus?: string): number | undefined => {
  if (typeof variant?.stock === "number" && Number.isFinite(variant.stock)) {
    return variant.stock;
  }

  const stockStatus = variant?.stockStatus ?? productStockStatus;
  if (stockStatus === "IN_STOCK") return 1;
  if (stockStatus === "OUT_OF_STOCK") return 0;
  return undefined;
};

/** Variant mặc định trên thẻ SP (PLP / carousel) — khớp defaultVariationId catalog. */
export const resolveProductCardVariantId = (
  variants?: BadgeBatchProductSource["variants"],
  defaultVariationId?: string | null,
): string | undefined => {
  const defaultId = defaultVariationId?.trim();
  const selectedId = variants?.find((v) => v.selected)?.variationId?.trim();
  const firstId = variants?.map((v) => v.variationId?.trim()).find(Boolean);
  return selectedId || firstId || defaultId;
};

/** Gửi mọi SKU visualSwitch — đổi swatch vẫn có badge theo variant. */
export const buildStorefrontBadgeProducts = (items: BadgeBatchProductSource[]): StorefrontProductInput[] => {
  const result: StorefrontProductInput[] = [];

  for (const item of items) {
    let variants = (item.variants ?? [])
      .filter((v) => v.variationId?.trim())
      .map((v) => ({
        productVariantId: v.variationId!.trim(),
        stockQuantity: resolveVariantStockQuantity(v, item.stockStatus),
      }));

    if (variants.length === 0 && item.defaultVariationId?.trim()) {
      variants = [
        {
          productVariantId: item.defaultVariationId.trim(),
          stockQuantity: resolveVariantStockQuantity(undefined, item.stockStatus),
        },
      ];
    }

    if (variants.length === 0) continue;
    result.push({ productId: item.id, variants });
  }

  return result.slice(0, BATCH_PRODUCT_LIMIT);
};

export const chunkStorefrontBadgeProducts = (products: StorefrontProductInput[]): StorefrontProductInput[][] => {
  const chunks: StorefrontProductInput[][] = [];
  for (let i = 0; i < products.length; i += BATCH_PRODUCT_LIMIT) {
    chunks.push(products.slice(i, i + BATCH_PRODUCT_LIMIT));
  }
  return chunks;
};

const resolveVariantBadges = (payload: ProductBadgesByVariants | undefined, productVariantId?: string): ResolvedBadge[] => {
  if (!payload) return [];

  if (productVariantId) {
    const variantEntry = payload.variants?.find((v) => v.productVariantId === productVariantId);
    if (variantEntry) return variantEntry.badges ?? [];
  }

  if (payload.badges?.length) return payload.badges;

  return [];
};

const normalizeProductCardPosition = (position: BadgePositionCode | null | undefined): ProductCardBadgePosition | undefined => {
  if (!position || !SUPPORTED_PRODUCT_CARD_POSITIONS.has(position)) return undefined;
  return position as ProductCardBadgePosition;
};

const toProductBadgeView = (badge: ResolvedBadge): ProductBadgeView | null => {
  const position = normalizeProductCardPosition(badge.position);
  if (!position) return null;

  const style = badge.styleConfig;
  const type = (badge.type || "TEXT").toUpperCase();

  if (type === "IMAGE") {
    const imageUrl = (badge.image || badge.imageMobile || badge.icon || badge.iconMobile || "").trim();
    if (!imageUrl) return null;
    return { type: "IMAGE", imageUrl, position, style };
  }

  const text = (badge.dynamicText || badge.displayText || badge.name || "").trim();
  if (!text) return null;

  return { type: "TEXT", text, position, style };
};

/** Tất cả badge hiển thị được trên thẻ sản phẩm (theo variant đang chọn). */
export const pickProductBadgesForCard = (payload: ProductBadgesByVariants | undefined, productVariantId?: string): ProductBadgeView[] => {
  const views: ProductBadgeView[] = [];

  for (const badge of resolveVariantBadges(payload, productVariantId)) {
    const view = toProductBadgeView(badge);
    if (view) views.push(view);
  }

  return views;
};
