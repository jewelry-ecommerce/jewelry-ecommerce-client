import { cache } from "react";
import { ATSH_BROTHERS_CMS_PAGE_SLUG, resolveAtshBrothersData } from "@/app/(layout-main)/atsh/_utils/atsh-brothers-cms.util";
import type { AtshBrothersData } from "@/app/(layout-main)/atsh/_utils/atsh-brothers.interface";
import { fetchStorefrontPageBySlug } from "@/lib/server/storefront-metadata";

export const fetchAtshBrothersData = cache(async (): Promise<AtshBrothersData | null> => {
  const page = await fetchStorefrontPageBySlug(ATSH_BROTHERS_CMS_PAGE_SLUG);
  return resolveAtshBrothersData(page);
});
