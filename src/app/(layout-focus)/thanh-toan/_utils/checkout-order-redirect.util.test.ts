import { describe, expect, it } from "vitest";
import { resolveOrderRedirect } from "./checkout-order-redirect.util";
import type { CheckoutSession, PlaceOrderResponse } from "@/utils/api/checkout/checkout.interface";

describe("resolveOrderRedirect", () => {
  it("redirects pre-order reserve checkout to confirmation page with fulfillment=pre-order", () => {
    const session: CheckoutSession = {
      consentThirdPartySharing: false,
      totalAmount: 0,
      checkoutType: "PRE_ORDER",
      paymentRequired: false,
    };
    const result: PlaceOrderResponse = {
      orderCode: "ORD-PRE-123",
      status: "COMPLETED",
    };

    const redirect = resolveOrderRedirect({
      result,
      session,
      sessionId: "session-1",
      paymentMethod: undefined,
    });

    expect(redirect).toEqual({
      type: "redirect",
      url: "/trang-thai-thanh-toan?status=success&orderCode=ORD-PRE-123&sessionId=session-1&fulfillment=pre-order",
    });
  });

  it("handles online payment (non-COD) with Payoo paymentUrl", () => {
    const session: CheckoutSession = {
      consentThirdPartySharing: false,
      totalAmount: 500000,
    };
    const result: PlaceOrderResponse = {
      orderCode: "ORD-PAYOO-123",
      status: "PENDING",
      paymentUrl: "https://payoo.vn/pay/123",
    };

    const redirect = resolveOrderRedirect({
      result,
      session,
      sessionId: "session-2",
      paymentMethod: "PAYOO",
    });

    expect(redirect).toEqual({
      type: "payoo_payment",
      paymentUrl: "https://payoo.vn/pay/123",
    });
  });

  it("handles online payment (non-COD) with missing paymentUrl error", () => {
    const session: CheckoutSession = {
      consentThirdPartySharing: false,
      totalAmount: 500000,
    };
    const result: PlaceOrderResponse = {
      orderCode: "ORD-PAYOO-123",
      status: "PENDING",
    };

    const redirect = resolveOrderRedirect({
      result,
      session,
      sessionId: "session-2",
      paymentMethod: "PAYOO",
    });

    expect(redirect).toEqual({
      type: "redirect",
      url: "/trang-thai-thanh-toan?status=payoo-create-link-error",
    });
  });

  it("handles COD payment successfully", () => {
    const session: CheckoutSession = {
      consentThirdPartySharing: false,
      totalAmount: 500000,
    };
    const result: PlaceOrderResponse = {
      orderCode: "ORD-COD-123",
      status: "PENDING",
    };

    const redirect = resolveOrderRedirect({
      result,
      session,
      sessionId: "session-3",
      paymentMethod: "COD",
    });

    expect(redirect).toEqual({
      type: "redirect",
      url: "/trang-thai-thanh-toan?status=success&orderCode=ORD-COD-123&sessionId=session-3",
    });
  });
});
