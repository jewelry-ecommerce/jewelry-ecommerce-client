import type { CheckoutSession } from "@/utils/api/checkout/checkout.interface";
import type { SelectedCheckoutVoucher } from "../_components/checkout-voucher/checkout-voucher.mapper";
import type { DiscountItem } from "../_components/checkout-summary/checkout-summary.component";
import { formatPrice } from "@/utils/constants/common.constant";
import { POINTS_TO_VND_RATE } from "../_components/checkout.constant";
import { resolveCanonicalCheckoutSummary } from "../_components/checkout.helpers";

export interface CheckoutSummaryDataResult {
  subtotal: string;
  shippingFee: string;
  originalShippingFee?: string;
  totalDiscount: string;
  pointsDiscount?: string;
  total: string;
  discounts: DiscountItem[];
  pointsAvailable: number;
  pointsValue: string;
  earnedPointsText: string;
  finalTotalAmount: number;
}

export function calculateCheckoutSummaryData(
  session: CheckoutSession | null | undefined,
  pointsUsed: number,
  _dynamicShippingFee?: string | number | undefined,
  selectedVouchers: SelectedCheckoutVoucher[] = [],
): CheckoutSummaryDataResult {
  const pricing = session?.pricing;
  const pointsDiscountAmount = pointsUsed > 0 ? Math.round(pointsUsed * POINTS_TO_VND_RATE) : 0;
  const canonicalSummary = resolveCanonicalCheckoutSummary(pricing, pointsDiscountAmount);

  const cartDiscountAmount = canonicalSummary.cartPromotionDiscountMinor;
  const totalDiscountAmount = cartDiscountAmount;

  const discounts: DiscountItem[] = [];

  if (totalDiscountAmount > 0) {
    if (selectedVouchers.length === 1) {
      const v = selectedVouchers[0];
      const label = `Voucher ${v.code || v.codeMask || v.title}:`;
      discounts.push({ label, value: `-${formatPrice(totalDiscountAmount)}` });
    } else if (selectedVouchers.length > 1) {
      const otherVouchers = selectedVouchers;
      otherVouchers.forEach((v) => {
        if (cartDiscountAmount > 0) {
          discounts.push({
            label: `Voucher ${v.code || v.codeMask || v.title}:`,
            value: `-${formatPrice(cartDiscountAmount)}`,
          });
        }
      });
    } else {
      const couponCodes = session?.couponCodes || [];
      if (couponCodes.length === 1) {
        discounts.push({
          label: `Voucher ${couponCodes[0]}:`,
          value: `-${formatPrice(totalDiscountAmount)}`,
        });
      } else if (couponCodes.length > 1) {
        couponCodes.forEach((code) => {
          discounts.push({
            label: `Voucher ${code}:`,
            value: `-${formatPrice(cartDiscountAmount)}`,
          });
        });
      } else if (cartDiscountAmount > 0) {
        discounts.push({
          label: "Khuyến mãi:",
          value: `-${formatPrice(cartDiscountAmount)}`,
        });
      }
    }
  }

  return {
    subtotal: formatPrice(canonicalSummary.subtotalMinor),
    shippingFee: formatPrice(canonicalSummary.shippingFeeMinor),
    originalShippingFee: undefined,
    totalDiscount: totalDiscountAmount > 0 ? `-${formatPrice(totalDiscountAmount)}` : "0đ",
    pointsDiscount: pointsUsed > 0 ? `-${formatPrice(pointsDiscountAmount)}` : undefined,
    total: formatPrice(canonicalSummary.finalTotalMinor),
    discounts,
    pointsAvailable: 9000,
    pointsValue: "Giảm 10.000.000đ",
    earnedPointsText: `Bạn sẽ nhận được 0 điểm sau khi đơn hàng được giao thành công.`,
    finalTotalAmount: canonicalSummary.finalTotalMinor,
  };
}
