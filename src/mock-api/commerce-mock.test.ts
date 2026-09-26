import { describe, expect, it } from "vitest";
import { CheckoutRequestLineType } from "@/utils/api/checkout/checkout.interface";
import { PaymentMethod } from "@/utils/api/order/order.enum";
import {
  getMockCartItems,
  getMockCheckoutSession,
  getMockOrderDetail,
  getMockOrderList,
  initiateMockCheckout,
  placeMockOrder,
  updateMockCart,
  type MockState,
} from "./commerce-mock";

const emptyState: MockState = { cart: [], orders: [], wishlist: [] };

describe("jewelry demo commerce flow", () => {
  it("adds a catalog SKU and persists its quantity", () => {
    const state = updateMockCart(emptyState, { items: [{ variationId: "jewelry-sku-1", quantity: 2 }] });
    expect(getMockCartItems(state.cart)).toMatchObject([{ variationId: "jewelry-sku-1", quantity: 2 }]);
  });

  it("creates a COD checkout and an order with the same product and total", () => {
    const session = initiateMockCheckout({ items: [{ type: CheckoutRequestLineType.LOOSE, variationId: "jewelry-sku-1", quantity: 2 }] });
    const address = {
      firstName: "Demo User",
      receiverPhone: "0901234567",
      provinceCode: 79,
      provinceName: "Thành phố Hồ Chí Minh",
      wardCode: 26734,
      wardName: "Phường Bến Thành",
      addressLine: "123 Lê Lợi",
    };
    const order = placeMockOrder({ ...session, address }, { paymentMethod: PaymentMethod.COD, consent: true });
    expect(order).not.toBeNull();
    if (!order) return;
    const detail = getMockOrderDetail(order);
    expect(detail.items[0]).toMatchObject({ variationId: "jewelry-sku-1", quantity: 2 });
    expect(Number(detail.grandTotal)).toBe(getMockCheckoutSession(session).totalAmount);
    expect(getMockOrderList([order]).total).toBe(1);
  });

  it("rejects online payment in this demo", () => {
    const session = initiateMockCheckout({ items: [{ type: CheckoutRequestLineType.LOOSE, variationId: "jewelry-sku-1", quantity: 1 }] });
    expect(
      placeMockOrder(
        {
          ...session,
          address: {
            firstName: "Demo",
            receiverPhone: "0901234567",
            provinceCode: 79,
            provinceName: "HCM",
            wardCode: 26734,
            wardName: "Bến Thành",
            addressLine: "123",
          },
        },
        { paymentMethod: PaymentMethod.MOMO_WALLET, consent: true },
      ),
    ).toBeNull();
  });
});
