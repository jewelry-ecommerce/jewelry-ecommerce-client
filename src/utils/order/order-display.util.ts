import { resolveCustomerDisplayPrice, type CustomerDisplayPrice } from "@/utils/customer-display-price.util";

export type OrderDisplayLine = {
  lineType?: string | null;
  salePrice?: string | null;
  parentOrderItemId?: string | null;
};

export type OrderItemUnitPriceSource = {
  salePrice?: string | null;
  unitPrice?: string | null;
  customerDisplayPrice?: CustomerDisplayPrice;
};

const HIDDEN_ORDER_PACKAGING_LINE_TYPES = new Set(["PACKAGING_INCLUDED", "PACKAGING_OPTIONAL"]);

const normalizeOrderLineType = (lineType?: string | null): string => (lineType || "").toUpperCase();

/**
 * Bao bì/hộp quà kèm — ẩn trên UI lịch sử & chi tiết đơn, vẫn giữ trong dữ liệu đơn/API.
 * Ưu tiên `lineType`. Không ẩn SP chính chỉ vì `salePrice` = 0 / null (pre-order hay thiếu field).
 */
export const isOrderPackagingDisplayLine = (item: OrderDisplayLine): boolean => {
  const lineType = normalizeOrderLineType(item.lineType);
  if (lineType) return HIDDEN_ORDER_PACKAGING_LINE_TYPES.has(lineType);
  // Legacy attached packaging: có parent + giá 0, chưa có lineType
  if (item.parentOrderItemId && Number(item.salePrice ?? 0) === 0) return true;
  return false;
};

export const filterOrderDisplayItems = <T extends OrderDisplayLine>(items: T[]): T[] =>
  items.filter((item) => !isOrderPackagingDisplayLine(item));

export function resolveOrderItemUnitDisplayPrice(item: OrderItemUnitPriceSource) {
  return (
    item.customerDisplayPrice ??
    resolveCustomerDisplayPrice({
      displayPriceAfterTaxMinor: item.salePrice,
      sellingPriceAfterTaxMinor: item.salePrice,
      compareAtPriceAfterTaxMinor: item.unitPrice,
    })
  );
}
