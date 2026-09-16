import { cache } from "react";
import { buildProductCarouselParams, getBannerPlacementCode } from "@/app/(layout-main)/trang-chu/_utils/home.utils";
import {
  buildProductListParams,
  parseProductListFilterValues,
  parseProductListPriceRange,
  parseProductListSortValue,
  resolveProductFilterCategoryParams,
  resolveProductListPriceParams,
  serializeProductListFilterValues,
} from "@/app/(layout-main)/san-pham/_utils/product-list-query.utils";
import { extractScopedCategorySlug } from "@/app/(layout-main)/san-pham/_utils/product-page-route.utils";
import { resolveProductListBannerFetchContext } from "@/app/(layout-main)/san-pham/_utils/product-cms.utils";
import { fetchApiJson, fetchStorefrontPageBySlug } from "@/lib/server/storefront-metadata";
import { getStorefrontNavigation, getCachedBannerPlacement, getCachedProductListBanners } from "@/lib/storefront";
import { authFetch } from "@/lib/server/api-client";
import { SERVER_FETCH_ACCEPT_HEADER, SERVER_FETCH_LANGUAGE_HEADER } from "@/lib/server/server-fetch.constants";
import { BlockTypeCode } from "@/utils/api/cms";
import type { BannerPlacement, ProductListBannerStorefrontResponse } from "@/utils/api/banner/banner.interface";
import type { PageResponse, StorefrontNavigationResponse } from "@/utils/api/cms/cms.interface";
import type { IParamsGetProducts, IProductFiltersResponse, IProductSkuCardResponse } from "@/utils/api/product/product.interface";
import { PAGE_TAKE_DEFAULT, resolveProductListTakeFromSearchParams } from "@/utils/constants/page-take.constant";

type SearchParamsRecord = Record<string, string | string[] | undefined>;
type ApiQueryValue = string | number | boolean | undefined;
type ApiQueryEntry = readonly [string, ApiQueryValue];

export type ProductListingInitialData = {
  page: PageResponse | null;
  navigation: StorefrontNavigationResponse | null;
  products: IProductSkuCardResponse | null;
  filters: IProductFiltersResponse | null;
  productParams: IParamsGetProducts;
  banners: Record<string, BannerPlacement>;
  productListBanners: ProductListBannerStorefrontResponse | null;
};

type ProductListingFetchInput = {
  cmsPageSlug: string;
  pageBasePath: string;
  pathname: string;
  defaultSortValue: string;
  searchParams?: SearchParamsRecord;
};

