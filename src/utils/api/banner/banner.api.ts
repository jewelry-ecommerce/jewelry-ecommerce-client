import { commonAxios } from "@/utils/axios";
import { isJavaBackend } from '@/utils/config/java-backend.config';
import { getContentApiBaseUrl } from "@/utils/config/content-backend.config";
import { getContentBanner } from "../content-backend/content-backend.api";
import { BannerPlacement, ProductListBannerStorefrontResponse } from "./banner.interface";

export const getPlacementByCodeApi = async (code: string): Promise<BannerPlacement> =>
  getContentApiBaseUrl() ? getContentBanner(code) : (await commonAxios.get<BannerPlacement>(`banner/storefront/placements/code/${code}/render`)).data;

export const getProductListBannersApi = async (
  contextSlug?: string | null,
  isCategory = false,
): Promise<ProductListBannerStorefrontResponse> => {
  const normalizedSlug = contextSlug?.trim();
  if (isJavaBackend()) {
    const conditionType = isCategory ? 'CATEGORY' : 'CMS_STOREFRONT';
    if (!normalizedSlug) return { contextSlug: null, source: 'NONE', banners: [] };
    const response = await commonAxios.get<{ banners: ProductListBannerStorefrontResponse['banners'] } | null>('storefront/banner/product-list', {
      params: { conditionType, targetSlug: normalizedSlug },
    });
    return { contextSlug: normalizedSlug, source: response.data ? conditionType : 'NONE',
      banners: response.data?.banners.map(banner => ({ ...banner, conditionType, targetSlug: normalizedSlug })) ?? [] };
  }
  const path = normalizedSlug
    ? `banner/storefront/product/list/${isCategory ? "categorySlug/" : ""}${encodeURIComponent(normalizedSlug)}`
    : "banner/storefront/product/list";

  return (await commonAxios.get<ProductListBannerStorefrontResponse>(path)).data;
};
