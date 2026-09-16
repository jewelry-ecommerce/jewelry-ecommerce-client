export const getTenantBrandName = (): string => process.env.TENANT_BRAND_NAME?.trim() || "Jewelry Ecommerce";

export const getTenantBrandLogo = (): string => process.env.TENANT_BRAND_LOGO?.trim() || "";

/** Ảnh placeholder sản phẩm khi CMS/API không có media. */
export const DEFAULT_PRODUCT_IMAGE_SRC = "/images/product/charm/charm-1.1.png";

/** Chuẩn hóa mã tenant (so khớp override JSON / env). */
export const normalizeTenantCode = (tenantCode: string) => tenantCode.trim().toUpperCase();

/** Subdomain đầu tiên làm mã tenant khi chưa có env: `b2.test.example.com` → `b2`. */
export const resolveTenantCodeFromHost = (host?: string | null): string | null => {
  const hostname = host?.split(":")[0]?.trim().toLowerCase();
  if (!hostname) {
    return null;
  }

  const [subdomain] = hostname.split(".");
  if (!subdomain || subdomain === "www" || subdomain === "localhost") {
    return null;
  }

  return subdomain;
};

/** Segment cuối của tenant code. */
export const getTenantLastSegment = (tenantCode: string): string | null => {
  const segments = tenantCode
    .split(/[-_]/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  return segments[segments.length - 1] ?? null;
};

export const resolveProductDefaultImageSrc = (_tenantCode?: string | null): string => {
  return process.env.TENANT_BRAND_PRODUCT_DEFAULT_IMAGE?.trim() || DEFAULT_PRODUCT_IMAGE_SRC;
};
