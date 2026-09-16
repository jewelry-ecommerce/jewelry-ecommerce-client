export enum BadgePosition {
  TOP_LEFT = "TOP_LEFT",
  TOP_CENTER = "TOP_CENTER",
  TOP_RIGHT = "TOP_RIGHT",
  CENTER_LEFT = "CENTER_LEFT",
  CENTER_RIGHT = "CENTER_RIGHT",
  BOTTOM_LEFT = "BOTTOM_LEFT",
  BOTTOM_CENTER = "BOTTOM_CENTER",
  BOTTOM_RIGHT = "BOTTOM_RIGHT",
  PRICE_LINE = "PRICE_LINE",
}

export type BadgePositionCode = `${BadgePosition}`;

export interface StorefrontVariantInput {
  productVariantId: string;
  skuCode?: string;
  stockQuantity?: number;
}

export interface StorefrontProductInput {
  productId: string;
  variants: StorefrontVariantInput[];
}

export interface BatchResolveBadgesRequest {
  products: StorefrontProductInput[];
}

export interface ResolvedBadge {
  badgeTemplateId: string;
  code: string;
  name: string;
  type: string;
  position: BadgePositionCode | null;
  displayText: string | null;
  dynamicText: string | null;
  styleConfig?: Record<string, unknown>;
  icon?: string | null;
  iconMobile?: string | null;
  image?: string | null;
  imageMobile?: string | null;
  priorityWeight?: number;
  isPinned?: boolean;
}

export interface VariantResolvedBadges {
  productVariantId: string;
  skuCode: string | null;
  badges: ResolvedBadge[];
}

export interface ProductBadgesByVariants {
  productId: string;
  variants: VariantResolvedBadges[];
  badges?: ResolvedBadge[];
}

export interface SingleProductResolveRequest {
  variants?: StorefrontVariantInput[];
}
