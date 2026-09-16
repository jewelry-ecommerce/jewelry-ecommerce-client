import { ProductLifecycleStatus, ProductStockStatus } from "@/utils/api/product/product.enum";
import type { IProductBySlugResponse, IProductVariation } from "@/utils/api/product/product.interface";
import { normalizeCdnMediaUrl } from "@/utils/cdn";

type ProductJsonLdOffer = {
  "@type": "Offer";
  url: string;
  price: string;
  priceCurrency: string;
  availability: string;
};

type ProductJsonLdBrand = {
  "@type": "Brand";
  name: string;
};

export type ProductJsonLd = {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description?: string;
  image?: string;
  sku?: string;
  brand?: ProductJsonLdBrand;
  offers?: ProductJsonLdOffer;
};

type BuildProductJsonLdInput = {
  product: IProductBySlugResponse;
  siteUrl: string;
};

const PRODUCT_DETAIL_PATH_PREFIX = "/san-pham";

const resolveAvailability = (product: IProductBySlugResponse, variant?: IProductVariation): string => {
  if (product.status === ProductLifecycleStatus.DISCONTINUED || product.isPurchasable === false) {
    return "https://schema.org/Discontinued";
  }

  if (variant?.stockStatus === ProductStockStatus.OUT_OF_STOCK || product.availability?.inStock === false) {
    return "https://schema.org/OutOfStock";
  }

  return "https://schema.org/InStock";
};

const getDefaultVariant = (product: IProductBySlugResponse): IProductVariation | undefined =>
  product.variants?.find((variant) => variant.id === product.defaultVariantId) ??
  product.variants?.find((variant) => variant.isDefault) ??
  product.variants?.[0];

const buildProductOffer = (
  product: IProductBySlugResponse,
  variant: IProductVariation | undefined,
  url: string,
): ProductJsonLdOffer | undefined => {
  const pricing = variant?.pricing;
  const price = Number(pricing?.sellingPriceAfterTaxMinor);
  const priceCurrency = pricing?.currency?.trim();
  if (!price || !priceCurrency) return undefined;

  return {
    "@type": "Offer",
    url,
    price: String(price),
    priceCurrency,
    availability: resolveAvailability(product, variant),
  };
};

export const buildProductJsonLd = ({ product, siteUrl }: BuildProductJsonLdInput): ProductJsonLd => {
  const variant = getDefaultVariant(product);
  const url = `${siteUrl}${PRODUCT_DETAIL_PATH_PREFIX}/${product.slug}`;
  const image = normalizeCdnMediaUrl(product.seo?.image || variant?.image || variant?.gallery?.[0]?.url);
  const description = (product.seo?.metaDescription || product.shortDescription || product.description || "").trim();
  const sku = (variant?.sku || product.spuCode || "").trim();
  const brandName = product.brand?.name?.trim();
  const offers = buildProductOffer(product, variant, url);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(sku ? { sku } : {}),
    ...(brandName ? { brand: { "@type": "Brand", name: brandName } } : {}),
    ...(offers ? { offers } : {}),
  };
};

export const serializeJsonLd = <T extends object>(data: T): string => JSON.stringify(data).replace(/</g, "\\u003c");
