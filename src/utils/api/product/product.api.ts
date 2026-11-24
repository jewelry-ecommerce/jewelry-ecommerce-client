import type {
  ICustomerWishlistResponse,
  IGetProductReviewMyOrdersParams,
  IProductReviewBatchRequest,
  IProductReviewMyOrdersResponse,
  IProductReviewOrderDetailResponse,
  IGetProductReviewsParams,
  IParamsGetProductFilters,
  IParamsGetProducts,
  IProductBySlugResponse,
  IProductInfoItem,
  IProductFiltersResponse,
  IProductReviewsResponse,
  IProductsResponse,
  IProductVariationsResponse,
  IProductGiftsResponse,
  IProductPromotionsResponse,
  IProductSkuCardResponse,
  IProductReviewSummaryResponse,
  IProductReviewStatsResponse,
  IProductRelatedResponse,
  ApiProduct,
  ICustomerWishlistProductIdsResponse,
  ISearchHistoryItem,
  ISearchSuggestionsResponse,
  IVariationCardsRequest,
  IVariationCardsResponse,
} from "./product.interface";
import { buildRecentlyViewedRequestOptions } from "./recently-viewed-request.util";
import { listJavaRecentlyViewedSlugs, recordJavaRecentlyViewedSlug } from "./java-recently-viewed.util";
import { authAxios, commonAxios } from "@/utils/axios";
import { isJavaBackend } from '@/utils/config/java-backend.config';
import { getContentApiBaseUrl } from "@/utils/config/content-backend.config";
import { getContentProducts } from "../content-backend/content-products.api";
import { getContentProductDetail, getContentProductVariations } from "../content-backend/content-product-detail.api";
import type { IProductSkuCardItem } from "./product.interface";

const emptySkuCardPage = (): IProductSkuCardResponse => ({
  total: 0,
  list: [],
  pagination: { total: 0, currentPage: 1, totalPage: 0, hasNextPage: false, hasPreviousPage: false, nextPage: false, previousPage: false },
});

const toSkuCardFromDetail = (product: IProductBySlugResponse): IProductSkuCardItem => {
  const variant = product.defaultVariant ?? product.variants?.[0];
  return {
    ...(product as unknown as IProductSkuCardItem),
    id: product.id,
    productId: product.id,
    slug: product.slug,
    productSlug: product.slug,
    name: product.name,
    productName: product.name,
    image: product.gallery?.[0]?.url || "",
    imageHover: product.gallery?.[1]?.url || "",
    defaultVariationId: product.defaultVariantId || variant?.id,
  } as IProductSkuCardItem;
};

export const getFiltersByProduct = async (params: IParamsGetProductFilters): Promise<IProductFiltersResponse> =>
  (await commonAxios.get("catalog/products/filters", { params })).data;

export const getProducts = async (params: IParamsGetProducts): Promise<IProductsResponse> =>
  (await authAxios.get("catalog/products", { params })).data;

export const getProductsSkuCardV2 = async (params: IParamsGetProducts): Promise<IProductSkuCardResponse> => {
  if(getContentApiBaseUrl()) return getContentProducts(params);
  return (await authAxios.get("catalog/products", { params: { ...params, contract: "sku-card-v2" } })).data;
};

export const recordRecentlyViewedProduct = async (payload: { productSlug: string }): Promise<void> => {
  if (isJavaBackend() || getContentApiBaseUrl()) {
    recordJavaRecentlyViewedSlug(payload.productSlug);
    return;
  }
  await authAxios.post("catalog/products/recently-viewed", payload, buildRecentlyViewedRequestOptions());
};

export const getRecentlyViewedProductsSkuCardV2 = async (params: { excludeSlug?: string }): Promise<IProductSkuCardResponse> => {
  if (isJavaBackend() || getContentApiBaseUrl()) {
    const slugs = listJavaRecentlyViewedSlugs(params.excludeSlug);
    if (!slugs.length) return emptySkuCardPage();
    const settled = await Promise.allSettled(slugs.map((slug) => getProductBySlug(slug)));
    const list = settled
      .filter((row): row is PromiseFulfilledResult<IProductBySlugResponse> => row.status === "fulfilled")
      .map((row) => toSkuCardFromDetail(row.value));
    return { ...emptySkuCardPage(), total: list.length, list, pagination: { ...emptySkuCardPage().pagination, total: list.length } };
  }
  return (
    await authAxios.get("catalog/products/recently-viewed", {
      params: { ...params, contract: "sku-card-v2" },
      ...buildRecentlyViewedRequestOptions(),
    })
  ).data;
};

export const getRelatedProductsByProductSlug = async (productSlug: string): Promise<IProductSkuCardResponse> => {
  if (isJavaBackend() || getContentApiBaseUrl()) {
    try {
      const product = await getProductBySlug(productSlug);
      const categorySlug = product.category?.slug || (product as { categorySlug?: string }).categorySlug;
      if (!categorySlug) return emptySkuCardPage();
      const page = await getProductsSkuCardV2({ categorySlugs: categorySlug, take: 12, page: 1 });
      const list = (page.list || []).filter((item) => item.slug !== productSlug).slice(0, 8);
      return { ...page, list, total: list.length };
    } catch {
      return emptySkuCardPage();
    }
  }
  return (
    await authAxios.get("catalog/products/related", {
      params: { productSlug, contract: "sku-card-v2" },
    })
  ).data;
};

