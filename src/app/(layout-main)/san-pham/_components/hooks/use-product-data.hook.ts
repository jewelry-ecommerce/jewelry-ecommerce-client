import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import useSWR from "swr";
import type { ProductFilterSection } from "@/components";
import { ProductApi } from "@/utils/api";
import { getProductsSkuCardV2 } from "@/utils/api/product/product.api";
import { PAGE_TAKE_DEFAULT, resolveProductListTakeFromSearchParams } from "@/utils/constants/page-take.constant";
import type { IParamsGetProducts, IProductFiltersResponse, IProductSkuCardResponse } from "@/utils/api/product/product.interface";
import { mapFilterSections } from "@/utils/product.mapper.util";
import { extractScopedCategoryPathSlugs, extractScopedCategorySlug } from "../../_utils/product-page-route.utils";
import {
  areProductListParamsEqual,
  buildProductListParams,
  buildProductListSWRKey,
  parseProductListFilterValues,
  parseProductListPriceRange,
  parseProductListSortValue,
  resolveProductFilterCategoryParams,
  resolveProductListPriceParams,
  serializeProductListFilterValues,
} from "../../_utils/product-list-query.utils";

export const useProductData = (
  cmsListDefaults?: IParamsGetProducts | null,
  basePath?: string | null,
  initialProductsData?: IProductSkuCardResponse | null,
  initialFilters?: IProductFiltersResponse | null,
  initialProductParams?: IParamsGetProducts | null,
  defaultSortValue = "",
) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const parsedPage = Number.parseInt(searchParams.get("page") || "", 10);
  const currentPage = Number.isNaN(parsedPage) || parsedPage < 1 ? PAGE_TAKE_DEFAULT.page : parsedPage;
  const currentTake = resolveProductListTakeFromSearchParams(searchParams);
  const currentSlug = useMemo(() => extractScopedCategorySlug(pathname, basePath), [basePath, pathname]);
  const currentPathSlugs = useMemo(() => extractScopedCategoryPathSlugs(pathname, basePath), [basePath, pathname]);

  const resolvedCategorySlug = currentSlug || cmsListDefaults?.categorySlug;
  const resolvedCategorySlugs = resolvedCategorySlug ? undefined : cmsListDefaults?.categorySlugs;
  const resolvedCollectionSlug = resolvedCategorySlug || resolvedCategorySlugs ? undefined : cmsListDefaults?.collectionSlug;
  const filterCategoryParams = useMemo(() => resolveProductFilterCategoryParams(currentSlug), [currentSlug]);
  const defaultSort = cmsListDefaults?.sort || defaultSortValue;
  const sortValue = useMemo(() => parseProductListSortValue(searchParams, defaultSort), [defaultSort, searchParams]);
  const filterValues = useMemo(() => parseProductListFilterValues(searchParams), [searchParams]);
  const selectedAttributes = useMemo(() => serializeProductListFilterValues(filterValues), [filterValues]);
  const priceRange = useMemo(() => parseProductListPriceRange(searchParams), [searchParams]);
  const priceParams = useMemo(() => resolveProductListPriceParams(priceRange), [priceRange]);

  const productParams = useMemo(
    () =>
      buildProductListParams({
        page: currentPage,
        take: currentTake,
        categorySlug: resolvedCategorySlug,
        categorySlugs: resolvedCategorySlugs,
        collectionSlug: resolvedCollectionSlug,
        sortValue,
        defaultSort: cmsListDefaults?.sort,
        attributes: selectedAttributes,
        minPrice: priceParams.minPrice,
        maxPrice: priceParams.maxPrice,
        contract: "sku-card-v2",
      }),
    [
      cmsListDefaults?.collectionSlug,
      cmsListDefaults?.sort,
      currentPage,
      currentTake,
      resolvedCategorySlug,
      resolvedCategorySlugs,
      resolvedCollectionSlug,
      selectedAttributes,
      sortValue,
      priceParams.maxPrice,
      priceParams.minPrice,
    ],
  );
  const canUseInitialProducts = areProductListParamsEqual(productParams, initialProductParams);
  const canUseInitialFilters = (filterCategoryParams.categorySlug || undefined) === (initialProductParams?.categorySlug || undefined);

  const { data, isLoading } = useSWR(buildProductListSWRKey(productParams), () => getProductsSkuCardV2(productParams), {
    fallbackData: canUseInitialProducts ? (initialProductsData ?? undefined) : undefined,
    revalidateOnMount: canUseInitialProducts && initialProductsData ? false : undefined,
    shouldRetryOnError: false,
  });

  const { data: filters } = useSWR(
    ["product-filters", filterCategoryParams.categorySlug],
    async () => (await ProductApi.getFiltersByProduct(filterCategoryParams)) as IProductFiltersResponse,
    {
      fallbackData: canUseInitialFilters ? (initialFilters ?? undefined) : undefined,
      revalidateOnMount: canUseInitialFilters && initialFilters ? false : undefined,
      shouldRetryOnError: false,
    },
  );
  const mappedFilterSections = useMemo(() => mapFilterSections(filters || []), [filters]);

  return {
    productsData: data,
    isLoading,
    apiFilterSections: mappedFilterSections,
    filters,
    currentPage,
    currentTake,
    currentSlug,
    currentPathSlugs,
    sortValue,
    filterValues,
  };
};

