import { getCmsDefaults } from "@/utils/api/cms/cms-default";
import type { PageResponse } from "@/utils/api/cms/cms.interface";
import { STOREFRONT_NAVIGATION_ITEMS } from "@/utils/config/storefront-navigation.config";

// Empty shell only; blocks are read from the shared CMS store after admin publishes.
export const getMockStorefrontPage = (slug: string): PageResponse | null => {
  if (!["trang-chu", "home", "san-pham"].includes(slug)) return null;
  const defaults = getCmsDefaults("Jewelry Ecommerce").homePage as PageResponse;
  return { ...defaults, page: { ...defaults.page, slug }, blocks: [] };
};
export const getMockStorefrontNavigation = () => ({ items: STOREFRONT_NAVIGATION_ITEMS });
export const getMockStorefrontGlobalConfig = () => ({ header: null, footer: getCmsDefaults("Jewelry Ecommerce").footer });
export const getMockStorefrontLogos = () => ({
  HEADER: { logoUrl: "/images/logo/header-logo.svg", logoTargetUrl: "/" },
  FOOTER: { logoUrl: "/images/logo/footer-logo.svg", logoTargetUrl: "/" },
  AUTH: { logoUrl: "/images/logo/login-logo.svg", logoTargetUrl: "/" },
  FAVICON: { logoUrl: "/images/logo/favicon.png", logoTargetUrl: "/" },
});
