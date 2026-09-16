import { isGtmEnabled, scheduleTracking } from "@/lib/gtm/config";
import { pushEcommerceToDataLayer } from "@/lib/gtm/data-layer";
import { GTM_ECOMMERCE_CURRENCY, GTM_EVENTS, type GtmEcommerceItem, type GtmViewItemPayload } from "@/lib/gtm/events";
import type { IProductBySlugResponse, IProductVariation } from "@/utils/api/product/product.interface";

const VIEW_ITEM_QUANTITY = 1;

export const resolveViewableVariation = (
  product: IProductBySlugResponse,
  selectedVariation?: IProductVariation,
): IProductVariation | undefined => {
  if (selectedVariation) {
    return selectedVariation;
  }
  if (product.defaultVariantId) {
    return product.variants?.find((variant) => variant.id === product.defaultVariantId);
  }
  return product.variants?.[0] ?? product.defaultVariant;
};

export const resolveProductDetailUnitPrice = (variation: IProductVariation): number => {
  const variationPrice = variation.pricing?.sellingPriceAfterTaxMinor;
  if (variationPrice != null && Number.isFinite(Number(variationPrice))) {
    return Number(variationPrice);
  }
  return 0;
};

export const buildViewItemEcommerceItem = (
  product: IProductBySlugResponse,
  variation: IProductVariation,
  index = 0,
): GtmEcommerceItem | null => {
  const itemId = (variation.sku || product.sku)?.trim();
  const itemName = product.name?.trim();
  const unitPrice = resolveProductDetailUnitPrice(variation);

  if (!itemId || !itemName || !Number.isFinite(unitPrice) || unitPrice < 0) {
    return null;
  }

  return {
    item_id: itemId,
    item_name: itemName,
    item_brand: product.brand?.tenantCode ?? "",
    item_category: product.category?.name ?? "",
    price: unitPrice,
    quantity: VIEW_ITEM_QUANTITY,
    index,
  };
};

const pushViewItemPayload = (product: IProductBySlugResponse, variation: IProductVariation): void => {
  if (!isGtmEnabled()) {
    return;
  }

  const item = buildViewItemEcommerceItem(product, variation);
  if (!item) {
    return;
  }

  const payload: GtmViewItemPayload = {
    event: GTM_EVENTS.viewItem,
    ecommerce: {
      currency: GTM_ECOMMERCE_CURRENCY,
      value: item.price * item.quantity,
      items: [item],
    },
  };

  pushEcommerceToDataLayer(payload);
};

/** Fire-and-forget khi PDP load xong (1 lần / slug). */
export const safeTrackViewItemFromProductDetail = (product: IProductBySlugResponse, selectedVariation?: IProductVariation): void => {
  const variation = resolveViewableVariation(product, selectedVariation);
  if (!variation) {
    return;
  }

  scheduleTracking(() => pushViewItemPayload(product, variation));
};
