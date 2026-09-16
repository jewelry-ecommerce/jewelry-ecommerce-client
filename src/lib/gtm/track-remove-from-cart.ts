import { isGtmEnabled, scheduleTracking } from "@/lib/gtm/config";
import { pushEcommerceToDataLayer } from "@/lib/gtm/data-layer";
import {
  GTM_ECOMMERCE_CURRENCY,
  GTM_EVENTS,
  type GtmEcommerceItem,
  type GtmEcommercePayload,
  type GtmRemoveFromCartPayload,
} from "@/lib/gtm/events";
import type { CartApiItem } from "@/utils/api/cart/cart.interface";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import type { AddToCartQuantityTrackSource } from "@/lib/gtm/track-add-to-cart";

export type RemoveFromCartTrackInput = {
  itemId: string;
  itemName: string;
  itemBrand: string;
  itemCategory: string;
  unitPrice: number;
  quantityRemoved: number;
};

const buildEcommerceItem = (input: RemoveFromCartTrackInput, index = 0): GtmEcommerceItem | null => {
  const { itemId, itemName, unitPrice, quantityRemoved } = input;

  if (!itemId || !itemName || quantityRemoved <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
    return null;
  }

  return {
    item_id: itemId,
    item_name: itemName,
    item_brand: input.itemBrand,
    item_category: input.itemCategory,
    price: unitPrice,
    quantity: quantityRemoved,
    index,
  };
};

const pushRemoveFromCartPayload = (input: RemoveFromCartTrackInput): void => {
  if (!isGtmEnabled()) {
    return;
  }

  const item = buildEcommerceItem(input);
  if (!item) {
    return;
  }

  const payload: GtmRemoveFromCartPayload = {
    event: GTM_EVENTS.removeFromCart,
    ecommerce: {
      currency: GTM_ECOMMERCE_CURRENCY,
      value: item.price * item.quantity,
      items: [item],
    },
  };

  pushEcommerceToDataLayer(payload);
};

export const safeTrackRemoveFromCart = (input: RemoveFromCartTrackInput): void => {
  scheduleTracking(() => pushRemoveFromCartPayload(input));
};

export const buildRemoveFromCartInputFromViewItem = (item: CartViewItem, quantityRemoved: number): RemoveFromCartTrackInput => ({
  itemId: String(item.variationId ?? item.id),
  itemName: item.name,
  itemBrand: "",
  itemCategory: "",
  unitPrice: item.unitPrice,
  quantityRemoved,
});

export const buildRemoveFromCartInputFromApiItem = (item: CartApiItem, quantityRemoved: number): RemoveFromCartTrackInput => {
  const unitPrice = item.sellingPriceAfterTaxMinor ?? item.variation?.sellingPriceAfterTaxMinor ?? 0;

  return {
    itemId: item.skuCode || item.variationId || item.id,
    itemName: item.product?.name ?? item.name,
    itemBrand: item.product?.brandName ?? "",
    itemCategory: item.product?.categoryName ?? "",
    unitPrice,
    quantityRemoved,
  };
};

export const safeTrackRemoveFromCartFromViewItem = (item: CartViewItem, quantityRemoved: number): void => {
  safeTrackRemoveFromCart(buildRemoveFromCartInputFromViewItem(item, quantityRemoved));
};

export const safeTrackRemoveFromCartFromApiItem = (item: CartApiItem, quantityRemoved: number): void => {
  safeTrackRemoveFromCart(buildRemoveFromCartInputFromApiItem(item, quantityRemoved));
};

export const buildRemoveFromCartInputFromQuantitySource = (
  item: AddToCartQuantityTrackSource,
  quantityRemoved: number,
): RemoveFromCartTrackInput | null => {
  if (!item.name || item.unitPrice == null || !Number.isFinite(item.unitPrice)) {
    return null;
  }

  return {
    itemId: String(item.variationId ?? item.id),
    itemName: item.name,
    itemBrand: "",
    itemCategory: "",
    unitPrice: item.unitPrice,
    quantityRemoved,
  };
};

export const safeTrackRemoveFromCartFromQuantitySource = (item: AddToCartQuantityTrackSource, quantityRemoved: number): void => {
  const input = buildRemoveFromCartInputFromQuantitySource(item, quantityRemoved);
  if (input) {
    safeTrackRemoveFromCart(input);
  }
};
