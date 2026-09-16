import type { Metadata } from "next";
import { getStorefrontPageMetadata, sharedSeoImage } from "@/lib/server/storefront-metadata";
import { siteConfig } from "@/utils/config/site";
import { Suspense } from "react";
import SearchResultsApp from "./_components/search-results.app";
import { SORT_OPTIONS } from "@/utils/api/filter.mock";
import type { ProductSortOption } from "@/components";

const SEARCH_PAGE_TAKE = 40;

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getStorefrontPageMetadata({
    slug: "tim-kiem",
    path: "/tim-kiem",
    defaults: {
      title: `Tìm kiếm | ${siteConfig.name}`,
      description: `Tìm kiếm nhanh sản phẩm, bộ sưu tập và gợi ý phù hợp với nhu cầu mua sắm tại ${siteConfig.name}.`,
      keywords: `tìm kiếm sản phẩm, ${siteConfig.name}, trang sức`,
      image: sharedSeoImage,
    },
  });
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResultsApp
        take={SEARCH_PAGE_TAKE}
        sortOptions={SORT_OPTIONS as ProductSortOption[]}
        defaultSortValue={SORT_OPTIONS[0]?.value || ""}
      />
    </Suspense>
  );
}
