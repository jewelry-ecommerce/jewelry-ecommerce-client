import { cache } from "react";
import type { IProductBySlugResponse } from "@/utils/api/product/product.interface";
import { getApiBeUrl } from "@/utils/config/common";
import { addTenantToHeaders } from "./tenant-headers";
import { configureDevSelfSignedTls } from "./tls";

const buildProductApiUrl = (slug: string) => {
  const base = (getApiBeUrl() || "").replace(/\/$/, "");
  return `${base}/catalog/products/${slug}`;
};

export const fetchProductBySlug = cache(async (slug: string): Promise<IProductBySlugResponse | null> => {
  configureDevSelfSignedTls();

  if (!getApiBeUrl()) {
    console.warn(`[Server] Missing API_BE_URL — cannot fetch product "${slug}".`);
    return null;
  }

  const headers = addTenantToHeaders({
    Accept: "application/json",
    Language: "en_US",
  });

  const response = await fetch(buildProductApiUrl(slug), {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`[Server] Product fetch failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as IProductBySlugResponse;
});
