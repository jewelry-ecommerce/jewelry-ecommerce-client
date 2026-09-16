import { ProductStockStatus } from "@/utils/api/product/product.enum";
import type { IProductVariation, IVariantSelector, ProductPurchaseAction } from "@/utils/api/product/product.interface";
import { isPreOrderPurchaseAction } from "@/utils/product/purchase-action.util";

interface NormalizedVariation {
  stock: number;
  stockStatus?: string;
  purchaseAction?: Pick<ProductPurchaseAction, "code"> | null;
  preOrderCampaignId?: string | null;
  attributes: Record<string, string>;
}

/** Variation shape from PDP (`IProductVariation`) or exchange/quick-view API (`attributeCode`/`valueCode`). */
export type VariantAvailabilityInput = {
  stock: number;
  stockStatus?: string;
  purchaseAction?: ProductPurchaseAction | Pick<ProductPurchaseAction, "code"> | null;
  preOrderCampaignId?: string | null;
  attributes?: Record<string, string>;
  attributeValues?: Array<{
    code?: string;
    valueCode?: string;
    attributeCode?: string;
    attribute?: { code?: string };
  }>;
};

export function isVariationInStock(variation: { stock: number; stockStatus?: string }): boolean {
  if (variation.stockStatus === ProductStockStatus.OUT_OF_STOCK) return false;
  return variation.stock > 0;
}

/** Pre-order vẫn chọn được dù stock = 0 / OUT_OF_STOCK. */
export function isVariationAvailableForPurchase(variation: {
  stock: number;
  stockStatus?: string;
  purchaseAction?: Pick<ProductPurchaseAction, "code"> | null;
  preOrderCampaignId?: string | null;
}): boolean {
  if (isPreOrderPurchaseAction(variation.purchaseAction)) return true;
  if (variation.preOrderCampaignId?.trim()) return true;
  return isVariationInStock(variation);
}

export function getVariationAttributeMap(variation: VariantAvailabilityInput): Record<string, string> {
  if (variation.attributes && Object.keys(variation.attributes).length > 0) {
    return variation.attributes;
  }

  const map: Record<string, string> = {};
  for (const attributeValue of variation.attributeValues ?? []) {
    const attributeCode = attributeValue.attribute?.code || attributeValue.attributeCode;
    const valueCode = attributeValue.code || attributeValue.valueCode;
    if (!attributeCode || !valueCode) continue;
    map[attributeCode] = valueCode;
  }

  return map;
}

function normalizeVariations(variations: VariantAvailabilityInput[]): NormalizedVariation[] {
  return variations.map((variation) => ({
    stock: variation.stock,
    stockStatus: variation.stockStatus,
    purchaseAction: variation.purchaseAction ?? undefined,
    preOrderCampaignId: variation.preOrderCampaignId,
    attributes: getVariationAttributeMap(variation),
  }));
}

/**
 * Option is available when a purchasable variant exists that:
 * - uses this option for the current attribute, and
 * - matches selected values only for attributes listed before it in `variantSelectors`.
 *
 * Example: size 50 + material 925 + red OOS but white in stock → strike red only, not size/material/stone.
 */
export function isVariantOptionAvailable(
  variations: NormalizedVariation[],
  variantSelectors: IVariantSelector[],
  attrCode: string,
  optionCode: string,
  selectedAttributes: Record<string, string>,
): boolean {
  const attrIndex = variantSelectors.findIndex((selector) => selector.attribute.code === attrCode);
  if (attrIndex < 0) return false;

  return variations.some((variation) => {
    if (!isVariationAvailableForPurchase(variation)) return false;
    if (variation.attributes[attrCode] !== optionCode) return false;

    return variantSelectors.every((selector, index) => {
      if (index >= attrIndex) return true;

      const code = selector.attribute.code;
      const selectedValue = selectedAttributes[code];
      if (!selectedValue) return true;

      return variation.attributes[code] === selectedValue;
    });
  });
}

export function buildContextualVariantSelectors(
  variantSelectors: IVariantSelector[],
  variations: VariantAvailabilityInput[] | IProductVariation[],
  selectedAttributes: Record<string, string>,
): IVariantSelector[] {
  if (!variantSelectors.length || !variations.length) {
    return variantSelectors;
  }

  const normalizedVariations = normalizeVariations(variations);

  return variantSelectors.map((selector) => ({
    ...selector,
    options: selector.options.map((option) => ({
      ...option,
      available: isVariantOptionAvailable(normalizedVariations, variantSelectors, selector.attribute.code, option.code, selectedAttributes),
    })),
  }));
}
