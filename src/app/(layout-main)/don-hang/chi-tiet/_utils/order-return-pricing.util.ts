import type { OrderDetailItem, OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import type { CustomerDisplayPrice } from "@/utils/customer-display-price.util";

/**
 * Interface cấu trúc tối thiểu cần thiết để tính toán giá sản phẩm đổi sang.
 * Dùng structural typing — `OrderProductItemData` (từ _interfaces/) hoàn toàn compatible.
 */
interface ReplacementProductPriceable {
  productId: string;
  sellingPriceAfterTaxMinor: string | number;
}

export function exchangeSaleVnd(value: string | number | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

export type ExchangeDisplayPriceItem = {
  salePrice?: string | number;
  sellingPriceAfterTaxMinor?: string | number;
  unitPrice?: string | number;
  price?: string | number;
  compareAtPriceAfterTaxMinor?: string | number;
  customerDisplayPrice?: CustomerDisplayPrice;
};

/** Đơn giá bán: dòng đơn hàng dùng salePrice, SP catalog đổi sang dùng sellingPriceAfterTaxMinor. */
export function exchangeLineUnitSalePrice(item: ExchangeDisplayPriceItem): number {
  return exchangeSaleVnd(item.customerDisplayPrice?.sellingPriceAfterTaxMinor ?? item.salePrice ?? item.sellingPriceAfterTaxMinor);
}

/** Giá gạch/giá neo: dòng đơn hàng dùng unitPrice/price, SP catalog dùng compareAtPriceAfterTaxMinor. */
export function exchangeLineUnitCompareAtPrice(item: ExchangeDisplayPriceItem): number {
  if (item.customerDisplayPrice?.compareAtPriceAfterTaxMinor != null) {
    return exchangeSaleVnd(item.customerDisplayPrice.compareAtPriceAfterTaxMinor);
  }
  return exchangeSaleVnd(item.unitPrice ?? item.price ?? item.compareAtPriceAfterTaxMinor);
}

/** Giá trị một dòng hàng trả (đơn giá khuyến mãi × SL trả). */
export function exchangeReturnLineAmount(item: OrderDetailItem, returnQty: number): number {
  const cap = item.quantity && item.quantity > 0 ? item.quantity : returnQty;
  const qty = Math.max(0, Math.min(returnQty, cap));
  return exchangeSaleVnd(item.salePrice) * qty;
}

/** Tổng dòng SP đổi (giá bán × SL). */
export function exchangeReplacementLineAmount(salePrice: string | number | undefined, qty: number): number {
  return exchangeSaleVnd(salePrice) * Math.max(0, qty);
}

/** Tổng tiền nhóm "Sản phẩm bạn muốn trả". */
export function computeTotalReturnSaleValue(
  order: OrderDetailResponse,
  selectedItemIds: string[],
  exchangeQuantities: Record<string, number>,
): number {
  return selectedItemIds.reduce((sum, id) => {
    const item = order.items.find((i) => i.id === id);
    if (!item) return sum;
    return sum + exchangeReturnLineAmount(item, exchangeQuantities[id] ?? 1);
  }, 0);
}

/** Tổng tiền nhóm "Sản phẩm bạn muốn đổi sang". */
export function computeTotalReplacementSaleValue(
  replacementProducts: ReplacementProductPriceable[],
  replacementQuantities: Record<string, number>,
): number {
  return replacementProducts.reduce((sum, p) => {
    const qty = replacementQuantities[p.productId] ?? 1;
    return sum + exchangeReplacementLineAmount(p.sellingPriceAfterTaxMinor, qty);
  }, 0);
}

/**
 * Chênh lệch giữa hai phía: (tổng đơn đổi) − (tổng đơn trả).
 * Dương: khách cần bù thêm khi nhận đơn đổi. Âm: tổng đổi thấp hơn tổng trả.
 */
export function computeExchangePriceDifferenceSigned(
  order: OrderDetailResponse,
  selectedItemIds: string[],
  exchangeQuantities: Record<string, number>,
  replacementProducts: ReplacementProductPriceable[],
  replacementQuantities: Record<string, number>,
): number {
  return (
    computeTotalReplacementSaleValue(replacementProducts, replacementQuantities) -
    computeTotalReturnSaleValue(order, selectedItemIds, exchangeQuantities)
  );
}
