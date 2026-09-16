import type { CartSetViewItem, CartViewItem } from "@/utils/api/cart/cart.interface";
import { isCartItemCheckoutEligible, isCartSetViewItem } from "@/utils/api/cart/cart.util";
import {
  CheckoutRequestLineType,
  type CheckoutInitiateLine,
  type CheckoutLooseInitiateLine,
  type CheckoutSetInitiateLine,
} from "@/utils/api/checkout/checkout.interface";
import type { UtmData } from "@/utils/utm/utm.interface";

export type CartCheckoutMode = "selected-eligible" | "all-eligible";

export function buildCheckoutItemPayload({
  variationId,
  quantity,
  selectedPackagingRelationIds,
  utmData,
}: {
  variationId: string;
  quantity: number;
  selectedPackagingRelationIds?: string[];
  utmData?: UtmData | null;
}): CheckoutLooseInitiateLine {
  const packagingIds = selectedPackagingRelationIds?.filter(Boolean) ?? [];

  return {
    type: CheckoutRequestLineType.LOOSE,
    variationId: String(variationId),
    quantity,
    ...(packagingIds.length > 0 ? { selectedPackagingRelationIds: packagingIds } : {}),
    utm_data: utmData ?? null,
  };
}

function buildCheckoutSetItemPayload(item: CartSetViewItem): CheckoutSetInitiateLine | null {
  const lineId = item.lineId?.trim();
  if (!lineId) return null;

  return {
    type: CheckoutRequestLineType.SET,
    lineId,
    setId: item.setId,
    quantity: item.quantity,
    components: item.setComponents.map((component) => ({
      variationId: String(component.variationId ?? component.id),
      utm_data: component.utmData ?? item.utmData ?? null,
    })),
  };
}

export const buildCheckoutItemsPayload = (items: CartViewItem[]): CheckoutInitiateLine[] => {
  const payloads: CheckoutInitiateLine[] = [];
  items.forEach((item) => {
    if (isCartSetViewItem(item)) {
      const setPayload = buildCheckoutSetItemPayload(item);
      if (setPayload) payloads.push(setPayload);
      return;
    }

    payloads.push(
      buildCheckoutItemPayload({
        variationId: String(item.id),
        quantity: item.quantity,
        selectedPackagingRelationIds: item.selectedPackagingRelationIds,
        utmData: item.utmData,
      }),
    );
  });
  return payloads;
};

const isCheckoutReadyCartItem = (item: CartViewItem): boolean =>
  isCartItemCheckoutEligible(item) && (!isCartSetViewItem(item) || Boolean(item.lineId?.trim()));

export const getCheckoutItemsFromCart = (items: CartViewItem[], mode: CartCheckoutMode) => {
  if (mode === "all-eligible") {
    return items.filter(isCheckoutReadyCartItem);
  }

  return items.filter((item) => item.selected && isCheckoutReadyCartItem(item));
};

export const getCheckoutScopeCount = (items: CartViewItem[], mode: CartCheckoutMode) => {
  if (mode === "all-eligible") {
    return items.length;
  }

  return items.filter((item) => item.selected).length;
};

export const computeCartItemsSubtotal = (items: Array<Pick<CartViewItem, "unitPrice" | "quantity">>) =>
  items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
