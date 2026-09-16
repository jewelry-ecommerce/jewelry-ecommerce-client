import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAxiosError } from "axios";
import { getCachedStorefrontPage } from "@/lib/storefront";
import { createMetadata } from "@/libs/seo/metadata";
import type { PageResponse } from "@/utils/api/cms";
import type { IProductBySlugResponse } from "@/utils/api/product/product.interface";
import { getApiBeUrl } from "@/utils/config/common";
import { getMockStorefrontPage } from "@/mock-api/storefront-mock";
import { addTenantToHeaders, getRuntimeTenantCode } from "./tenant-headers";
import { normalizeCanonicalUrl } from "@/lib/seo/canonical-url";
import { resolvePublicSiteUrl } from "@/lib/server/public-site-url";
import { resolveTenantBranding } from "@/lib/server/resolve-tenant-branding.server";
import { configureDevSelfSignedTls } from "./tls";

type MetadataImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

type MetadataPath = `/${string}` | "/";

export type StorefrontMetadataOverrides = {
  title?: string;
  description?: string;
  keywords?: string;
  image?: MetadataImage;
  noIndex?: boolean;
};

type CreatePageMetadataInput = {
  path?: MetadataPath;
  canonicalUrl?: string;
} & StorefrontMetadataOverrides;

type StorefrontMetadataOptions = {
  slug: string;
  path?: MetadataPath;
  canonicalUrl?: string;
  defaults: StorefrontMetadataOverrides;
};

type ProductMetadataOptions = {
  slug: string;
  path?: MetadataPath;
  canonicalUrl?: string;
  defaults: StorefrontMetadataOverrides;
};

export const getSharedSeoImage = (host?: string | null): MetadataImage => {
  const { productDefaultSrc, brandName } = resolveTenantBranding(host);
  return {
    url: `${resolvePublicSiteUrl()}${productDefaultSrc}`,
    width: 1200,
    height: 630,
    alt: `${brandName} - Tinh te trong tung thiet ke trang suc`,
  };
};

/** @deprecated Gọi `getSharedSeoImage()` trong `generateMetadata` để đúng tenant theo request. */
export const sharedSeoImage = getSharedSeoImage();

