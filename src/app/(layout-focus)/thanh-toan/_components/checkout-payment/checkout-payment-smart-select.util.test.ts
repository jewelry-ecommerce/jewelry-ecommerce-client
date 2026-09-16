import { describe, expect, it } from "vitest";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@/utils/api/order/order.enum";
import {
  getFirstPaymentMethodId,
  getFirstSelectablePaymentMethodId,
  resolvePreferredPaymentMethodFromOrders,
  resolveSelectablePaymentMethodId,
} from "./checkout-payment-smart-select.util";

describe("checkout-payment-smart-select", () => {
  it("uses first listed method as guest fallback", () => {
    expect(getFirstPaymentMethodId()).toBe(PaymentMethod.QR_CODE);
  });

  it("skips COD and installment when both are disabled", () => {
    expect(
      getFirstSelectablePaymentMethodId({
        isCodDisabled: true,
        isInstallmentDisabled: true,
      }),
    ).toBe(PaymentMethod.QR_CODE);
  });

  it("prefers last successful paid order method", () => {
    const preferred = resolvePreferredPaymentMethodFromOrders(
      [
        {
          status: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.FAILED,
          paymentMethod: PaymentMethod.MOMO_WALLET,
        },
        {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
          paymentMethod: PaymentMethod.ZALO_PAY,
        },
      ],
      PaymentMethod.QR_CODE,
    );
    expect(preferred).toBe(PaymentMethod.ZALO_PAY);
  });

  it("falls back when there is no successful order", () => {
    const preferred = resolvePreferredPaymentMethodFromOrders(
      [
        {
          status: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.UNPAID,
          paymentMethod: PaymentMethod.COD,
        },
      ],
      PaymentMethod.QR_CODE,
    );
    expect(preferred).toBe(PaymentMethod.QR_CODE);
  });

  it("remaps COD to first selectable method when COD is disabled by amount", () => {
    expect(
      resolveSelectablePaymentMethodId(PaymentMethod.COD, {
        isCodDisabled: true,
        isInstallmentDisabled: false,
      }),
    ).toBe(PaymentMethod.QR_CODE);
  });

  it("treats non-cancelled COD as a successful preference source", () => {
    const preferred = resolvePreferredPaymentMethodFromOrders(
      [
        {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.UNPAID,
          paymentMethod: PaymentMethod.COD,
        },
      ],
      PaymentMethod.QR_CODE,
    );
    expect(preferred).toBe(PaymentMethod.COD);
  });
});
