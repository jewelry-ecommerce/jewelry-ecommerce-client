import { commonAxios } from "@/utils/axios";
import type { BatchResolveBadgesRequest, ProductBadgesByVariants, SingleProductResolveRequest } from "./badge.interface";

export const postListStorefrontProductsBadges = async (body: BatchResolveBadgesRequest): Promise<Record<string, ProductBadgesByVariants>> =>
  (await commonAxios.post("badge/storefront/products/badges", body)).data;

export const postStorefrontProductBadges = async (
  productId: string,
  body: SingleProductResolveRequest = {},
): Promise<ProductBadgesByVariants> =>
  (await commonAxios.post<ProductBadgesByVariants>(`badge/storefront/products/${productId}/badges`, body)).data;
