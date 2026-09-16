import { cache } from "react";
import { authFetch } from "@/lib/server/api-client";
import { SERVER_FETCH_ACCEPT_HEADER, SERVER_FETCH_LANGUAGE_HEADER } from "@/lib/server/server-fetch.constants";
import { getApiBeUrl } from "@/utils/config/common";
import type { ApiProduct, IParamsGetProducts, IProductsResponse } from "@/utils/api/product/product.interface";

const ATSH_SINGER_COLLECTION_PRODUCT_TAKE = 20;
const ATSH_SINGER_PRODUCTS_LOG_PREFIX = "[ATSH singer products]";

function logAtshSingerProductsFetch(message: string, details?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "development") return;
  if (details) {
    console.info(`${ATSH_SINGER_PRODUCTS_LOG_PREFIX} ${message}`, details);
    return;
  }
  console.info(`${ATSH_SINGER_PRODUCTS_LOG_PREFIX} ${message}`);
}

function resolveAtshSingerProductsApiUrl(apiPath: string): string {
  const baseUrl = (getApiBeUrl() || "").replace(/\/$/, "");
  return baseUrl ? `${baseUrl}/${apiPath.replace(/^\//, "")}` : apiPath;
}

const buildProductApiPath = (params: IParamsGetProducts): string => {
  const search = new URLSearchParams();
  const entries: Array<[string, string | number | boolean | undefined]> = [
    ["collectionSlug", params.collectionSlug],
    ["take", params.take],
    ["isPagination", params.isPagination],
  ];

  entries.forEach(([key, value]) => {
    if (value === undefined) return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `catalog/products?${query}` : "catalog/products";
};

export function resolveAtshSingerFullLookTotalPrice(products: ApiProduct[]): number {
  return products.reduce((sum, product) => {
    const priceMinor =
      product.defaultDisplay?.sellingPriceAfterTaxMinor ??
      product.pricing?.customerDisplayPrice?.sellingPriceAfterTaxMinor ??
      product.defaultDisplay?.displayPriceAfterTaxMinor ??
      0;

    return sum + Number(priceMinor);
  }, 0);
}

export const fetchAtshSingerCollectionProducts = cache(async (collectionSlug: string): Promise<ApiProduct[]> => {
  const normalizedSlug = collectionSlug.trim();
  if (!normalizedSlug) return [];

  const params: IParamsGetProducts = {
    collectionSlug: normalizedSlug,
    take: ATSH_SINGER_COLLECTION_PRODUCT_TAKE,
    isPagination: false,
  };

  const apiPath = buildProductApiPath(params);
  logAtshSingerProductsFetch("server fetch start", {
    collectionSlug: normalizedSlug,
    url: resolveAtshSingerProductsApiUrl(apiPath),
  });

  // Render phía server không set được cookie: nếu để refresh ở đây, BE rotate refresh token
  // mà token mới bị bỏ đi → refresh token trong browser thành vô hiệu.
  const { response, data } = await authFetch<IProductsResponse>(apiPath, {
    method: "GET",
    headers: { Accept: SERVER_FETCH_ACCEPT_HEADER, Language: SERVER_FETCH_LANGUAGE_HEADER },
    skipRefresh: true,
  });

  const productCount = data?.list?.length ?? 0;

  if (!response.ok) {
    logAtshSingerProductsFetch("server fetch failed", {
      collectionSlug: normalizedSlug,
      status: response.status,
      message: (data as { message?: string } | null)?.message,
    });
    return [];
  }

  if (!productCount) {
    logAtshSingerProductsFetch("server fetch empty", {
      collectionSlug: normalizedSlug,
      status: response.status,
      total: data?.total ?? 0,
    });
    return [];
  }

  logAtshSingerProductsFetch("server fetch success", {
    collectionSlug: normalizedSlug,
    status: response.status,
    productCount,
    total: data?.total ?? productCount,
    productSlugs: data?.list?.map((product) => product.productSlug),
  });

  return data.list;
});
