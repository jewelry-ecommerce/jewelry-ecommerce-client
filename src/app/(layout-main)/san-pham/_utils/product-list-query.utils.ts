import type { ProductFilterSection } from "@/components";
import { CatalogSortType } from "@/utils/api/product/product.enum";
import type { IParamsGetProductFilters, IParamsGetProducts } from "@/utils/api/product/product.interface";
import { PAGE_TAKE_DEFAULT } from "@/utils/constants/page-take.constant";
import {
  DEFAULT_PRODUCT_PRICE_RANGE,
  isDefaultProductPriceRange,
  PRODUCT_PRICE_FILTER_MAX,
  PRODUCT_PRICE_FILTER_MIN,
  type ProductPriceRange,
} from "@/utils/constants/product-price-filter.constant";

/** Query key cho sắp xếp — giá trị khớp `CatalogSortType`, bỏ khỏi URL khi là mặc định. */
export const PRODUCT_LIST_SORT_SEARCH_PARAM = "sort";

/** Query key cho bộ lọc — danh sách mã thuộc tính, phân tách bằng dấu phẩy. */
export const PRODUCT_LIST_FILTER_SEARCH_PARAM = "filter";

/** Query key cho lọc giá. */
export const PRODUCT_LIST_MIN_PRICE_SEARCH_PARAM = "minPrice";
export const PRODUCT_LIST_MAX_PRICE_SEARCH_PARAM = "maxPrice";

const LEGACY_SORT_MAP: Record<string, CatalogSortType> = {
  "price-asc": CatalogSortType.PRICE_ASC,
  "price-desc": CatalogSortType.PRICE_DESC,
  newest: CatalogSortType.NEWEST,
  name: CatalogSortType.NAME,
  "name-desc": CatalogSortType.NAME_DESC,
  "best-selling": CatalogSortType.BEST_SELLING,
};

export interface SearchParamsReader {
  get: (key: string) => string | null;
  getAll?: (key: string) => string[];
}

const normalizeProductListFilterValues = (values: string[]): string[] =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort();

type ProductListQueryInput = {
  page: number;
  take: number;
  categorySlug?: string | null;
  categorySlugs?: string | null;
  collectionSlug?: string | null;
  sortValue?: string;
  defaultSort?: string;
  attributes?: string;
  minPrice?: number;
  maxPrice?: number;
  contract?: "sku-card-v2";
};

type BuildProductListUrlInput = {
  pathname: string;
  searchParams: SearchParamsReader;
  defaultSort: string;
  defaultTake: number;
  page?: number;
  take?: number;
  sort?: string | null;
  filterValues?: string[] | null;
  priceRange?: ProductPriceRange | null;
};

const clampProductPrice = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const parseProductPriceParam = (value: string | null, fallback: number): number => {
  const parsed = Number.parseInt(value || "", 10);
  if (Number.isNaN(parsed)) return fallback;
  return clampProductPrice(parsed, PRODUCT_PRICE_FILTER_MIN, PRODUCT_PRICE_FILTER_MAX);
};

export const parseProductListPriceRange = (searchParams: SearchParamsReader): ProductPriceRange => {
  const minPrice = parseProductPriceParam(searchParams.get(PRODUCT_LIST_MIN_PRICE_SEARCH_PARAM), PRODUCT_PRICE_FILTER_MIN);
  const maxPrice = parseProductPriceParam(searchParams.get(PRODUCT_LIST_MAX_PRICE_SEARCH_PARAM), PRODUCT_PRICE_FILTER_MAX);
  const normalizedMin = Math.min(minPrice, maxPrice);
  const normalizedMax = Math.max(minPrice, maxPrice);
  return [normalizedMin, normalizedMax];
};

export const resolveProductListPriceParams = (priceRange: ProductPriceRange): Pick<IParamsGetProducts, "minPrice" | "maxPrice"> => {
  if (isDefaultProductPriceRange(priceRange)) {
    return {};
  }

  return {
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
  };
};

