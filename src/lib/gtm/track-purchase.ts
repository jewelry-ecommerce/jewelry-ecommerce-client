import { isGtmEnabled, scheduleTracking } from "@/lib/gtm/config";
import { pushEcommerceToDataLayer } from "@/lib/gtm/data-layer";
import {
  GTM_ECOMMERCE_CURRENCY,
  GTM_EVENTS,
  type GtmEcommerceItem,
  type GtmPurchaseEcommerce,
  type GtmPurchasePayload,
} from "@/lib/gtm/events";
import { getOrderMeByOrderCode, resolveGuestOrderAccess } from "@/utils/api/checkout/checkout.api";
import type { OrderDetailItem, OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import { filterOrderDisplayItems } from "@/utils/order/order-display.util";
import { guestOrderDetailToViewOrder } from "@/utils/order/guest-order-detail.util";
import { readStoredGuestOrderAccessToken } from "@/utils/order/guest-order-access.util";

const PURCHASE_TRACKED_KEY_PREFIX = "gtm:purchase:tracked:";

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

const buildItemDisplayName = (item: OrderDetailItem): string => {
  const base = item.productName?.trim() || "";
  const variation = item.variationName?.trim();
  if (base && variation) {
    return `${base} ${variation}`;
  }
  return base || variation || item.skuCode || "";
};

const resolveOrderItemUnitPrice = (item: OrderDetailItem): number => {
  const salePrice = parseAmount(item.salePrice);
  if (salePrice > 0) {
    return salePrice;
  }

  const quantity = Math.max(1, Math.floor(Number(item.quantity) || 0));
  const finalAmount = parseAmount(item.finalAmount);
  if (finalAmount > 0) {
    return finalAmount / quantity;
  }

  return parseAmount(item.unitPrice);
};

export const mapOrderDetailItemToGtmItem = (item: OrderDetailItem, index: number): GtmEcommerceItem | null => {
  const itemId = item.skuCode?.trim();
  const itemName = buildItemDisplayName(item);
  const quantity = Math.max(0, Math.floor(Number(item.quantity) || 0));
  const unitPrice = resolveOrderItemUnitPrice(item);

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

export const buildPurchaseEcommerceFromOrder = (order: OrderDetailResponse): GtmPurchaseEcommerce | null => {
  const transactionId = order.orderCode?.trim();
  if (!transactionId) {
    return null;
  }

  const displayItems = filterOrderDisplayItems(order.items ?? []);
  const items: GtmEcommerceItem[] = [];

  displayItems.forEach((line, index) => {
    const mapped = mapOrderDetailItemToGtmItem(line, index);
    if (mapped) {
      items.push(mapped);
    }
  });

  if (items.length === 0) {
    return null;
  }

  const subtotal = parseAmount(order.subtotal);
  const discountTotal = parseAmount(order.discountTotal);
  const valueFromOrder = Math.max(0, subtotal - discountTotal);
  const valueFromItems = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const value = valueFromOrder > 0 ? valueFromOrder : valueFromItems;

  if (value <= 0) {
    return null;
  }

  const shippingFee = parseAmount(order.shippingFee);
  const ecommerce: GtmPurchaseEcommerce = {
    transaction_id: transactionId,
    value,
    currency: GTM_ECOMMERCE_CURRENCY,
    items,
  };

  if (shippingFee > 0) {
    ecommerce.shipping = shippingFee;
  }

  return ecommerce;
};

function hasPurchaseBeenTracked(orderCode: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return sessionStorage.getItem(`${PURCHASE_TRACKED_KEY_PREFIX}${orderCode}`) === "1";
  } catch {
    return false;
  }
}

function markPurchaseTracked(orderCode: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(`${PURCHASE_TRACKED_KEY_PREFIX}${orderCode}`, "1");
  } catch {
    // Ignore quota / private mode errors.
  }
}

const pushPurchasePayload = (ecommerce: GtmPurchaseEcommerce): void => {
  if (!isGtmEnabled()) {
    return;
  }

  const payload: GtmPurchasePayload = {
    event: GTM_EVENTS.purchase,
    ecommerce,
  };

  pushEcommerceToDataLayer(payload);
};

export interface TrackPurchaseFromOrderCodeInput {
  orderCode: string;
  isLogin: boolean;
}

/** Fire-and-forget khi trang xác nhận đơn hàng thành công (1 lần / orderCode). */
export const safeTrackPurchaseFromOrderCode = ({ orderCode, isLogin }: TrackPurchaseFromOrderCodeInput): void => {
  const normalizedOrderCode = orderCode.trim();
  if (!normalizedOrderCode || hasPurchaseBeenTracked(normalizedOrderCode)) {
    return;
  }

  scheduleTracking(() => {
    void (async () => {
      try {
        if (hasPurchaseBeenTracked(normalizedOrderCode)) {
          return;
        }

        const guestAccessToken = readStoredGuestOrderAccessToken();
        const order = isLogin
          ? await getOrderMeByOrderCode(normalizedOrderCode)
          : guestAccessToken
            ? guestOrderDetailToViewOrder(await resolveGuestOrderAccess(guestAccessToken))
            : null;

        if (!order?.orderCode?.trim()) {
          return;
        }

        const ecommerce = buildPurchaseEcommerceFromOrder(order);
        if (!ecommerce) {
          return;
        }

        markPurchaseTracked(normalizedOrderCode);
        pushPurchasePayload(ecommerce);
      } catch {
        // Tracking must never break checkout success flow.
      }
    })();
  });
};
