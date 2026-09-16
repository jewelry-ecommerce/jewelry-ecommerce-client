import { describe, expect, it, beforeEach } from "vitest";
import { OrderStatus, PaymentStatus } from "@/utils/api/order/order.enum";
import { isPreOrderOrder } from "./pre-order-order.util";
import {
  clearPreOrderDetailOrderCode,
  clearPreOrderPaymentDetail,
  preOrderDetailToViewOrder,
  readPreOrderDetailOrderCode,
  readPreOrderPaymentDetail,
  savePreOrderDetailOrderCode,
  savePreOrderPaymentDetail,
} from "./pre-order-detail.util";

describe("pre-order detail order code storage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("round-trips the order code without exposing it on the URL", () => {
    savePreOrderDetailOrderCode("SEVARETAILB1_268OKEG8");
    expect(readPreOrderDetailOrderCode()).toBe("SEVARETAILB1_268OKEG8");
  });

  it("persists guest access token for reload", async () => {
    const { clearPreOrderAccessToken, readPreOrderAccessToken, savePreOrderAccessToken } = await import("./pre-order-detail.util");

    savePreOrderAccessToken("gpa_v1.opaque-value");
    expect(readPreOrderAccessToken()).toBe("gpa_v1.opaque-value");

    clearPreOrderAccessToken();
    expect(readPreOrderAccessToken()).toBeNull();
  });

  it("resolves gpa token from latest_order for client API headers", async () => {
    const { buildPreOrderAccessRequestConfig, resolveStoredPreOrderAccessToken } = await import("./pre-order-detail.util");

    window.sessionStorage.setItem(
      "latest_order",
      JSON.stringify({ guestOrderAccessToken: "gpa_v1.yXITMqdAUsv4ogyhLlqdL9f1b43rhMZUBq7axZkiC44" }),
    );

    expect(resolveStoredPreOrderAccessToken()).toBe("gpa_v1.yXITMqdAUsv4ogyhLlqdL9f1b43rhMZUBq7axZkiC44");
    expect(buildPreOrderAccessRequestConfig()).toEqual({
      headers: { "x-pre-order-access-token": "gpa_v1.yXITMqdAUsv4ogyhLlqdL9f1b43rhMZUBq7axZkiC44" },
    });
  });

  it("ignores retail goa token for pre-order access header", async () => {
    const { buildPreOrderAccessRequestConfig, resolveStoredPreOrderAccessToken } = await import("./pre-order-detail.util");

    window.sessionStorage.setItem("latest_order", JSON.stringify({ guestOrderAccessToken: "goa_v1.retail-token" }));

    expect(resolveStoredPreOrderAccessToken()).toBeNull();
    expect(buildPreOrderAccessRequestConfig()).toBeUndefined();
  });

  it("detects gpa pre-order access tokens", async () => {
    const { isPreOrderAccessToken } = await import("./pre-order-detail.util");
    expect(isPreOrderAccessToken("gpa_v1.token")).toBe(true);
    expect(isPreOrderAccessToken("goa_v1.retail")).toBe(false);
    expect(isPreOrderAccessToken("")).toBe(false);
  });

  it("builds guest deep-link with #access token", async () => {
    const { buildPreOrderGuestAccessHref } = await import("./pre-order-detail.util");
    expect(buildPreOrderGuestAccessHref("gpa_v1.token")).toBe("/don-hang/dat-truoc#access=gpa_v1.token");
  });

  it("clears stale access token when preparing member detail navigation", async () => {
    const { preparePreOrderMemberDetailNavigation, readPreOrderAccessToken, savePreOrderAccessToken } =
      await import("./pre-order-detail.util");

    savePreOrderAccessToken("gpa_v1.stale-token");
    preparePreOrderMemberDetailNavigation("SEVA_MEMBER_1");

    expect(readPreOrderDetailOrderCode()).toBe("SEVA_MEMBER_1");
    expect(readPreOrderAccessToken()).toBeNull();
  });

  it("ignores blank codes and clears stored value", () => {
    savePreOrderDetailOrderCode("   ");
    expect(readPreOrderDetailOrderCode()).toBeNull();

    savePreOrderDetailOrderCode("CODE-1");
    clearPreOrderDetailOrderCode();
    expect(readPreOrderDetailOrderCode()).toBeNull();
  });
});

describe("pre-order payment detail storage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("round-trips full detail for payment page handoff", () => {
    savePreOrderPaymentDetail({
      orderCode: "PO-1",
      grandTotal: "1500000",
      note: "Giao sáng",
      items: [],
    });

    expect(readPreOrderPaymentDetail()).toEqual({
      orderCode: "PO-1",
      grandTotal: "1500000",
      note: "Giao sáng",
      items: [],
    });
  });

  it("clears payment payload", () => {
    savePreOrderPaymentDetail({ orderCode: "PO-1" });
    clearPreOrderPaymentDetail();
    expect(readPreOrderPaymentDetail()).toBeNull();
  });
});

describe("preOrderDetailToViewOrder", () => {
  it("fills missing order-detail fields so the shared view can render", () => {
    const view = preOrderDetailToViewOrder({ orderCode: "CODE-1", preOrderStatus: "PreOrdered" });

    expect(view.orderCode).toBe("CODE-1");
    expect(view.items).toEqual([]);
    expect(view.statusHistory).toEqual([]);
    expect(view.grandTotal).toBe("0");
    expect(view.shippingAddressSnapshot.addressLine).toBe("");
    expect(view.status).toBe(OrderStatus.PENDING);
    expect(view.paymentStatus).toBe(PaymentStatus.UNPAID);
  });

  it("marks the order as pre-order even when BE omits fulfillmentType", () => {
    const view = preOrderDetailToViewOrder({ orderCode: "CODE-1" });

    expect(view.fulfillmentType).toBe("PRE_ORDER");
    expect(view.preOrderCode).toBe("CODE-1");
    expect(isPreOrderOrder(view)).toBe(true);
  });

  it("keeps values returned by BE", () => {
    const view = preOrderDetailToViewOrder({
      orderCode: "CODE-1",
      grandTotal: "1500000",
      note: "Giao giờ hành chính",
      preOrderStatus: "AwaitingPayment",
      paymentHoldExpiresAt: "2026-08-01T00:00:00.000Z",
    });

    expect(view.grandTotal).toBe("1500000");
    expect(view.note).toBe("Giao giờ hành chính");
    expect(view.preOrderStatus).toBe("AwaitingPayment");
    expect(view.paymentHoldExpiresAt).toBe("2026-08-01T00:00:00.000Z");
  });
});
