import { commonAxios } from "@/utils/axios";
import { STOREFRONT_NAVIGATION_ITEMS } from "@/utils/config/storefront-navigation.config";
import {
  PageResponse,
  StorefrontFooterResponse,
  StorefrontGlobalConfigResponse,
  LogoType,
  StorefrontLogoResponse,
  StorefrontLogosResponse,
  StorefrontNavigationPlpRailParams,
  StorefrontNavigationResponse,
  StorefrontSitemapResponse,
  TopBannerResponse,
} from "./cms.interface";

const fetchOrDefault = async <T>(request: () => Promise<T>, fallback: () => T): Promise<T> => {
  try {
    return await request();
  } catch {
    return fallback();
  }
};

const compactQueryParams = (params: StorefrontNavigationPlpRailParams) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => typeof value === "string" && value.trim()));

export const getStorefrontPageBySlug = async (slug: string): Promise<PageResponse> =>
  (await commonAxios.get<PageResponse>(`cms/storefront/pages/${slug}`)).data;

export const getStorefrontSitemapPages = async (locale = "vi-VN"): Promise<StorefrontSitemapResponse> =>
  (await commonAxios.get<StorefrontSitemapResponse>("cms/storefront/pages", { params: { locale } })).data;

export const getStorefrontGlobalConfig = async (): Promise<StorefrontGlobalConfigResponse> =>
  (await commonAxios.get<StorefrontGlobalConfigResponse>("cms/storefront/global-config")).data;

export const getStorefrontTopBanner = async (): Promise<TopBannerResponse | null> => {
  const config = await getStorefrontGlobalConfig();
  return config.header ?? null;
};

export const getStorefrontLogos = async (): Promise<StorefrontLogosResponse> =>
  (await commonAxios.get<StorefrontLogosResponse>("cms/storefront/logo/v2")).data;

export const getStorefrontLogo = async (type: LogoType = "HEADER"): Promise<StorefrontLogoResponse> => {
  const logos = await getStorefrontLogos();
  const logo = logos[type];
  if (!logo?.logoUrl?.trim()) throw new Error(`Storefront ${type} logo is missing`);
  return logo;
};

export const getStorefrontFooter = async (): Promise<StorefrontFooterResponse> => {
  const config = await getStorefrontGlobalConfig();
  if (!config.footer) throw new Error("Storefront footer is missing");
  return config.footer;
};

export const getStorefrontNavigation = async (): Promise<StorefrontNavigationResponse> =>
  fetchOrDefault(
    async () => (await commonAxios.get<StorefrontNavigationResponse>("cms/storefront/navigation")).data,
    () => ({ items: STOREFRONT_NAVIGATION_ITEMS }),
  );

export const getStorefrontNavigationPlpRail = async (
  params: StorefrontNavigationPlpRailParams = {},
): Promise<StorefrontNavigationResponse> =>
  fetchOrDefault(
    async () =>
      (
        await commonAxios.get<StorefrontNavigationResponse>("cms/storefront/navigation/plp-rail", {
          params: compactQueryParams(params),
        })
      ).data,
    () => ({ items: STOREFRONT_NAVIGATION_ITEMS }),
  );
