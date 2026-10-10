import type { IProductBySlugResponse, IProductVariation, IVariantSelector, IProductVariationsResponse } from '../product/product.interface';
import { requestContentBackend } from './content-backend.api';

type WireAttribute = Omit<IVariantSelector['attribute'], 'id'> & { id: number };
type WireValue = Omit<IProductVariation['attributeValues'][number], 'id' | 'attribute'> & {
  id: number; attribute: WireAttribute;
};
type WireVariant = Omit<IProductVariation, 'id' | 'attributeValues'> & {
  id: number; attributeValues: WireValue[];
};
type WireSelector = { attribute: WireAttribute; options: Array<
  Omit<IVariantSelector['options'][number], 'id' | 'variationIds'> & { id: number; variationIds: number[] }
> };
export type WireProductDetail = Omit<IProductBySlugResponse,
  'id' | 'category' | 'defaultVariant' | 'defaultVariantId' | 'variants' | 'variantSelectors' | 'productInfos'> & {
  id: number; category: Omit<IProductBySlugResponse['category'], 'id'> & { id: number };
  defaultVariant?: WireVariant; defaultVariantId?: number; variants: WireVariant[];
  variantSelectors: WireSelector[];
  productInfos: Array<Omit<IProductBySlugResponse['productInfos'][number], 'id'> & { id: number }>;
};

function variantView(variant: WireVariant): IProductVariation {
  return { ...variant, id: String(variant.id), attributeValues: variant.attributeValues.map(value => ({
    ...value, id: String(value.id), attribute: { ...value.attribute, id: String(value.attribute.id) },
  })) };
}
function selectorView(selector: WireSelector): IVariantSelector {
  return { attribute: { ...selector.attribute, id: String(selector.attribute.id) },
    options: selector.options.map(option => ({
      ...option, id: String(option.id), variationIds: option.variationIds.map(String),
    })) };
}
export function mapContentProductDetail(product: WireProductDetail): IProductBySlugResponse {
  return { ...product, id: String(product.id), category: { ...product.category, id: String(product.category.id) },
    defaultVariantId: product.defaultVariantId === undefined ? undefined : String(product.defaultVariantId),
    defaultVariant: product.defaultVariant ? variantView(product.defaultVariant) : undefined,
    variants: product.variants.map(variantView), variantSelectors: product.variantSelectors.map(selectorView),
    productInfos: product.productInfos.map(info => ({ ...info, id: String(info.id) })) };
}
export async function getContentProductDetail(slug: string): Promise<IProductBySlugResponse> {
  return mapContentProductDetail(await requestContentBackend<WireProductDetail>('storefront/product/' + encodeURIComponent(slug)));
}
export function contentVariationPicker(product: IProductBySlugResponse): IProductVariationsResponse {
  return {
    product: { id: product.id, name: product.name, slug: product.slug, status: product.status,
      isPurchasable: product.isPurchasable, image: product.gallery[0]?.url ?? '',
      imageHover: product.gallery[1]?.url ?? '', brandName: product.brand.name, categoryName: product.category.name },
    attributes: product.variantSelectors.map(selector => ({ ...selector.attribute,
      values: selector.options.map(option => ({ code: option.code, value: option.value, image: option.thumbnail })) })),
    variations: product.variants.map(variant => ({
      id: variant.id, skuCode: variant.sku, name: variant.name, slug: variant.slug, stock: variant.stock,
      stockStatus: variant.stockStatus, status: 'ACTIVE', image: variant.image, imageHover: variant.gallery[1]?.url ?? null,
      sellingPriceAfterTaxMinor: variant.pricing?.sellingPriceAfterTaxMinor?.toString() ?? null,
      compareAtPriceAfterTaxMinor: variant.pricing?.compareAtPriceAfterTaxMinor?.toString() ?? null,
      customerDisplayPrice: variant.pricing?.customerDisplayPrice, medias: variant.gallery,
      attributeValues: variant.attributeValues.map(value => ({ attributeCode: value.attribute.code, valueCode: value.code })),
    })),
  };
}
export async function getContentProductVariations(slug: string): Promise<IProductVariationsResponse> {
  return contentVariationPicker(await getContentProductDetail(slug));
}
