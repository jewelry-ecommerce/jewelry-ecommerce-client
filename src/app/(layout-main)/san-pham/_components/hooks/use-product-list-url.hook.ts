"use client";

import type { ProductFilterSection } from "@/components";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  buildProductListUrl,
  DEFAULT_PRODUCT_PRICE_RANGE,
  mapFilterSectionsToFilterValues,
  parseProductListFilterValues,
  parseProductListPriceRange,
  parseProductListSortValue,
  type ProductPriceRange,
} from "../../_utils/product-list-query.utils";

export function useProductListUrl(defaultSort: string, defaultTake: number) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const sortValue = useMemo(() => parseProductListSortValue(searchParams, defaultSort), [defaultSort, searchParams]);
  const filterValues = useMemo(() => parseProductListFilterValues(searchParams), [searchParams]);
  const priceRange = useMemo(() => parseProductListPriceRange(searchParams), [searchParams]);

  const replaceListQuery = useCallback(
    (updates: {
      page?: number;
      take?: number;
      sort?: string | null;
      filterValues?: string[] | null;
      priceRange?: ProductPriceRange | null;
    }) => {
      const nextUrl = buildProductListUrl({
        pathname,
        searchParams,
        defaultSort,
        defaultTake,
        ...updates,
      });

      router.replace(nextUrl, { scroll: false });
    },
    [defaultSort, defaultTake, pathname, router, searchParams],
  );

  const applyFilters = useCallback(
    (sections: ProductFilterSection[]) => {
      replaceListQuery({
        filterValues: mapFilterSectionsToFilterValues(sections),
        page: 1,
      });
    },
    [replaceListQuery],
  );

  const applyPriceRange = useCallback(
    (nextPriceRange: ProductPriceRange) => {
      replaceListQuery({
        priceRange: nextPriceRange,
        page: 1,
      });
    },
    [replaceListQuery],
  );

  const applySort = useCallback(
    (sort: string) => {
      replaceListQuery({ sort, page: 1 });
    },
    [replaceListQuery],
  );

  const clearFilters = useCallback(() => {
    replaceListQuery({ filterValues: [], priceRange: DEFAULT_PRODUCT_PRICE_RANGE, page: 1 });
  }, [replaceListQuery]);

  return {
    sortValue,
    filterValues,
    priceRange,
    applyFilters,
    applyPriceRange,
    applySort,
    clearFilters,
  };
}
