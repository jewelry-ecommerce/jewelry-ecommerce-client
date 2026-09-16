import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStorefrontPageMetadata, getSharedSeoImage } from "@/lib/server/storefront-metadata";
import { resolveTenantBranding } from "@/lib/server/resolve-tenant-branding.server";
import { fetchProductListingInitialData } from "@/lib/server/product-listing-fetch.server";
import { hasProductListFacetSearchParamsFromRecord } from "@/app/(layout-main)/san-pham/_utils/product-list-search-params.server";
import ViewProducts from "@/app/(layout-main)/san-pham/_components/product.app";
import type { ProductSortOption } from "@/components";
import { SORT_OPTIONS } from "@/utils/api/filter.mock";
import { Suspense } from "react";
import {
  LISTING_BANNER_CONFIGS,
  LISTING_BREADCRUMB_ITEMS,
  buildListingShowcaseItems,
} from "@/app/(layout-main)/san-pham/_constants/listing-page-defaults";
import { siteConfig } from "@/utils/config/site";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const host = (await headers()).get("host");
  const resolvedSearchParams = await searchParams;
  const hasListingFacets = hasProductListFacetSearchParamsFromRecord(resolvedSearchParams);

  return getStorefrontPageMetadata({
    slug: "san-pham",
    path: "/san-pham",
    canonicalUrl: hasListingFacets ? "/san-pham" : undefined,
    defaults: {
      title: `Bộ sưu tập trang sức | ${siteConfig.name}`,
      description: `Khám phá bộ sưu tập trang sức ${siteConfig.name} với nhiều thiết kế tinh tế cho phong cách hằng ngày và quà tặng.`,
      keywords: `trang sức, bộ sưu tập trang sức, ${siteConfig.name}`,
      image: getSharedSeoImage(host),
    },
  });
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const host = (await headers()).get("host");
  const { productDefaultSrc } = resolveTenantBranding(host);
  const defaultSortValue = SORT_OPTIONS[0]?.value || "";
  const initialData = await fetchProductListingInitialData({
    cmsPageSlug: "san-pham",
    pageBasePath: "/san-pham",
    pathname: "/san-pham",
    defaultSortValue,
    searchParams: await searchParams,
  });

  return (
    <Suspense fallback={null}>
      <ViewProducts
        breadcrumbItems={LISTING_BREADCRUMB_ITEMS}
        bannerConfigs={LISTING_BANNER_CONFIGS}
        showcaseItems={buildListingShowcaseItems(productDefaultSrc)}
        sortOptions={SORT_OPTIONS as ProductSortOption[]}
        defaultSortValue={defaultSortValue}
        initialData={initialData}
      />
    </Suspense>
  );
}
