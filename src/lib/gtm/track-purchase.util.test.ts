import { describe, expect, it } from "vitest";
import { buildPurchaseEcommerceFromOrder, mapOrderDetailItemToGtmItem } from "@/lib/gtm/track-purchase";
import type { OrderDetailItem, OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import { OrderSource, OrderStatus, PaymentMethod, PaymentStatus, ShippingMethod } from "@/utils/api/order/order.enum";

const baseOrderItem: OrderDetailItem = {
  id: "line-1",
  variationId: "var-1",
  productId: "prod-1",
  productName: "Nhẫn Kim Cương Heartlock",
  variationName: "Size 7",
  skuCode: "SKU_HL_001",
  image: "",
  unitPrice: "12000000",
  salePrice: "10000000",
  quantity: 1,
  lineTotal: "10000000",
  discountAmount: "2000000",
  finalAmount: "10000000",
};

const baseOrder: OrderDetailResponse = {
  id: "order-1",
  createdAt: "2026-06-22T00:00:00.000Z",
  orderCode: "SV_2026_001",
  customerId: "cust-1",
  status: OrderStatus.CONFIRMED,
  paymentStatus: PaymentStatus.PAID,
  paymentMethod: PaymentMethod.CREDIT_CARD,
  source: OrderSource.WEBSITE,
  shippingMethod: ShippingMethod.STANDARD,
  shippingAddressSnapshot: {
    lastName: "Nguyen",
    firstName: "Test",
    receiverPhone: "0900000000",
    wardCode: 1,
    wardName: "Phường 1",
    addressLine: "123 Test",
    provinceCode: 1,
    provinceName: "Hà Nội",
  },
  shippingFee: "30000",
  subtotal: "30000000",
  discountTotal: "0",
  taxTotal: "0",
  grandTotal: "30030000",
  note: "",
  notePayment: null,
  errorLog: null,
  items: [
    baseOrderItem,
    {
      ...baseOrderItem,
      id: "line-2",
      skuCode: "SKU_HL_002",
      productName: "Vòng vàng Heartlock",
      variationName: "",
      salePrice: "10000000",
      quantity: 2,
      finalAmount: "20000000",
      lineType: "PRODUCT",
    },
    {
      ...baseOrderItem,
      id: "line-packaging",
      skuCode: "PKG_001",
      productName: "Hộp quà",
      salePrice: "0",
      quantity: 1,
      finalAmount: "0",
      lineType: "PACKAGING_INCLUDED",
    },
  ],
  statusHistory: [],
};

describe("mapOrderDetailItemToGtmItem", () => {
  it("maps order line with sale price and quantity", () => {
    const item = mapOrderDetailItemToGtmItem(baseOrderItem, 0);

    expect(item).toEqual({
      item_id: "SKU_HL_001",
      item_name: "Nhẫn Kim Cương Heartlock Size 7",
      item_brand: "",
      item_category: "",
      price: 10000000,
      quantity: 1,
      index: 0,
    });
  });
});

describe("buildPurchaseEcommerceFromOrder", () => {
  it("builds purchase payload excluding packaging lines and shipping from value", () => {
    const ecommerce = buildPurchaseEcommerceFromOrder(baseOrder);

    expect(ecommerce).toEqual({
      transaction_id: "SV_2026_001",
      value: 30000000,
      currency: "VND",
      shipping: 30000,
      items: [
        expect.objectContaining({ item_id: "SKU_HL_001", quantity: 1, price: 10000000 }),
        expect.objectContaining({ item_id: "SKU_HL_002", quantity: 2, price: 10000000 }),
      ],
    });
    expect(ecommerce?.items).toHaveLength(2);
  });

  it("returns null when order code is missing", () => {
    expect(buildPurchaseEcommerceFromOrder({ ...baseOrder, orderCode: "" })).toBeNull();
  });
});
