import { cache } from "react";
import type { LogoType, StorefrontLogoResponse, StorefrontLogoSrcMap, StorefrontLogosResponse } from "@/utils/api/cms/cms.interface";
import { getCmsDefaultLogo } from "@/utils/api/cms/cms-default.util";
import { resolveStorefrontLogoSrcMap } from "@/utils/api/cms/cms-logo.util";
import { getStorefrontLogo } from "@/lib/storefront";
import { resolveTenantBranding } from "@/lib/server/resolve-tenant-branding.server";

export const fetchStorefrontLogos = async (_host?: string | null): Promise<StorefrontLogosResponse> => {
  try {
    const fromCacheOrBe = await getStorefrontLogo();
    return fromCacheOrBe ?? {};
  } catch {
    return {};
  }
};

export const fetchStorefrontLogo = async (host?: string | null, type: LogoType = "HEADER"): Promise<StorefrontLogoResponse> => {
  const logos = await fetchStorefrontLogos(host);
  const logo = logos[type];
  if (logo?.logoUrl?.trim()) {
    return logo;
  }

  return getCmsDefaultLogo(null, host);
};

export const fetchStorefrontLogoSrcMap = cache(async (host?: string | null): Promise<StorefrontLogoSrcMap> => {
  const branding = resolveTenantBranding(host);
  const logos = await fetchStorefrontLogos(host);
  return resolveStorefrontLogoSrcMap(logos, branding.logoSrc);
});