export const useProductDataByFilter = (
  sortValue: string,
  filterSections: ProductFilterSection[],
  enabled: boolean,
  basePath?: string | null,
  fallbackCategorySlug?: string | null,
  fallbackCategorySlugs?: string | null,
  fallbackCollectionSlug?: string | null,
) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const parsedPage = Number.parseInt(searchParams.get("page") || "", 10);
  const currentPage = Number.isNaN(parsedPage) || parsedPage < 1 ? PAGE_TAKE_DEFAULT.page : parsedPage;
  const currentTake = resolveProductListTakeFromSearchParams(searchParams);
  const currentSlug = useMemo(() => extractScopedCategorySlug(pathname, basePath), [basePath, pathname]);

  const selectedAttributes = useMemo(() => {
    const selectedOptionIds = filterSections
      .flatMap((section) => section.options || [])
      .filter((option) => option.checked)
      .map((option) => option.id)
      .filter(Boolean);

    if (!selectedOptionIds.length) return undefined;

    return Array.from(new Set(selectedOptionIds)).join(",");
  }, [filterSections]);
  const priceRange = useMemo(() => parseProductListPriceRange(searchParams), [searchParams]);
  const priceParams = useMemo(() => resolveProductListPriceParams(priceRange), [priceRange]);
  const resolvedCategorySlug = currentSlug || fallbackCategorySlug;
  const resolvedCategorySlugs = resolvedCategorySlug ? undefined : fallbackCategorySlugs;
  const resolvedCollectionSlug = resolvedCategorySlug || resolvedCategorySlugs ? undefined : fallbackCollectionSlug;

  const { data, isLoading } = useSWR(
    enabled
      ? [
          "products",
          "filter-preview",
          currentPage,
          currentTake,
          resolvedCategorySlug,
          resolvedCategorySlugs,
          resolvedCollectionSlug,
          sortValue,
          selectedAttributes,
          priceParams.minPrice,
          priceParams.maxPrice,
          "sku-card-v2",
        ]
      : null,
    () =>
      getProductsSkuCardV2(
        buildProductListParams({
          page: currentPage,
          take: currentTake,
          categorySlug: resolvedCategorySlug,
          categorySlugs: resolvedCategorySlugs,
          collectionSlug: resolvedCollectionSlug,
          sortValue,
          attributes: selectedAttributes,
          minPrice: priceParams.minPrice,
          maxPrice: priceParams.maxPrice,
          contract: "sku-card-v2",
        }),
      ),
    {
      dedupingInterval: 300,
    },
  );

  return {
    productsDataByFilter: data,
    isLoadingFilter: isLoading,
    currentPage,
    currentTake,
    currentSlug,
  };
};
