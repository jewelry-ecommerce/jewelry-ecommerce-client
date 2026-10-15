import { BadgePosition, type BatchResolveBadgesRequest, type ResolvedBadge } from "../badge/badge.interface";

export interface JavaSkuBadges {
  skuId: string | number;
  badges: Array<{
    id: string | number; code: string; name: string; type: string; defaultPosition: string | null;
    displayText: string | null; styleConfig?: Record<string, unknown>; icon?: string | null;
    image?: string | null; iconMobile?:string|null;imageMobile?:string|null; defaultPriorityWeight: number;
  }>;
}

export function javaBadgeRow(row: JavaSkuBadges, request: BatchResolveBadgesRequest) {
  const product = request.products.find(candidate => candidate.variants.some(variant => variant.productVariantId === String(row.skuId)));
  const variant = product?.variants.find(candidate => candidate.productVariantId === String(row.skuId));
  if (!product || !variant) return null;
  const badges: ResolvedBadge[] = row.badges.map(badge => ({
    badgeTemplateId: String(badge.id), code: badge.code, name: badge.name, type: badge.type,
    position: Object.values(BadgePosition).find(position => position === badge.defaultPosition) ?? null,
    displayText: badge.displayText, dynamicText: null, styleConfig: badge.styleConfig,
    icon: badge.icon, image: badge.image, iconMobile:badge.iconMobile,imageMobile:badge.imageMobile,priorityWeight: badge.defaultPriorityWeight
  }));
  return { productId: product.productId, productVariantId: String(row.skuId), skuCode: variant.skuCode ?? null, badges };
}