const getSearchParamValue = (params: SearchParamsRecord | undefined, key: string): string | null => {
  const value = params?.[key];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const parsePositiveNumber = (value: string | null, fallback: number): number => {
  const parsedValue = Number.parseInt(value || "", 10);
  return Number.isNaN(parsedValue) || parsedValue < 1 ? fallback : parsedValue;
};

const buildSearchParamsReader = (searchParams?: SearchParamsRecord) => ({
  get: (key: string) => getSearchParamValue(searchParams, key),
});

const buildApiPath = (path: string, entries: ApiQueryEntry[]): string => {
  const search = new URLSearchParams();
  entries.forEach(([key, value]) => {
    if (value === undefined) return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
};

const buildProductApiPath = (params: IParamsGetProducts): string =>
  buildApiPath("catalog/products", [
    ["orderType", params.orderType],
    ["orderBy", params.orderBy],
    ["page", params.page],
    ["take", params.take],
    ["search", params.search],
    ["isPagination", params.isPagination],
    ["categorySlug", params.categorySlug],
    ["categorySlugs", params.categorySlugs],
    ["collectionSlug", params.collectionSlug],
    ["minPrice", params.minPrice],
    ["maxPrice", params.maxPrice],
    ["inStock", params.inStock],
    ["attributes", params.attributes],
    ["sort", params.sort],
    ["contract", params.contract],
  ]);

const fetchProducts = async (params: IParamsGetProducts): Promise<IProductSkuCardResponse | null> => {
  // Render phía server không set được cookie: nếu để refresh ở đây, BE rotate refresh token
  // mà token mới bị bỏ đi → refresh token trong browser thành vô hiệu.
  const { response, data } = await authFetch<IProductSkuCardResponse>(buildProductApiPath(params), {
    method: "GET",
    headers: { Accept: SERVER_FETCH_ACCEPT_HEADER, Language: SERVER_FETCH_LANGUAGE_HEADER },
    skipRefresh: true,
  });

  return response.ok ? data : null;
};

const fetchProductFilters = (categorySlugFromUrl?: string | null) => {
  const filterParams = resolveProductFilterCategoryParams(categorySlugFromUrl);
  return fetchApiJson<IProductFiltersResponse>(buildApiPath("catalog/products/filters", [["categorySlug", filterParams.categorySlug]]));
};

const fetchNavigation = async () => {
  try {
    return await getStorefrontNavigation();
  } catch {
    return null;
  }
};

const fetchBannerPlacement = async (code: string) => {
  try {
    return await getCachedBannerPlacement(code);
  } catch (error) {
    console.error(`[Storefront] Fetch banner placement "${code}" failed:`, error);
    return null;
  }
};

const fetchProductListBanners = async (
  productListBlock: PageResponse["blocks"][number] | undefined,
  urlCategorySlug: string | null | undefined,
): Promise<ProductListBannerStorefrontResponse | null> => {
  const fetchContext = resolveProductListBannerFetchContext(productListBlock, urlCategorySlug);
  if (!fetchContext.shouldFetch || !fetchContext.contextSlug) return null;

  try {
    return await getCachedProductListBanners(fetchContext.contextSlug, fetchContext.isCategory);
  } catch (error) {
    console.error(`[Storefront] Fetch product list banners failed:`, error);
    return null;
  }
};

const collectPlacementCodes = (page: PageResponse | null): string[] => {
  if (!page) return [];

  const placementCodes = new Set<string>();
  page.blocks.forEach((block) => {
    if (block.blockTypeCode !== BlockTypeCode.BANNER) return;

    const placementCode = getBannerPlacementCode(block);
    if (placementCode) placementCodes.add(placementCode);
  });
  return [...placementCodes];
};

const fetchBannerPlacements = async (placementCodes: string[]): Promise<Record<string, BannerPlacement>> => {
  const entries = await Promise.allSettled(placementCodes.map(async (code) => [code, await fetchBannerPlacement(code)] as const));

  return entries.reduce<Record<string, BannerPlacement>>((placements, entry) => {
    if (entry.status !== "fulfilled") return placements;

    const [code, placement] = entry.value;
    if (placement) placements[code] = placement;
    return placements;
  }, {});
};

const getProductListBlock = (page: PageResponse | null) => page?.blocks.find((block) => block.blockTypeCode === BlockTypeCode.PRODUCT_LIST);

const getProductListBlockDefaults = (page: PageResponse | null): IParamsGetProducts | null => {
  const productListBlock = getProductListBlock(page);
  return productListBlock ? buildProductCarouselParams(productListBlock) : null;
};

export const fetchProductListingInitialData = cache(
  async ({
    cmsPageSlug,
    pageBasePath,
    pathname,
    defaultSortValue,
    searchParams,
  }: ProductListingFetchInput): Promise<ProductListingInitialData> => {
    const page = await fetchStorefrontPageBySlug(cmsPageSlug);
    const productListDefaults = getProductListBlockDefaults(page);
    const scopedCategorySlug = extractScopedCategorySlug(pathname, pageBasePath);
    const categorySlug = scopedCategorySlug || productListDefaults?.categorySlug;
    const categorySlugs = categorySlug ? undefined : productListDefaults?.categorySlugs;
    const collectionSlug = categorySlug || categorySlugs ? undefined : productListDefaults?.collectionSlug;
    const defaultSort = productListDefaults?.sort || defaultSortValue;
    const sortValue = parseProductListSortValue({ get: (key) => getSearchParamValue(searchParams, key) }, defaultSort);
    const filterValues = parseProductListFilterValues({ get: (key) => getSearchParamValue(searchParams, key) });
    const priceRange = parseProductListPriceRange({ get: (key) => getSearchParamValue(searchParams, key) });
    const priceParams = resolveProductListPriceParams(priceRange);
    const productParams = buildProductListParams({
      page: parsePositiveNumber(getSearchParamValue(searchParams, "page"), PAGE_TAKE_DEFAULT.page),
      take: resolveProductListTakeFromSearchParams(buildSearchParamsReader(searchParams)),
      categorySlug,
      categorySlugs,
      collectionSlug,
      sortValue,
      defaultSort: productListDefaults?.sort,
      attributes: serializeProductListFilterValues(filterValues),
      minPrice: priceParams.minPrice,
      maxPrice: priceParams.maxPrice,
      contract: "sku-card-v2",
    });

    const [navigation, products, filters, banners, productListBanners] = await Promise.all([
      fetchNavigation(),
      fetchProducts(productParams),
      fetchProductFilters(scopedCategorySlug),
      fetchBannerPlacements(collectPlacementCodes(page)),
      fetchProductListBanners(getProductListBlock(page), scopedCategorySlug),
    ]);

    return { page, navigation, products, filters, productParams, banners, productListBanners };
  },
);
