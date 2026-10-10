import { commonAxios } from "@/utils/axios";
import type { BatchResolveBadgesRequest, ProductBadgesByVariants, SingleProductResolveRequest } from "./badge.interface";
import { getContentApiBaseUrl } from '@/utils/config/content-backend.config';
import { getContentProductBadges } from '../content-backend/content-badge.api';
import { getContentProducts } from '../content-backend/content-products.api';
import { getContentProductDetail } from '../content-backend/content-product-detail.api';
import { ContentHttpError } from '../content-backend/content-backend.api';

export const postListStorefrontProductsBadges = async (body: BatchResolveBadgesRequest): Promise<Record<string, ProductBadgesByVariants>> => {
  if(getContentApiBaseUrl()) return getContentProductBadges(body);
  return (await commonAxios.post("badge/storefront/products/badges", body)).data;
};

export const postStorefrontProductBadges = async (
  productId: string,
  body: SingleProductResolveRequest = {},
): Promise<ProductBadgesByVariants> => {
  if(!getContentApiBaseUrl()) return (await commonAxios.post<ProductBadgesByVariants>(`badge/storefront/products/${productId}/badges`, body)).data;
  let variants=body.variants;
  if(!variants) {
    const products=await getContentProducts({productIds:productId,take:1});
    const card=products.list[0];
    if(!card) throw new ContentHttpError(404,'Không tìm thấy sản phẩm đã xuất bản.');
    const detail=await getContentProductDetail(card.slug);
    variants=detail.variants.map(variant=>({productVariantId:variant.id}));
  }
  const grouped=await getContentProductBadges({products:[{productId,variants}]});
  return grouped[productId]??{productId,variants:[]};
};
