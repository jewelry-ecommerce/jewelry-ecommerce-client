"use client";

import { useMemo } from "react";
import type { CheckoutSession, CheckoutSessionItem, OrderDetailItem, OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import { useCheckoutShipping } from "@/hooks/checkout/use-checkout-shipping.hook";
import type { PickupAddressValues } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-return-pickup.interface";
import type { OrderProductItemData } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-product-item.interface";
import { exchangeReturnLineAmount, exchangeSaleVnd } from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-pricing.util";

function orderDetailItemToCheckoutLine(item: OrderDetailItem, quantity: number): CheckoutSessionItem {
  const lineTotal = exchangeReturnLineAmount(item, quantity);
  return {
    variationId: String(item.variationId || ""),
    productId: String(item.productId || ""),
    productName: item.productName || "",
    variationName: item.variationName || "",
    skuCode: String(item.skuCode || ""),
    image: item.image || "",
    unitPrice: item.unitPrice,
    salePrice: item.salePrice,
    quantity,
    lineTotal,
    discountAmount: item.discountAmount ?? 0,
    finalAmount: String(lineTotal),
    attributes: item.attributes,
    weightGram: null,
    lengthCm: null,
    widthCm: null,
    heightCm: null,
  };
}

function replacementToCheckoutLine(product: OrderProductItemData, quantity: number): CheckoutSessionItem {
  const lineTotal = exchangeSaleVnd(product.sellingPriceAfterTaxMinor) * quantity;
  return {
    variationId: String(product.productId),
    productId: String(product.productId),
    productName: product.productName || "",
    variationName: "",
    skuCode: String(product.productId),
    image: product.image || "",
    unitPrice: product.sellingPriceAfterTaxMinor,
    salePrice: product.sellingPriceAfterTaxMinor,
    quantity,
    lineTotal,
    discountAmount: 0,
    finalAmount: String(lineTotal),
    weightGram: null,
    lengthCm: null,
    widthCm: null,
    heightCm: null,
  };
}

export function buildExchangeShippingLineItems(
  order: OrderDetailResponse,
  selectedItems: string[],
  exchangeQuantities: Record<string, number>,
  replacementProducts: OrderProductItemData[],
  replacementQuantities: Record<string, number>,
): CheckoutSessionItem[] {
  const lines: CheckoutSessionItem[] = [];

  selectedItems.forEach((id) => {
    const item = order.items.find((i) => i.id === id);
    if (!item) return;
    lines.push(orderDetailItemToCheckoutLine(item, exchangeQuantities[id] || 1));
  });

  replacementProducts.forEach((p) => {
    const qty = replacementQuantities[p.productId] || 1;
    lines.push(replacementToCheckoutLine(p, qty));
  });

  return lines;
}

export interface UseOrderExchangeShippingParams {
  order: OrderDetailResponse;
  pickupAddress: PickupAddressValues;
  pickupAddressValid: boolean;
  selectedItems: string[];
  exchangeQuantities: Record<string, number>;
  replacementProducts: OrderProductItemData[];
  replacementQuantities: Record<string, number>;
  fetchShippingFee: boolean;
}

export function useOrderExchangeShipping({
  order,
  pickupAddress,
  pickupAddressValid,
  selectedItems,
  exchangeQuantities,
  replacementProducts,
  replacementQuantities,
  fetchShippingFee,
}: UseOrderExchangeShippingParams) {
  const shippingLineItems = useMemo(
    () => buildExchangeShippingLineItems(order, selectedItems, exchangeQuantities, replacementProducts, replacementQuantities),
    [order, selectedItems, exchangeQuantities, replacementProducts, replacementQuantities],
  );

  const session = useMemo(
    (): CheckoutSession => ({
      consentThirdPartySharing: false,
      totalAmount: 0,
      items: fetchShippingFee ? shippingLineItems : [],
    }),
    [fetchShippingFee, shippingLineItems],
  );

  const shippingAddress = useMemo(() => {
    if (!pickupAddressValid) {
      return {
        provinceCode: 0,
        provinceName: "",
        wardCode: 0,
        wardName: "",
        addressLine: "",
        receiverPhone: "",
      };
    }
    return {
      provinceCode: pickupAddress.provinceCode,
      provinceName: pickupAddress.provinceName,
      wardCode: pickupAddress.wardCode,
      wardName: pickupAddress.wardName,
      addressLine: pickupAddress.addressLine.trim(),
      receiverPhone: pickupAddress.phone.trim(),
    };
  }, [pickupAddress, pickupAddressValid]);

  return useCheckoutShipping({ session, shippingAddress });
}
