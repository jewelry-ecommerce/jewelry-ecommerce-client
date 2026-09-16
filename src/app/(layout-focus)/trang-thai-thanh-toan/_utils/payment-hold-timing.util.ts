/** Các field thời gian giữ đơn / link thanh toán — chỉ lấy từ BE. */
export interface PaymentHoldTimingSource {
  paymentLinkExpiresAt?: string | null;
  orderExpiresAt?: string | null;
  orderRemainingSeconds?: number | null;
}

export interface PaymentHoldTiming {
  paymentLinkExpiresAt: string | null;
  orderExpiresAt: string | null;
  orderRemainingSeconds: number | null;
}

export interface PaymentHoldCountdownParams {
  expiryAt?: string;
  initialSeconds?: number;
}

/**
 * - payment-session: đếm theo paymentLinkExpiresAt (BE) — trang ĐANG CHỜ THANH TOÁN
 * - order-hold: đếm theo orderExpiresAt / orderRemainingSeconds (BE) — trang THANH TOÁN CHƯA HOÀN TẤT
 */
export type PaymentHoldCountdownMode = "payment-session" | "order-hold";

function hasExpiryTimestamp(value: string | null | undefined): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  return Number.isFinite(new Date(value).getTime());
}

const EMPTY_PAYMENT_HOLD_TIMING: PaymentHoldTiming = {
  paymentLinkExpiresAt: null,
  orderExpiresAt: null,
  orderRemainingSeconds: null,
};

/** Normalize field timing từ API — không invent / hardcode duration phía FE. */
export function resolvePaymentHoldTiming(source: PaymentHoldTimingSource | null | undefined): PaymentHoldTiming {
  if (!source) return EMPTY_PAYMENT_HOLD_TIMING;

  return {
    paymentLinkExpiresAt: hasExpiryTimestamp(source.paymentLinkExpiresAt) ? source.paymentLinkExpiresAt : null,
    orderExpiresAt: hasExpiryTimestamp(source.orderExpiresAt) ? source.orderExpiresAt : null,
    orderRemainingSeconds:
      typeof source.orderRemainingSeconds === "number" && source.orderRemainingSeconds > 0 ? source.orderRemainingSeconds : null,
  };
}

/**
 * Countdown 100% từ BE:
 * - payment-session: chỉ paymentLinkExpiresAt
 * - order-hold: chỉ orderExpiresAt, thiếu thì orderRemainingSeconds
 * Không fallback snapshot / không hardcode 15p–60p.
 */
export function resolvePaymentHoldCountdownParams(
  timing: PaymentHoldTimingSource | null | undefined,
  options?: { mode?: PaymentHoldCountdownMode },
): PaymentHoldCountdownParams {
  const mode = options?.mode ?? "payment-session";
  const resolved = resolvePaymentHoldTiming(timing);

  if (mode === "order-hold") {
    if (resolved.orderExpiresAt) {
      return { expiryAt: resolved.orderExpiresAt };
    }

    if (resolved.orderRemainingSeconds !== null) {
      return { initialSeconds: resolved.orderRemainingSeconds };
    }

    return {};
  }

  if (resolved.paymentLinkExpiresAt) {
    return { expiryAt: resolved.paymentLinkExpiresAt };
  }

  return {};
}
