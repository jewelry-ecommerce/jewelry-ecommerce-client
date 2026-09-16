import { isGtmEnabled, scheduleTracking } from "@/lib/gtm/config";
import { pushEcommerceToDataLayer } from "@/lib/gtm/data-layer";
import { GTM_ECOMMERCE_CURRENCY, GTM_EVENTS, type GtmAddToCartPayload, type GtmEcommerceItem } from "@/lib/gtm/events";
import type { CartApiItem } from "@/utils/api/cart/cart.interface";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";

export type AddToCartTrackInput = {
  itemId: string;
  itemName: string;
  itemBrand: string;
  itemCategory: string;
  unitPrice: number;
  quantityAdded: number;
};

const buildEcommerceItem = (input: AddToCartTrackInput, index = 0): GtmEcommerceItem | null => {
  const { itemId, itemName, unitPrice, quantityAdded } = input;

  if (!itemId || !itemName || quantityAdded <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
    return null;
  }

  return {
    item_id: itemId,
    item_name: itemName,
    item_brand: input.itemBrand,
    item_category: input.itemCategory,
    price: unitPrice,
    quantity: quantityAdded,
    index,
  };
};

const pushAddToCartPayload = (input: AddToCartTrackInput): void => {
  if (!isGtmEnabled()) {
    return;
  }

  const item = buildEcommerceItem(input);
  if (!item) {
    return;
  }

  const payload: GtmAddToCartPayload = {
    event: GTM_EVENTS.addToCart,
    ecommerce: {
      currency: GTM_ECOMMERCE_CURRENCY,
      value: item.price * item.quantity,
      items: [item],
    },
  };

  pushEcommerceToDataLayer(payload);
};

/** Fire-and-forget; safe if GTM/dataLayer throws or is missing. */
export const safeTrackAddToCart = (input: AddToCartTrackInput): void => {
  scheduleTracking(() => pushAddToCartPayload(input));
};

export const buildAddToCartInputFromViewItem = (item: CartViewItem, quantityAdded: number): AddToCartTrackInput => ({
  itemId: String(item.variationId ?? item.id),
  itemName: item.name,
  itemBrand: "",
  itemCategory: "",
  unitPrice: item.unitPrice,
  quantityAdded,
});

export const buildAddToCartInputFromApiItem = (item: CartApiItem, quantityAdded: number): AddToCartTrackInput => {
  const unitPrice = item.sellingPriceAfterTaxMinor ?? item.variation?.sellingPriceAfterTaxMinor ?? 0;

  return {
    itemId: item.skuCode || item.variationId || item.id,
    itemName: item.product?.name ?? item.name,
    itemBrand: item.product?.brandName ?? "",
    itemCategory: item.product?.categoryName ?? "",
    unitPrice,
    quantityAdded,
  };
};

export const safeTrackAddToCartFromViewItem = (item: CartViewItem, quantityAdded: number): void => {
  safeTrackAddToCart(buildAddToCartInputFromViewItem(item, quantityAdded));
};

export const safeTrackAddToCartFromApiItem = (item: CartApiItem, quantityAdded: number): void => {
  safeTrackAddToCart(buildAddToCartInputFromApiItem(item, quantityAdded));
};

/** Cart line có đủ field hiển thị (CartViewItem / drawer item) — dùng khi tăng số lượng. */
export type AddToCartQuantityTrackSource = {
  id: string;
  name?: string;
  unitPrice?: number;
  variationId?: string;
};

export const buildAddToCartInputFromQuantitySource = (
  item: AddToCartQuantityTrackSource,
  quantityAdded: number,
): AddToCartTrackInput | null => {
  if (!item.name || item.unitPrice == null || !Number.isFinite(item.unitPrice)) {
    return null;
  }

  return {
    itemId: String(item.variationId ?? item.id),
    itemName: item.name,
    itemBrand: "",
    itemCategory: "",
    unitPrice: item.unitPrice,
    quantityAdded,
  };
};

export const safeTrackAddToCartFromQuantitySource = (item: AddToCartQuantityTrackSource, quantityAdded: number): void => {
  const input = buildAddToCartInputFromQuantitySource(item, quantityAdded);
  if (input) {
    safeTrackAddToCart(input);
  }
};