const buildApiUrl = (path: string) => {
  const normalizedBaseUrl = (getApiBeUrl() || "").replace(/\/$/, "");
  const normalizedPath = path.replace(/^\//, "");
  return `${normalizedBaseUrl}/${normalizedPath}`;
};

const buildCanonicalUrl = (path: MetadataPath = "/", canonicalUrl?: string, siteUrl?: string) =>
  normalizeCanonicalUrl(canonicalUrl, path, siteUrl);

export const createPageMetadata = ({
  path = "/",
  canonicalUrl,
  title,
  description,
  keywords,
  image,
  noIndex,
}: CreatePageMetadataInput): Metadata => {
  const siteUrl = resolvePublicSiteUrl();

  return createMetadata({
    title,
    description,
    keywords,
    path,
    siteUrl,
    canonicalUrl: buildCanonicalUrl(path, canonicalUrl, siteUrl),
    image: image ?? getSharedSeoImage(),
    noIndex,
  });
};

const createFallbackMetadata = ({
  path = "/",
  canonicalUrl,
  defaults,
}: {
  path?: MetadataPath;
  canonicalUrl?: string;
  defaults: StorefrontMetadataOverrides;
}) => createPageMetadata({ path, canonicalUrl, ...defaults });

const isStorefrontApiPath = (path: string): boolean => path.replace(/^\//, "").startsWith("cms/storefront/");

const logStorefrontFetchWarning = (path: string, status?: number, error?: unknown): void => {
  const tenantCode = getRuntimeTenantCode() || "(unset)";
  if (typeof status === "number") {
    console.warn(`[storefront] TENANT_CODE=${tenantCode} GET ${path} → HTTP ${status}. Using fallback.`);
    return;
  }

  console.warn(`[storefront] TENANT_CODE=${tenantCode} GET ${path} failed. Using fallback.`, error);
};

export const fetchStorefrontApiJson = async <T>(path: string): Promise<T | null> => {
  configureDevSelfSignedTls();

  if (!getApiBeUrl()) {
    console.warn(`[storefront] Missing API_BE_URL for "${path}". Falling back to defaults.`);
    return null;
  }

  const headers = addTenantToHeaders({
    Accept: "application/json",
    Language: "en_US",
  });

  try {
    const response = await fetch(buildApiUrl(path), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      logStorefrontFetchWarning(path, response.status);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    logStorefrontFetchWarning(path, undefined, error);
    return null;
  }
};

export const fetchStorefrontPageBySlug = async (slug: string): Promise<PageResponse> => {
  if (!getApiBeUrl()) {
    const mockPage = getMockStorefrontPage(slug);
    if (!mockPage) notFound();
    return mockPage;
  }

  try {
    return await getCachedStorefrontPage(slug);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) notFound();
    throw error;
  }
};

export const fetchApiJson = async <T>(path: string): Promise<T | null> => {
  if (isStorefrontApiPath(path)) {
    return fetchStorefrontApiJson<T>(path);
  }

  configureDevSelfSignedTls();

  if (!getApiBeUrl()) {
    console.warn(`[SEO] Missing API_BE_URL while generating metadata for "${path}". Falling back to defaults.`);
    return null;
  }

  const headers = addTenantToHeaders({
    Accept: "application/json",
    Language: "en_US",
  });

  try {
    const response = await fetch(buildApiUrl(path), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`[SEO] Failed to fetch "${path}".`, error);
    return null;
  }
};

export async function getStorefrontPageMetadata({
  slug,
  path = "/",
  canonicalUrl,
  defaults,
}: StorefrontMetadataOptions): Promise<Metadata> {
  try {
    const data = await fetchApiJson<PageResponse>(`cms/storefront/pages/${slug}`);
    if (!data) {
      return createFallbackMetadata({ path, canonicalUrl, defaults });
    }
    const seo = data.page?.seo;

    return createPageMetadata({
      path,
      canonicalUrl: seo?.canonicalUrl || canonicalUrl,
      title: seo?.title || defaults.title,
      description: seo?.description || defaults.description,
      keywords: seo?.keywords || defaults.keywords,
      image: seo?.imageUrl
        ? {
            url: seo.imageUrl,
            width: 1200,
            height: 630,
            alt: seo?.title || defaults.title,
          }
        : defaults.image,
      noIndex: defaults.noIndex,
    });
  } catch (error) {
    console.error(`[SEO] Failed to generate metadata for storefront page "${slug}".`, error);
    return createFallbackMetadata({ path, canonicalUrl, defaults });
  }
}

export async function getProductPageMetadata({
  slug,
  path = `/san-pham/${slug}`,
  canonicalUrl,
  defaults,
}: ProductMetadataOptions): Promise<Metadata> {
  try {
    const product = await fetchApiJson<IProductBySlugResponse>(`catalog/products/${slug}`);
    if (!product) {
      return createFallbackMetadata({ path, canonicalUrl, defaults });
    }
    const primaryImage =
      product.seo?.image ||
      product.defaultVariant?.image ||
      product.gallery?.find((item) => item.isPrimary)?.url ||
      product.gallery?.[0]?.url;

    return createPageMetadata({
      path,
      canonicalUrl,
      title: product.seo?.metaTitle ?? defaults.title,
      description: product.seo?.metaDescription ?? defaults.description,
      keywords: product.seo?.metaKeywords ?? defaults.keywords,
      image: primaryImage
        ? {
            url: primaryImage,
            alt: product.name,
          }
        : defaults.image,
      noIndex: defaults.noIndex,
    });
  } catch (error) {
    console.error(`[SEO] Failed to generate metadata for product "${slug}".`, error);
    return createFallbackMetadata({ path, canonicalUrl, defaults });
  }
}
