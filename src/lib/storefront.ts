import { BannerApi, CmsApi } from "@/utils/api";
import type {
  PageResponse,
  StorefrontGlobalConfigResponse,
  StorefrontLogosResponse,
  StorefrontNavigationPlpRailParams,
  StorefrontNavigationResponse,
} from "@/utils/api/cms/cms.interface";
import type { BannerPlacement, ProductListBannerStorefrontResponse } from "@/utils/api/banner/banner.interface";

export type {
  StorefrontGlobalConfigResponse,
  StorefrontLogosResponse,
  StorefrontNavigationPlpRailParams,
  StorefrontNavigationResponse,
  PageResponse,
  BannerPlacement,
  ProductListBannerStorefrontResponse,
};

/** Direct mock API access for the graduation-demo storefront. */
export const getStorefrontLogo = (): Promise<StorefrontLogosResponse> => CmsApi.getStorefrontLogos();

export const getGlobalConfig = (): Promise<StorefrontGlobalConfigResponse> => CmsApi.getStorefrontGlobalConfig();

export const getStorefrontNavigation = (): Promise<StorefrontNavigationResponse> => CmsApi.getStorefrontNavigation();

export const getStorefrontNavigationPlpRail = (params: StorefrontNavigationPlpRailParams = {}): Promise<StorefrontNavigationResponse> =>
  CmsApi.getStorefrontNavigationPlpRail(params);

export const getCachedStorefrontPage = (slug: string, _locale = "vi-VN"): Promise<PageResponse> => CmsApi.getStorefrontPageBySlug(slug);

export const getCachedBannerPlacement = (placementCode: string): Promise<BannerPlacement> => BannerApi.getPlacementByCodeApi(placementCode);

export const getCachedProductListBanners = (
  contextSlug?: string | null,
  isCategory = false,
): Promise<ProductListBannerStorefrontResponse> => BannerApi.getProductListBannersApi(contextSlug, isCategory);
