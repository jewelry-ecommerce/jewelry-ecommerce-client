import { describe, expect, it } from "vitest";
import { getOrderDisplayState } from "./order.constant";
import { OrderStatus, PaymentMethod, PaymentStatus } from "./order.enum";

describe("getOrderDisplayState payment remaining notice", () => {
  it("shows remaining attempts on first Payoo cancel (retryCount = 0)", () => {
    const state = getOrderDisplayState({
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      paymentMethod: PaymentMethod.QR_CODE,
      orderExpiresAt: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
      paymentRetryCount: 0,
      maxPaymentRetries: 3,
    });

    expect(state.paymentNotice).toBe("Bạn còn 3/3 lượt thanh toán. Vui lòng hoàn tất thanh toán trong");
    expect(state.paymentCountdownLabel).toMatch(/^\d{2}:\d{2}$/);
  });

  it("shows last-attempt notice when retry count equals max", () => {
    const state = getOrderDisplayState({
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      paymentMethod: PaymentMethod.QR_CODE,
      orderExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      paymentRetryCount: 3,
      maxPaymentRetries: 3,
    });

    expect(state.paymentNotice).toBe("Bạn còn lượt thanh toán cuối cùng. Vui lòng hoàn tất thanh toán trong");
  });
});
