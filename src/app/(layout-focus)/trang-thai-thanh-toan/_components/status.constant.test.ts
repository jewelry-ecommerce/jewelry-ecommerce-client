import { describe, expect, it } from "vitest";
import type { OrderStatusByOrderCodeResponse } from "@/utils/api/checkout/checkout.interface";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@/utils/api/order/order.enum";
import { getStatusInfo, UIStatus } from "./status.constant";

function createStatus(overrides: Partial<OrderStatusByOrderCodeResponse> = {}): OrderStatusByOrderCodeResponse {
  return {
    orderCode: "SEVA-001",
    orderStatus: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID,
    paymentMethod: PaymentMethod.QR_CODE,
    grandTotal: "100000",
    orderExpiresAt: null,
    orderRemainingSeconds: null,
    paymentLink: null,
    paymentLinkExpiresAt: null,
    paymentLinkStatus: null,
    displayState: "AWAITING_PAYMENT",
    ...overrides,
  };
}

describe("getStatusInfo", () => {
  it("keeps COD place-order on success URL as SUCCESS", () => {
    const info = getStatusInfo(createStatus({ paymentMethod: PaymentMethod.COD, displayState: "COD_CONFIRMED" }), UIStatus.SUCCESS, null);
    expect(info.uiStatus).toBe(UIStatus.SUCCESS);
  });

  it("does not flip pending Payoo page to SUCCESS when paymentMethod is leftover COD", () => {
    const info = getStatusInfo(
      createStatus({
        paymentMethod: PaymentMethod.COD,
        paymentLink: "https://payoo.example/pay",
        displayState: "AWAITING_PAYMENT",
      }),
      UIStatus.PENDING,
      null,
    );
    expect(info.uiStatus).toBe(UIStatus.PENDING);
  });

  it("stays PENDING on pending URL even if paymentMethod is COD without link", () => {
    const info = getStatusInfo(createStatus({ paymentMethod: PaymentMethod.COD, paymentLink: null }), UIStatus.PENDING, null);
    expect(info.uiStatus).toBe(UIStatus.PENDING);
  });

  it("returns SUCCESS when payment is Paid", () => {
    const info = getStatusInfo(createStatus({ paymentStatus: PaymentStatus.PAID }), UIStatus.PENDING, null);
    expect(info.uiStatus).toBe(UIStatus.SUCCESS);
  });

  it("keeps PENDING on last retry while payment link is still alive", () => {
    const info = getStatusInfo(
      createStatus({
        paymentRetryCount: 3,
        maxPaymentRetries: 3,
        paymentLink: "https://payoo.example/pay",
        paymentLinkExpiresAt: "2099-01-01T00:00:00.000Z",
      }),
      UIStatus.PENDING,
      null,
    );
    expect(info.uiStatus).toBe(UIStatus.PENDING);
    expect(info.isOrderTimeout).toBe(false);
  });

  it("maps last-retry cancel (599) to THANH TOÁN KHÔNG THÀNH CÔNG without hold countdown", () => {
    const info = getStatusInfo(
      createStatus({
        paymentRetryCount: 3,
        maxPaymentRetries: 3,
        paymentLink: "https://payoo.example/pay",
        paymentLinkExpiresAt: "2099-01-01T00:00:00.000Z",
      }),
      UIStatus.FAILED,
      "599",
    );
    expect(info.uiStatus).toBe(UIStatus.FAILED);
    expect(info.isOrderTimeout).toBe(true);
    expect(info.isPaymentTimeout).toBe(false);
    expect(info.errorCode).toBe("ORDER_MAX_RETRIES_EXCEEDED");
  });

  it("maps last-retry Payoo status=0 cancel to max retries exceeded", () => {
    const info = getStatusInfo(
      createStatus({
        paymentRetryCount: 3,
        maxPaymentRetries: 3,
        paymentLinkExpiresAt: "2099-01-01T00:00:00.000Z",
      }),
      UIStatus.FAILED,
      null,
    );
    expect(info.errorCode).toBe("ORDER_MAX_RETRIES_EXCEEDED");
    expect(info.isOrderTimeout).toBe(true);
  });

  it("maps expired last-retry link to max retries exceeded (no incomplete countdown)", () => {
    const info = getStatusInfo(
      createStatus({
        paymentRetryCount: 3,
        maxPaymentRetries: 3,
        paymentLinkExpiresAt: "2020-01-01T00:00:00.000Z",
      }),
      UIStatus.PENDING,
      null,
    );
    expect(info.uiStatus).toBe(UIStatus.FAILED);
    expect(info.isOrderTimeout).toBe(true);
    expect(info.errorCode).toBe("ORDER_MAX_RETRIES_EXCEEDED");
  });

  it("still shows incomplete payment when cancel happens before last retry", () => {
    const info = getStatusInfo(
      createStatus({
        paymentRetryCount: 2,
        maxPaymentRetries: 3,
        paymentLinkExpiresAt: "2099-01-01T00:00:00.000Z",
      }),
      UIStatus.FAILED,
      "599",
    );
    expect(info.uiStatus).toBe(UIStatus.FAILED);
    expect(info.isOrderTimeout).toBe(false);
    expect(info.errorCode).toBe("599");
  });
});