/** Filter API chỉ scope theo category trên URL, không dùng CMS categorySlugs. */
export const resolveProductFilterCategoryParams = (categorySlugFromUrl?: string | null): IParamsGetProductFilters => ({
  categorySlug: categorySlugFromUrl || undefined,
});

export const resolveProductListSort = (sortValue?: string): CatalogSortType | undefined => {
  if (!sortValue) return undefined;

  if ((Object.values(CatalogSortType) as string[]).includes(sortValue)) {
    return sortValue as CatalogSortType;
  }

  return LEGACY_SORT_MAP[sortValue];
};

const parsePositivePage = (value: string | null): number => {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isNaN(parsed) || parsed < 1 ? PAGE_TAKE_DEFAULT.page : parsed;
};

const parsePositiveTake = (value: string | null, fallback: number): number => {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

export const parseProductListFilterValues = (searchParams: SearchParamsReader): string[] => {
  const repeatedValues = searchParams.getAll?.(PRODUCT_LIST_FILTER_SEARCH_PARAM) ?? [];
  if (repeatedValues.length > 1) {
    return normalizeProductListFilterValues(repeatedValues);
  }

  const raw =
    repeatedValues[0] ?? searchParams.get(PRODUCT_LIST_FILTER_SEARCH_PARAM) ?? searchParams.get("attributes") ?? searchParams.get("loc");
  if (!raw?.trim()) return [];

  return normalizeProductListFilterValues(raw.split(","));
};

/** Chuỗi gửi API — vẫn dùng dấu phẩy, không ảnh hưởng URL. */
export const serializeProductListFilterValues = (values: string[]): string | undefined => {
  const normalized = normalizeProductListFilterValues(values);
  return normalized.length ? normalized.join(",") : undefined;
};

export const parseProductListSortValue = (searchParams: SearchParamsReader, defaultSort: string): string => {
  const raw = searchParams.get(PRODUCT_LIST_SORT_SEARCH_PARAM)?.trim();
  if (!raw) return defaultSort;

  return resolveProductListSort(raw) ?? raw;
};

/** Có query facet (lọc/sắp xếp/phân trang) — dùng canonical về path danh mục gốc. */
export const hasProductListFacetSearchParams = (searchParams: SearchParamsReader): boolean =>
  Boolean(
    searchParams.getAll?.(PRODUCT_LIST_FILTER_SEARCH_PARAM)?.length ||
    searchParams.get(PRODUCT_LIST_FILTER_SEARCH_PARAM)?.trim() ||
    searchParams.get(PRODUCT_LIST_SORT_SEARCH_PARAM)?.trim() ||
    searchParams.get(PRODUCT_LIST_MIN_PRICE_SEARCH_PARAM)?.trim() ||
    searchParams.get(PRODUCT_LIST_MAX_PRICE_SEARCH_PARAM)?.trim() ||
    searchParams.get("page")?.trim() ||
    searchParams.get("take")?.trim(),
  );

export const mapFilterSectionsToProductAttributes = (sections: ProductFilterSection[]): string | undefined => {
  const serialized = serializeProductListFilterValues(mapFilterSectionsToFilterValues(sections));
  return serialized;
};

export const mapFilterSectionsToFilterValues = (sections: ProductFilterSection[]): string[] => {
  const selectedOptionIds = sections
    .flatMap((section) => section.options || [])
    .filter((option) => option.checked)
    .map((option) => option.id)
    .filter(Boolean);

  return Array.from(new Set(selectedOptionIds)).sort();
};

export const applyFilterValuesToSections = (sections: ProductFilterSection[], filterValues: string[]): ProductFilterSection[] => {
  if (!filterValues.length) {
    return sections.map((section) => ({
      ...section,
      options: section.options?.map((option) => ({ ...option, checked: false })),
    }));
  }

  const valueSet = new Set(filterValues);

  return sections.map((section) => ({
    ...section,
    options: section.options?.map((option) => ({
      ...option,
      checked: valueSet.has(option.id),
    })),
  }));
};

export const buildProductListUrl = ({
  pathname,
  searchParams,
  defaultSort,
  defaultTake,
  page,
  take,
  sort,
  filterValues,
  priceRange,
}: BuildProductListUrlInput): string => {
  const currentPage = parsePositivePage(searchParams.get("page"));
  const currentTake = parsePositiveTake(searchParams.get("take"), defaultTake);

  const nextPage = page ?? currentPage;
  const nextTake = take ?? currentTake;
  const nextSort = sort !== undefined && sort !== null ? sort : parseProductListSortValue(searchParams, defaultSort);
  const nextFilterValues = filterValues !== undefined && filterValues !== null ? filterValues : parseProductListFilterValues(searchParams);
  const nextPriceRange = priceRange !== undefined && priceRange !== null ? priceRange : parseProductListPriceRange(searchParams);

  const params = new URLSearchParams();

  if (nextPage > 1) {
    params.set("page", String(nextPage));
  }

  if (nextTake !== defaultTake) {
    params.set("take", String(nextTake));
  }

  const resolvedSort = resolveProductListSort(nextSort) ?? nextSort;
  const resolvedDefaultSort = resolveProductListSort(defaultSort) ?? defaultSort;
  if (resolvedSort && resolvedSort !== resolvedDefaultSort) {
    params.set(PRODUCT_LIST_SORT_SEARCH_PARAM, resolvedSort);
  }

  const normalizedFilters = normalizeProductListFilterValues(nextFilterValues);
  if (normalizedFilters.length) {
    normalizedFilters.forEach((value) => {
      params.append(PRODUCT_LIST_FILTER_SEARCH_PARAM, value);
    });
  }

  if (!isDefaultProductPriceRange(nextPriceRange)) {
    params.set(PRODUCT_LIST_MIN_PRICE_SEARCH_PARAM, String(nextPriceRange[0]));
    params.set(PRODUCT_LIST_MAX_PRICE_SEARCH_PARAM, String(nextPriceRange[1]));
  }

  const sortedParams = new URLSearchParams(
    [...params.entries()].sort(([leftKey, leftValue], [rightKey, rightValue]) => {
      if (leftKey === rightKey) return leftValue.localeCompare(rightValue);
      return leftKey.localeCompare(rightKey);
    }),
  );
  const query = sortedParams.toString();

  return query ? `${pathname}?${query}` : pathname;
};

export const buildProductListParams = ({
  page,
  take,
  categorySlug,
  categorySlugs,
  collectionSlug,
  sortValue,
  defaultSort,
  attributes,
  minPrice,
  maxPrice,
  contract,
}: ProductListQueryInput): IParamsGetProducts => ({
  page,
  take,
  isPagination: true,
  categorySlug: categorySlug || undefined,
  categorySlugs: categorySlug ? undefined : categorySlugs || undefined,
  collectionSlug: categorySlug || categorySlugs ? undefined : collectionSlug || undefined,
  sort: resolveProductListSort(sortValue) ?? defaultSort,
  attributes,
  minPrice,
  maxPrice,
  contract,
});

export const buildProductListSWRKey = (params: IParamsGetProducts) => [
  "products",
  params.page,
  params.take,
  params.categorySlug,
  params.categorySlugs,
  params.collectionSlug,
  params.sort,
  params.attributes,
  params.minPrice,
  params.maxPrice,
  params.contract,
];

export const areProductListParamsEqual = (left?: IParamsGetProducts | null, right?: IParamsGetProducts | null): boolean => {
  if (!left || !right) return false;

  return (
    left.page === right.page &&
    left.take === right.take &&
    left.categorySlug === right.categorySlug &&
    left.categorySlugs === right.categorySlugs &&
    left.collectionSlug === right.collectionSlug &&
    left.sort === right.sort &&
    left.attributes === right.attributes &&
    left.minPrice === right.minPrice &&
    left.maxPrice === right.maxPrice &&
    left.contract === right.contract
  );
};

export { DEFAULT_PRODUCT_PRICE_RANGE, isDefaultProductPriceRange };
export type { ProductPriceRange };
