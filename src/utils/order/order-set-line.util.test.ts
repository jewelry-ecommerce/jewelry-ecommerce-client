import { describe, expect, it } from "vitest";
import { getOrderLooseItems, getOrderSetLines, mapOrderSetLineToCheckoutItem } from "./order-set-line.util";
import type { OrderDetailItem, OrderSetLine } from "@/utils/api/order/order.interface";

const component: OrderDetailItem = {
  id: "item-1",
  variationId: "variation-1",
  productId: "product-1",
  categoryName: "Nhẫn",
  productName: "Nhẫn",
  variationName: "Nhẫn",
  skuCode: "SKU-1",
  image: "",
  unitPrice: "200000",
  salePrice: "100000",
  quantity: 1,
  lineTotal: "200000",
  discountAmount: "100000",
  finalAmount: "100000",
  setLineId: "set-line-1",
  isKey: true,
};

const setLine: OrderSetLine = {
  type: "SET",
  lineId: "set-line-1",
  setLineId: "set-line-1",
  setId: "set-1",
  name: "Bộ sản phẩm",
  quantity: 1,
  subtotalMinor: 100000,
  originalSubtotalMinor: 200000,
  customerDisplayPrice: {
    currency: "VND",
    sellingPriceAfterTaxMinor: 100000,
    compareAtPriceAfterTaxMinor: 200000,
    discountPercent: 50,
    hasDiscount: true,
  },
  components: [component],
};

describe("order-set-line.util", () => {
  it("uses the SET line and excludes its duplicate components", () => {
    const looseItem = { ...component, id: "item-2", setLineId: null };
    const order = { items: [component, looseItem], lines: [setLine] };

    expect(getOrderSetLines(order)).toEqual([setLine]);
    expect(getOrderLooseItems(order)).toEqual([looseItem]);
  });

  it("maps the BE SET line directly to checkout rendering data", () => {
    expect(mapOrderSetLineToCheckoutItem(setLine)).toMatchObject({
      lineId: "set-line-1",
      setId: "set-1",
      subtotalMinor: 100000,
      compareAtSubtotalMinor: 200000,
      components: [{ variationId: "variation-1", categoryName: "Nhẫn", isKey: true }],
    });
  });
});
