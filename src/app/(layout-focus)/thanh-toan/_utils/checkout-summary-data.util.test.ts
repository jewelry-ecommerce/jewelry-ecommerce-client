import { describe, expect, it } from "vitest";
import { calculateCheckoutSummaryData } from "./checkout-summary-data.util";
import type { CheckoutSession } from "@/utils/api/checkout/checkout.interface";
import type { SelectedCheckoutVoucher } from "../_components/checkout-voucher/checkout-voucher.mapper";

describe("calculateCheckoutSummaryData", () => {
  it("returns 0đ discount when no vouchers applied", () => {
    const session: CheckoutSession = {
      consentThirdPartySharing: false,
      totalAmount: 695000,
      pricing: {
        subtotal: 695000,
        shippingFee: 0,
        discountTotal: 0,
        taxTotal: 0,
        grandTotal: 695000,
      },
    };

    const summary = calculateCheckoutSummaryData(session, 0, 0, []);

    expect(summary.subtotal).toBe("695.000đ");
    expect(summary.shippingFee).toBe("0đ");
    expect(summary.totalDiscount).toBe("0đ");
    expect(summary.discounts).toEqual([]);
    expect(summary.total).toBe("695.000đ");
  });

  it("formats single order voucher correctly", () => {
    const session: CheckoutSession = {
      consentThirdPartySharing: false,
      totalAmount: 645000,
      pricing: {
        subtotal: 695000,
        shippingFee: 30000,
        discountTotal: 50000,
        cartPromotionSpend: 50000,
        taxTotal: 0,
        grandTotal: 675000,
      },
    };

    const selectedVouchers: SelectedCheckoutVoucher[] = [
      {
        voucherCodeId: "v1",
        code: "SUMMER20",
        codeMask: "SUMMER20",
        title: "Giảm 50K",
      },
    ];

    const summary = calculateCheckoutSummaryData(session, 0, 30000, selectedVouchers);

    expect(summary.subtotal).toBe("695.000đ");
    expect(summary.shippingFee).toBe("30.000đ");
    expect(summary.totalDiscount).toBe("-50.000đ");
    expect(summary.discounts).toEqual([
      {
        label: "Voucher SUMMER20:",
        value: "-50.000đ",
      },
    ]);
    expect(summary.total).toBe("675.000đ");
  });

  it("formats both cart voucher and shipping voucher correctly from OMS pricing", () => {
    const session: CheckoutSession = {
      consentThirdPartySharing: false,
      totalAmount: 645000,
      pricing: {
        subtotal: 695000,
        shippingFee: 0, // discounted to 0 by OMS
        discountTotal: 50000,
        cartPromotionSpend: 50000,
        taxTotal: 0,
        grandTotal: 645000,
      },
    };

    const selectedVouchers: SelectedCheckoutVoucher[] = [
      {
        voucherCodeId: "v1",
        code: "SUMMER20",
        codeMask: "SUMMER20",
        title: "Giảm 50K đơn hàng",
      },
      {
        voucherCodeId: "v2",
        code: "FREESHIP30K",
        codeMask: "FREESHIP30K",
        title: "Miễn phí vận chuyển 30K",
        benefitSummary: "Freeship 30k",
      },
    ];

    const summary = calculateCheckoutSummaryData(session, 0, 30000, selectedVouchers);

    expect(summary.subtotal).toBe("695.000đ");
    expect(summary.shippingFee).toBe("0đ");
    expect(summary.totalDiscount).toBe("-50.000đ");
    expect(summary.total).toBe("645.000đ");
  });

  it("handles points discount correctly", () => {
    const session: CheckoutSession = {
      consentThirdPartySharing: false,
      totalAmount: 695000,
      pricing: {
        subtotal: 695000,
        shippingFee: 0,
        discountTotal: 0,
        taxTotal: 0,
        grandTotal: 695000,
      },
    };

    const summary = calculateCheckoutSummaryData(session, 90, 0, []);

    expect(summary.pointsDiscount).toBe("-100.000đ");
    expect(summary.total).toBe("595.000đ");
  });
});
