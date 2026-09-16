import {
  getTenantBrandLogo,
  getTenantBrandName,
  resolveProductDefaultImageSrc,
  resolveTenantCodeFromHost,
} from "@/utils/config/tenant-branding.util";

export type ResolvedTenantBranding = {
  logoSrc: string;
  brandName: string;
  productDefaultSrc: string;
  tenantCode: string | null;
};

export const resolveTenantBranding = (host?: string | null): ResolvedTenantBranding => {
  const tenantCode = process.env.TENANT_CODE?.trim() || resolveTenantCodeFromHost(host) || null;
  const brandName = getTenantBrandName();
  const logoSrc = getTenantBrandLogo();
  const productDefaultSrc = resolveProductDefaultImageSrc();

  return {
    logoSrc,
    brandName,
    productDefaultSrc,
    tenantCode,
  };
};
