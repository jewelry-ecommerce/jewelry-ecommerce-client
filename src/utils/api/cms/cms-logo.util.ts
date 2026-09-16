import type { LogoType, StorefrontLogoResponse, StorefrontLogoSrcMap } from "./cms.interface";

export const DEFAULT_FAVICON_SRC = "/logo-seo.png";
export const DEFAULT_STOREFRONT_LOGO_SRC = "/image/logo/logo.svg";

export function resolveStorefrontLogoUrl(logoUrl: string | null | undefined, fallback: string = DEFAULT_STOREFRONT_LOGO_SRC): string {
  const normalized = logoUrl?.trim();
  if (normalized) return normalized;

  const normalizedFallback = fallback.trim();
  if (normalizedFallback) return normalizedFallback;

  return DEFAULT_STOREFRONT_LOGO_SRC;
}

/** Gộp URL từng type; chỗ thiếu CMS thì FOOTER/AUTH → HEADER, FAVICON → file tĩnh. */
export const resolveStorefrontLogoSrcMap = (
  byType: Partial<Record<LogoType, string | StorefrontLogoResponse | null>>,
  headerFallback: string,
): StorefrontLogoSrcMap => {
  const extractUrl = (item: string | StorefrontLogoResponse | null | undefined): string | undefined => {
    if (!item) return undefined;
    if (typeof item === "string") return item;
    return item.logoUrl ?? undefined;
  };

  const header = resolveStorefrontLogoUrl(extractUrl(byType.HEADER), headerFallback);

  return {
    HEADER: header,
    FOOTER: resolveStorefrontLogoUrl(extractUrl(byType.FOOTER), header),
    AUTH: resolveStorefrontLogoUrl(extractUrl(byType.AUTH), header),
    FAVICON: resolveStorefrontLogoUrl(extractUrl(byType.FAVICON), DEFAULT_FAVICON_SRC),
  };
};
