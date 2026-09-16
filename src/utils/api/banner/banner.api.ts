import { commonAxios } from "@/utils/axios";
import { BannerPlacement, ProductListBannerStorefrontResponse } from "./banner.interface";

export const getPlacementByCodeApi = async (code: string): Promise<BannerPlacement> =>
  (await commonAxios.get<BannerPlacement>(`banner/storefront/placements/code/${code}/render`)).data;

export const getProductListBannersApi = async (
  contextSlug?: string | null,
  isCategory = false,
): Promise<ProductListBannerStorefrontResponse> => {
  const normalizedSlug = contextSlug?.trim();
  const path = normalizedSlug
    ? `banner/storefront/product/list/${isCategory ? "categorySlug/" : ""}${encodeURIComponent(normalizedSlug)}`
    : "banner/storefront/product/list";

  return (await commonAxios.get<ProductListBannerStorefrontResponse>(path)).data;
};
