"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import type { ProductFilterSection } from "@/components";
import { CatalogSortType } from "@/utils/api/product/product.enum";
import { getFiltersByProduct, getSearch } from "@/utils/api/product/product.api";
import { PAGE_TAKE_DEFAULT } from "@/utils/constants/page-take.constant";
import type { IProductFiltersResponse } from "@/utils/api/product/product.interface";
import { mapFilterSections } from "@/utils/product.mapper.util";
import { normalizeCatalogSearchQuery } from "@/utils/search/catalog-search-query.util";

const LEGACY_SORT_MAP: Record<string, CatalogSortType> = {
  "price-asc": CatalogSortType.PRICE_ASC,
  "price-desc": CatalogSortType.PRICE_DESC,
  newest: CatalogSortType.NEWEST,
  name: CatalogSortType.NAME,
  "name-desc": CatalogSortType.NAME_DESC,
  "best-selling": CatalogSortType.BEST_SELLING,
};

const resolveCatalogSortType = (sortValue: string): CatalogSortType | undefined => {
  if (!sortValue) {
    return undefined;
  }

  if ((Object.values(CatalogSortType) as string[]).includes(sortValue)) {
    return sortValue as CatalogSortType;
  }

  return LEGACY_SORT_MAP[sortValue];
};

const mapFilterSectionsToAttributes = (sections: ProductFilterSection[]): string | undefined => {
  const selectedOptionIds = sections
    .flatMap((section) => section.options || [])
    .filter((option) => option.checked)
    .map((option) => option.id)
    .filter(Boolean);

  if (!selectedOptionIds.length) {
    return undefined;
  }

  return Array.from(new Set(selectedOptionIds)).join(",");
};

export const useSearchQueryFromParams = () => {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("query")?.trim() || "";
  const currentQuery = useMemo(() => normalizeCatalogSearchQuery(rawQuery), [rawQuery]);

  return {
    rawQuery,
    currentQuery,
  };
};

export const useSearchFilters = (query: string) => {
  const { data, isLoading } = useSWR(
    query ? ["search-filters", query] : null,
    async () =>
      (await getFiltersByProduct({
        search: query,
      })) as IProductFiltersResponse,
    {
      shouldRetryOnError: false,
    },
  );

  const mappedFilterSections = useMemo(() => mapFilterSections(data || []), [data]);

  return {
    filterSections: mappedFilterSections,
    isLoading,
  };
};

export const useSearchProducts = (
  take: number,
  sortValue: string,
  filterSections: ProductFilterSection[],
  enabled: boolean,
  currentQuery: string,
) => {
  const searchParams = useSearchParams();
  const parsedPage = Number.parseInt(searchParams.get("page") || "", 10);
  const parsedTake = Number.parseInt(searchParams.get("take") || "", 10);
  const currentPage = Number.isNaN(parsedPage) || parsedPage < 1 ? PAGE_TAKE_DEFAULT.page : parsedPage;
  const currentTake = Number.isNaN(parsedTake) || parsedTake < 1 ? take : parsedTake;

  const selectedSort = useMemo(() => resolveCatalogSortType(sortValue), [sortValue]);
  const selectedAttributes = useMemo(() => mapFilterSectionsToAttributes(filterSections), [filterSections]);

  const { data, isLoading } = useSWR(
    enabled && currentQuery ? ["search-products", currentQuery, currentPage, currentTake, selectedSort, selectedAttributes] : null,
    () =>
      getSearch({
        page: currentPage,
        take: currentTake,
        isPagination: true,
        search: currentQuery,
        sort: selectedSort,
        attributes: selectedAttributes,
      }),
  );

  return {
    productsData: data,
    isLoading,
    currentPage,
    currentTake,
  };
};
