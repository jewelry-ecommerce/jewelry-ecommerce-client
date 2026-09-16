import { getCmsDefaults } from "./cms-default";
import type { PageResponse, StorefrontFooterResponse, StorefrontLogoResponse } from "./cms.interface";
import { resolveStorefrontLogoUrl } from "./cms-logo.util";
import { getTenantBrandLogo } from "@/utils/config/tenant-branding.util";

export const getCmsDefaultFooter = (_tenantCode?: string | null, _host?: string | null): StorefrontFooterResponse => {
  return getCmsDefaults().footer as StorefrontFooterResponse;
};

export const getCmsDefaultLogo = (_tenantCode?: string | null, _host?: string | null): StorefrontLogoResponse => {
  return {
    logoUrl: resolveStorefrontLogoUrl(getTenantBrandLogo()),
    logoTargetUrl: "/",
  };
};

/** Fallback trang chủ khi CMS storefront page không tải được. */
export const createEmptyStorefrontHomePageResponse = (_slug: string): PageResponse =>
  (getCmsDefaults() as { homePage: PageResponse }).homePage;
