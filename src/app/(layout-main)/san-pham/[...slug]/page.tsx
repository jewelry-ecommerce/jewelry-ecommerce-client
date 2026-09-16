import type { Metadata } from "next";
import { headers } from "next/headers";
import React, { Suspense } from "react";
import { getProductPageMetadata, getStorefrontPageMetadata, getSharedSeoImage } from "@/lib/server/storefront-metadata";
import { resolveTenantBranding } from "@/lib/server/resolve-tenant-branding.server";
import { fetchProductListingInitialData } from "@/lib/server/product-listing-fetch.server";
import ProductDetailApp from "@/app/(layout-main)/san-pham/_components/product-detail/product-detail.app";
import ViewProducts from "@/app/(layout-main)/san-pham/_components/product.app";
import { fetchProductBySlug } from "@/lib/server/product-fetch.server";
import { resolvePublicSiteUrl } from "@/lib/server/public-site-url";
import { buildProductJsonLd, serializeJsonLd } from "@/lib/seo/product-json-ld";
import type { ProductSortOption } from "@/components";
import { SORT_OPTIONS } from "@/utils/api/filter.mock";
import {
  LISTING_BANNER_CONFIGS,
  LISTING_BREADCRUMB_ITEMS,
  buildListingShowcaseItems,
} from "@/app/(layout-main)/san-pham/_constants/listing-page-defaults";
import { hasProductListFacetSearchParamsFromRecord } from "@/app/(layout-main)/san-pham/_utils/product-list-search-params.server";
import { siteConfig } from "@/utils/config/site";

type SanPhamCatchAllPageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

// Single-segment path can be a product slug. Multi-segment is always a category chain.
const tryResolveProduct = async (segments: string[]) => {
  if (segments.length !== 1) {
    return null;
  }

  return fetchProductBySlug(segments[0]);
};

export async function generateMetadata({ params, searchParams }: SanPhamCatchAllPageProps): Promise<Metadata> {
  const host = (await headers()).get("host");
  const { slug } = await params;
  const segments = slug ?? [];
  const joinedPath = segments.join("/");
  const listingPath = `/san-pham/${joinedPath}` as `/${string}`;

  const product = await tryResolveProduct(segments);
  if (product) {
    const [productSlug] = segments;
    return getProductPageMetadata({
      slug: productSlug,
      path: `/san-pham/${productSlug}`,
      defaults: {
        title: `${productSlug} | ${siteConfig.name}`,
        description: `Khám phá chi tiết sản phẩm và thông tin nổi bật tại ${siteConfig.name}.`,
        keywords: `chi tiết sản phẩm, trang sức, ${siteConfig.name}`,
        image: getSharedSeoImage(host),
      },
    });
  }

  const resolvedSearchParams = await searchParams;
  const hasListingFacets = hasProductListFacetSearchParamsFromRecord(resolvedSearchParams);

  return getStorefrontPageMetadata({
    slug: "san-pham",
    path: listingPath,
    canonicalUrl: hasListingFacets ? listingPath : undefined,
    defaults: {
      title: `Bộ sưu tập trang sức | ${siteConfig.name}`,
      description: `Khám phá bộ sưu tập trang sức ${siteConfig.name} với nhiều thiết kế tinh tế cho phong cách hằng ngày và quà tặng.`,
      keywords: `trang sức, bộ sưu tập trang sức, ${siteConfig.name}`,
      image: getSharedSeoImage(host),
    },
  });
}

export default async function SanPhamCatchAllPage({ params, searchParams }: SanPhamCatchAllPageProps) {
  const host = (await headers()).get("host");
  const { productDefaultSrc } = resolveTenantBranding(host);
  const { slug } = await params;
  const segments = slug ?? [];

  const product = await tryResolveProduct(segments);
  if (product) {
    const productJsonLd = buildProductJsonLd({ product, siteUrl: resolvePublicSiteUrl() });

    return (
      <React.Fragment>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(productJsonLd),
          }}
        />
        <ProductDetailApp slug={segments[0]} initialData={product} />
      </React.Fragment>
    );
  }
  const pathname = `/san-pham/${segments.join("/")}`;
  const defaultSortValue = SORT_OPTIONS[0]?.value || "";
  const initialData = await fetchProductListingInitialData({
    cmsPageSlug: "san-pham",
    pageBasePath: "/san-pham",
    pathname,
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
