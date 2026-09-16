import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { fetchStorefrontSitemapPages } from "@/lib/server/cms-sitemap.server";
import type { CanonicalPath } from "@/lib/seo/canonical-url";
import { normalizeCanonicalUrl } from "@/lib/seo/canonical-url";
import { fetchApiJson } from "@/lib/server/storefront-metadata";
import { resolvePublicSiteUrl } from "@/lib/server/public-site-url";
import type { ApiProduct, IProductsResponse } from "@/utils/api/product/product.interface";

export const revalidate = 3600;

const PRODUCT_PAGE_SIZE = 100;
// Hard cap để tránh loop vô hạn nếu API trả pagination sai (đề phòng).
const PRODUCT_MAX_PAGES = 500;

const normalizeCmsSlug = (slug: string) => slug.replace(/^\/+/, "").trim();

const buildCmsSitemapUrl = (slug: string, siteUrl: string, canonicalUrl?: string | null) =>
  normalizeCanonicalUrl(canonicalUrl, `/${normalizeCmsSlug(slug)}` as CanonicalPath, siteUrl);

const cmsPagePriority = (slug: string): number => {
  if (slug === "trang-chu") return 1;
  if (slug === "san-pham") return 0.9;
  return 0.6;
};

const dedupeSitemapEntries = (entries: MetadataRoute.Sitemap) => Array.from(new Map(entries.map((entry) => [entry.url, entry])).values());

const buildSitemapProductsPath = (page: number) =>
  `catalog/products?page=${page}&take=${PRODUCT_PAGE_SIZE}&orderBy=updatedAt&orderType=DESC`;

const fetchSitemapProductPage = async (page: number): Promise<IProductsResponse | null> => {
  try {
    return await fetchApiJson<IProductsResponse>(buildSitemapProductsPath(page));
  } catch (error) {
    console.error("fetchSitemapProductPage error", error);
    return {
      list: [],
      total: 0,
      pagination: {
        total: 0,
        currentPage: 0,
        nextPage: false,
        previousPage: false,
        hasNextPage: false,
        hasPreviousPage: false,
        totalPage: 0,
      },
    };
  }
};

const resolveSitemapProductTotalPages = (firstPage: IProductsResponse): number => {
  const totalPage = firstPage.pagination?.totalPage;
  if (totalPage && totalPage > 0) {
    return Math.min(totalPage, PRODUCT_MAX_PAGES);
  }

  const total = firstPage.total ?? 0;
  if (total > 0) {
    return Math.min(Math.ceil(total / PRODUCT_PAGE_SIZE), PRODUCT_MAX_PAGES);
  }

  return 1;
};

const fetchSitemapProductsPaginated = async (): Promise<ApiProduct[]> => {
  const firstPage = await fetchSitemapProductPage(1);
  if (!firstPage) return [];

  const firstList = firstPage.list ?? [];
  if (firstList.length === 0) return [];

  const totalPages = resolveSitemapProductTotalPages(firstPage);
  if (totalPages <= 1) return firstList;

  const remainingPages = Array.from({ length: totalPages - 1 }, (_, index) => index + 2);
  const remainingResponses = await Promise.all(remainingPages.map(fetchSitemapProductPage));

  return [...firstList, ...remainingResponses.flatMap((response) => response?.list ?? [])];
};

const fetchSitemapCmsPages = async () => {
  try {
    return await fetchStorefrontSitemapPages();
  } catch (error) {
    return [];
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

  const siteUrl = resolvePublicSiteUrl();
  const now = new Date();

  const [cmsPageList, productList] = await Promise.all([fetchSitemapCmsPages(), fetchSitemapProductsPaginated()]);

  const cmsPages: MetadataRoute.Sitemap = cmsPageList
    .filter((page) => normalizeCmsSlug(page.slug).length > 0)
    .map((page) => {
      const slug = normalizeCmsSlug(page.slug);
      return {
        url: buildCmsSitemapUrl(slug, siteUrl, page.canonicalUrl),
        lastModified: page.updatedAt ? new Date(page.updatedAt) : now,
        changeFrequency: slug === "san-pham" ? ("daily" as const) : ("weekly" as const),
        priority: cmsPagePriority(slug),
      };
    });

  const productPages: MetadataRoute.Sitemap = productList.map((p) => ({
    url: `${siteUrl}/san-pham/${p.productSlug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return dedupeSitemapEntries([...cmsPages, ...productPages]);
}
