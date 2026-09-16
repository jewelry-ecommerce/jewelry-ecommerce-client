import { describe, expect, it } from "vitest";
import { buildPreOrderDetailUrlTemplate, buildPreOrderReservePaymentNotice, isPreOrderReserveCheckout } from "./pre-order-checkout.util";

describe("pre-order-checkout.util", () => {
  it("detects AC1 reserve checkout from BE flags", () => {
    expect(
      isPreOrderReserveCheckout({
        consentThirdPartySharing: false,
        totalAmount: 0,
        checkoutType: "PRE_ORDER",
        paymentRequired: false,
      }),
    ).toBe(true);
  });

  it("is not reserve when payment is required (would be lần 2 style if ever on session)", () => {
    expect(
      isPreOrderReserveCheckout({
        consentThirdPartySharing: false,
        totalAmount: 0,
        checkoutType: "PRE_ORDER",
        paymentRequired: true,
      }),
    ).toBe(false);
  });

  it("is not reserve for retail", () => {
    expect(
      isPreOrderReserveCheckout({
        consentThirdPartySharing: false,
        totalAmount: 0,
        checkoutType: "RETAIL",
        paymentRequired: true,
      }),
    ).toBe(false);
  });

  it("builds payment deferred notice with tenant brand name", () => {
    expect(buildPreOrderReservePaymentNotice("HEARTLOCK")).toBe(
      "Khi hàng sẵn sàng, HEARTLOCK sẽ thông báo qua số điện thoại bạn đã cung cấp để tiến hành thanh toán.",
    );
  });

  it("uses the given brand name as-is", () => {
    expect(buildPreOrderReservePaymentNotice("MEMORIENT")).toBe(
      "Khi hàng sẵn sàng, MEMORIENT sẽ thông báo qua số điện thoại bạn đã cung cấp để tiến hành thanh toán.",
    );
  });

  it("builds detailUrlTemplate without orderCode path segment", () => {
    expect(buildPreOrderDetailUrlTemplate("https://b1-test.sevagoretail.jewelry")).toBe(
      "https://b1-test.sevagoretail.jewelry/don-hang/dat-truoc",
    );
    expect(buildPreOrderDetailUrlTemplate("https://b1-test.sevagoretail.jewelry/")).toBe(
      "https://b1-test.sevagoretail.jewelry/don-hang/dat-truoc",
    );
  });
});
