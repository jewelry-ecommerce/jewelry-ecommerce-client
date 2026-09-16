import type { Metadata } from "next";

import { ATSH_PAGE_PATH } from "@/app/(layout-main)/atsh/_constants/atsh.constants";
import { ATSH_BROTHERS_SAMPLE_DATA } from "@/app/(layout-main)/atsh/_data/atsh-brothers-static.data";
import { fetchAtshBrothersData } from "@/app/(layout-main)/atsh/_utils/atsh-brothers-fetch.server";
import { resolveAtshLandingSeo, resolveAtshLandingSeoImageUrl } from "@/app/(layout-main)/atsh/_utils/atsh-landing-seo.util";
import { createPageMetadata } from "@/lib/server/storefront-metadata";
import { siteConfig } from "@/utils/config/site";

interface GetAtshLandingPageMetadataOptions {
  /** Path canonical trên metadata. */
  path?: `/${string}`;
}

/**
 * SEO landing BST Collab — title / keywords / description / OG image từ `meta.seo` (CMS JSON / sample).
 */
export async function getAtshLandingPageMetadata(options: GetAtshLandingPageMetadataOptions = {}): Promise<Metadata> {
  const path = options.path ?? ATSH_PAGE_PATH;
  const brothersData = (await fetchAtshBrothersData()) ?? ATSH_BROTHERS_SAMPLE_DATA;
  const seo = resolveAtshLandingSeo(brothersData.meta);
  const imageUrl = resolveAtshLandingSeoImageUrl(seo.imageUrl, siteConfig.url);

  return createPageMetadata({
    path,
    canonicalUrl: `${siteConfig.url}${path}`,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    image: {
      url: imageUrl,
      width: 1200,
      height: 630,
      alt: seo.title,
    },
  });
}