export const getProductBySlug = async (slug: string): Promise<IProductBySlugResponse> => {
  if (getContentApiBaseUrl()) return getContentProductDetail(slug);
  return (await commonAxios.get(`catalog/products/${slug}`)).data;
};

export const getProductInfo = async (productId: string): Promise<IProductInfoItem[]> =>
  (await commonAxios.get(`catalog/product-info/${productId}`)).data;

export const getProductGiftsBySlug = async (slug: string): Promise<IProductGiftsResponse> =>
  (await commonAxios.get(`catalog/products/${slug}/gifts`)).data;

export const getProductPromotionsBySlug = async (slug: string): Promise<IProductPromotionsResponse> =>
  (await commonAxios.get(`catalog/products/${slug}/promotions`)).data;

export const getProductReviewSummaryBySlug = async (slug: string): Promise<IProductReviewSummaryResponse> =>
  (await commonAxios.get(`catalog/products/${slug}/reviews-summary`)).data;

export const getProductRelatedBySlug = async (slug: string): Promise<IProductRelatedResponse> =>
  (await commonAxios.get(`catalog/products/${slug}/related`)).data;

export const getProductMixMatchBySlug = async (slug: string): Promise<IProductRelatedResponse> =>
  (await commonAxios.get(`catalog/products/${slug}/mix-match`)).data;

export const getProductVariationsBySlug = async (slug: string): Promise<IProductVariationsResponse> => {
  if (getContentApiBaseUrl()) return getContentProductVariations(slug);
  return (await commonAxios.get(`catalog/products/${slug}/variations`)).data;
};

export const getCustomerWishlist = async (): Promise<ICustomerWishlistResponse> => (await authAxios.get(`product/customer/wishlist`)).data;

export const getCustomerWishlistProductIds = async (): Promise<ICustomerWishlistProductIdsResponse> =>
  (await authAxios.get(`product/customer/wishlist/product-ids`)).data;

export const getCustomerWishlistProductId = async (productId: string): Promise<boolean> =>
  Boolean((await authAxios.get(`product/customer/wishlist/${productId}`)).data?.isWished);

export const postCustomerWishlist = async (productIds: string[]): Promise<void> =>
  (await authAxios.post(`product/customer/wishlist`, { productIds })).data;

export const deleteCustomerWishlist = async (productIds: string[]): Promise<void> =>
  (await authAxios.delete(`product/customer/wishlist`, { data: { productIds } })).data;

// search
export const getSearch = async (params: IParamsGetProducts): Promise<IProductsResponse> =>
  (await commonAxios.get("catalog/search", { params })).data;

export const getSearchLanding = async (): Promise<ApiProduct[]> => {
  const path = isJavaBackend() ? 'storefront/product/search-pinned' : 'catalog/search/landing';
  const products = (await commonAxios.get<ApiProduct[]>(path)).data;
  return products.map(product => ({ ...product, productId: String(product.productId),
    defaultVariationId: product.defaultVariationId == null ? product.defaultVariationId : String(product.defaultVariationId) }));
};

export const getSearchTrending = async (limit?: number): Promise<string[]> =>
  (await commonAxios.get(`catalog/search/trending`, { params: { limit } })).data;

export const getSearchSuggestions = async (q: string): Promise<ISearchSuggestionsResponse[]> =>
  (await commonAxios.get("catalog/search/suggestions", { params: { q } })).data;

export const getSearchHistory = async (limit?: number): Promise<Array<string | ISearchHistoryItem>> =>
  (await authAxios.get("catalog/search/history", { params: { limit } })).data;

export const deleteSearchHistory = async (): Promise<void> => (await authAxios.delete(`catalog/search/history`)).data;

export const deleteSearchHistoryKeyword = async (keyword: string): Promise<void> => {
  const path = isJavaBackend() ? "catalog/search/history/keyword" : `catalog/search/history/keyword/${encodeURIComponent(keyword)}`;
  return (await authAxios.delete(path, isJavaBackend() ? { params: { keyword } } : undefined)).data;
};

// review
export const getProductReviews = async (params: IGetProductReviewsParams): Promise<IProductReviewsResponse> =>
  (await commonAxios.get("review/product-reviews", { params })).data;

export const getProductReviewMyOrders = async (params?: IGetProductReviewMyOrdersParams): Promise<IProductReviewMyOrdersResponse> =>
  (await authAxios.get("review/product-reviews/my/orders", { params })).data;

export const getProductReviewOrderByOrderId = async (orderId: string): Promise<IProductReviewOrderDetailResponse> =>
  (await authAxios.get(`review/product-reviews/order/${orderId}`)).data;

export const postProductReviewBatch = async (payload: IProductReviewBatchRequest): Promise<void> =>
  (await authAxios.post("review/product-reviews/batch", payload)).data;

export const getProductReviewStats = async (productId: string): Promise<IProductReviewStatsResponse> =>
  (await commonAxios.get(`review/product-reviews/stats/${productId}`)).data;

export const getVariationCards = async (payload: IVariationCardsRequest): Promise<IVariationCardsResponse> =>
  (await commonAxios.post("catalog/variations/cards", payload)).data;
