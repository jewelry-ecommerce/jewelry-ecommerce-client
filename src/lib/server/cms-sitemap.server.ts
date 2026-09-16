import { cache } from "react";
import type { StorefrontSitemapPage } from "@/utils/api/cms";
import { getStorefrontSitemapPages } from "@/utils/api/cms/cms.api";
import { getApiBeUrl } from "@/utils/config/common";
import { configureDevSelfSignedTls } from "./tls";

export const CMS_SITEMAP_LOCALE = "vi-VN";

const normalizeSlug = (slug: string) => slug.replace(/^\/+/, "").trim();

export const fetchStorefrontSitemapPages = cache(async (locale = CMS_SITEMAP_LOCALE): Promise<StorefrontSitemapPage[]> => {
  configureDevSelfSignedTls();

  if (!getApiBeUrl()) {
    console.warn(`[SEO] Missing API_BE_URL while generating CMS sitemap for locale "${locale}".`);
    return [];
  }

  try {
    const data = await getStorefrontSitemapPages(locale);
    return (data.pages ?? []).map((page) => ({
      ...page,
      slug: normalizeSlug(page.slug),
    }));
  } catch (error) {
    console.error(`[SEO] Failed to fetch CMS sitemap pages for locale "${locale}".`, error);
    return [];
  }
});
