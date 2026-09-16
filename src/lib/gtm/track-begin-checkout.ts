import { isGtmEnabled, scheduleTracking } from "@/lib/gtm/config";
import { pushEcommerceToDataLayer } from "@/lib/gtm/data-layer";
import {
  GTM_ECOMMERCE_CURRENCY,
  GTM_EVENTS,
  type GtmBeginCheckoutPayload,
  type GtmEcommerceItem,
  type GtmEcommercePayload,
} from "@/lib/gtm/events";
import type { CheckoutSession, CheckoutSessionItem } from "@/utils/api/checkout/checkout.interface";
import { flattenCheckoutSessionItems } from "@/utils/api/checkout/checkout.util";

const parseAmount = (value: string | number | undefined): number => {
  if (value == null) {
    return 0;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const parsed = Number(String(value).replace(/[^\d.-]/g, "") || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildItemDisplayName = (item: CheckoutSessionItem): string => {
  const base = item.productName?.trim() || "";
  const variation = item.variationName?.trim();
  if (base && variation) {
    return `${base} ${variation}`;
  }
  return base || variation || item.skuCode || "";
};

export const mapCheckoutSessionItemToGtmItem = (item: CheckoutSessionItem, index: number): GtmEcommerceItem | null => {
  const itemId = item.skuCode?.trim();
  const itemName = buildItemDisplayName(item);
  const quantity = Math.max(0, Math.floor(Number(item.quantity) || 0));
  const unitPrice = parseAmount(item.salePrice) || parseAmount(item.unitPrice);

  if (!itemId || !itemName || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
    return null;
  }

  return {
    item_id: itemId,
    item_name: itemName,
    item_brand: "",
    item_category: "",
    price: unitPrice,
    quantity,
    index,
  };
};

export const buildBeginCheckoutEcommerce = (session: CheckoutSession): GtmEcommercePayload | null => {
  const lineItems = flattenCheckoutSessionItems(session.items ?? []);
  const items: GtmEcommerceItem[] = [];

  lineItems.forEach((line, index) => {
    const mapped = mapCheckoutSessionItemToGtmItem(line, index);
    if (mapped) {
      items.push(mapped);
    }
  });

  const value = parseAmount(session.pricing?.subtotal);

  if (items.length === 0 || value <= 0) {
    return null;
  }

  return {
    currency: GTM_ECOMMERCE_CURRENCY,
    value,
    items,
  };
};

const pushBeginCheckoutPayload = (ecommerce: GtmEcommercePayload): void => {
  if (!isGtmEnabled()) {
    return;
  }

  const payload: GtmBeginCheckoutPayload = {
    event: GTM_EVENTS.beginCheckout,
    ecommerce,
  };

  pushEcommerceToDataLayer(payload);
};

/** Fire-and-forget khi user vào trang checkout (session đã có items). */
export const safeTrackBeginCheckoutFromSession = (session: CheckoutSession): void => {
  scheduleTracking(() => {
    const ecommerce = buildBeginCheckoutEcommerce(session);
    if (ecommerce) {
      pushBeginCheckoutPayload(ecommerce);
    }
  });
};
