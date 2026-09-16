/** Chỉ các API storefront — 404 mới chuyển sang trang 404. */
export const isStorefrontApiUrl = (url?: string): boolean => {
  if (!url) return false;
  const path = url.split("?")[0];
  return path.includes("cms/storefront/");
};

/**
 * CMS global (logo, footer,...) có fallback `cms-default.json` — 404 không đá sang /404.
 * Top banner/header là optional — 404 thì ẩn section.
 * ATSH landing có fallback `atsh-brothers.json` — 404 vẫn render `/bst-collab-tinhhasayhi`.
 * Các trang CMS theo slug khác vẫn redirect 404 khi page không tồn tại.
 */
const STOREFRONT_CMS_OPTIONAL_OR_FALLBACK = [
  "cms/storefront/global-config",
  "cms/storefront/footer",
  "cms/storefront/logo/v2",
  "cms/storefront/banner",
  "cms/storefront/badge",
  "cms/storefront/navigation",
  "cms/storefront/header",
  "cms/storefront/pages/atsh",
] as const;

export const shouldRedirectStorefront404To404Page = (url?: string): boolean => {
  if (!url || !isStorefrontApiUrl(url)) return false;

  const path = url.split("?")[0];
  if (STOREFRONT_CMS_OPTIONAL_OR_FALLBACK.some((segment) => path.includes(segment))) {
    return false;
  }

  return true;
};
