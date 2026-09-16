import { resolvePublicSiteUrl } from "@/lib/server/public-site-url";
import { getTenantBrandName } from "@/utils/config/tenant-branding.util";

const siteUrl = resolvePublicSiteUrl();

export const siteConfig = {
  get name(): string {
    return getTenantBrandName();
  },
  domain: new URL(siteUrl).hostname,
  url: siteUrl,
};
