import type { BatchResolveBadgesRequest, ProductBadgesByVariants, ResolvedBadge } from '../badge/badge.interface';
import { requestContentBackend } from './content-backend.api';
import { isJavaBackend } from '@/utils/config/java-backend.config';
import { javaBadgeRow, type JavaSkuBadges } from './java-badge.mapper';
type WireBadge=Omit<ResolvedBadge,'badgeTemplateId'> & {badgeTemplateId:number};
interface WireSkuBadges {productId:number;productVariantId:number;skuCode:string;badges:WireBadge[]}
const BADGE_REQUEST_POLICY={maximumSkus:100} as const;
export async function getContentProductBadges(body:BatchResolveBadgesRequest):Promise<Record<string,ProductBadgesByVariants>> {
  const ids=[...new Set(body.products.flatMap(product=>product.variants.map(variant=>variant.productVariantId)))];
  if(!ids.length) return {};
  const grouped:Record<string,ProductBadgesByVariants>={};
  for(let offset=0;offset<ids.length;offset+=BADGE_REQUEST_POLICY.maximumSkus) {
    const params=new URLSearchParams({skuIds:ids.slice(offset,offset+BADGE_REQUEST_POLICY.maximumSkus).join(',')});
    const rows = isJavaBackend()
      ? (await requestContentBackend<JavaSkuBadges[]>('storefront/badge?' + params)).map(row => javaBadgeRow(row, body)).filter(row => row !== null)
      : await requestContentBackend<WireSkuBadges[]>('storefront/badge?' + params);
    for(const row of rows) {
      const productId=String(row.productId);
      const product=grouped[productId]??{productId,variants:[]};
      product.variants.push({productVariantId:String(row.productVariantId),skuCode:row.skuCode,
        badges:row.badges.map(badge=>({...badge,badgeTemplateId:String(badge.badgeTemplateId)}))});
      grouped[productId]=product;
    }
  }
  return grouped;
}
