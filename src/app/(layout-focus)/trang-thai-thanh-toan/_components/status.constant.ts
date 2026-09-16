import { OrderStatusByOrderCodeResponse } from "@/utils/api/checkout/checkout.interface";

export enum UIStatus {
  SUCCESS = "success",
  FAILED = "failed",
  PENDING = "pending",
  FAILED_PAYMENT = "failed_payment",
}

export const DEDUPING_INTERVAL_MS = 2000;

export type PaymentStatusAccessParams = {
  payooOrderNo: string | null;
};

export const hasPaymentStatusAccess = (params: PaymentStatusAccessParams, storedOrderCode?: string | null): boolean => {
  if (params.payooOrderNo?.trim()) return true;
  if (storedOrderCode?.trim()) return true;
  return false;
};

/** Pre-order lần 1: không có giao dịch thanh toán nên không có guest access token. */
export const isPreOrderFulfillmentParam = (value?: string | null): boolean => {
  const normalized = value?.trim().toLowerCase();
  return normalized === "pre-order" || normalized === "preorder";
};

export interface StatusInfo {
  uiStatus: UIStatus;
  isOrderTimeout: boolean;
  isPaymentTimeout: boolean;
  errorCode: string | null;
}

export const ERROR_MESSAGES: Record<string, { title: string; content: string[] }> = {
  "599": {
    title: "THANH TOÁN CHƯA HOÀN TẤT",
    content: ["Đặt hàng không thành công do khách hàng chủ động hủy giao dịch."],
  },
  "533": {
    title: "THANH TOÁN CHƯA HOÀN TẤT",
    content: ["Phiên thanh toán đã hết hạn."],
  },
  "500": { title: "THANH TOÁN CHƯA HOÀN TẤT", content: ["Lỗi hệ thống từ ngân hàng hoặc kết nối gặp sự cố."] },
  "531": { title: "THANH TOÁN CHƯA HOÀN TẤT", content: ["Lỗi hệ thống từ ngân hàng hoặc kết nối gặp sự cố. Vui lòng thử lại."] },
  "532": { title: "THANH TOÁN CHƯA HOÀN TẤT", content: ["Lỗi hệ thống từ ngân hàng hoặc kết nối gặp sự cố. Vui lòng thử lại."] },
  "597": { title: "THANH TOÁN CHƯA HOÀN TẤT", content: ["Lỗi hệ thống từ ngân hàng hoặc kết nối gặp sự cố. Vui lòng thử lại."] },
  "501": {
    title: "THANH TOÁN CHƯA HOÀN TẤT",
    content: ["Giao dịch không thành công do thẻ bị từ chối, không đủ số dư hoặc thông tin thẻ chưa chính xác."],
  },
  "521": {
    title: "THANH TOÁN CHƯA HOÀN TẤT",
    content: ["Giao dịch không thành công do thẻ bị từ chối, không đủ số dư hoặc thông tin thẻ chưa chính xác."],
  },
  "526": {
    title: "THANH TOÁN CHƯA HOÀN TẤT",
    content: ["Giao dịch không thành công do thẻ bị từ chối, không đủ số dư hoặc thông tin thẻ chưa chính xác."],
  },
  "523": {
    title: "THANH TOÁN CHƯA HOÀN TẤT",
    content: ["Giao dịch không thành công do thẻ bị từ chối, không đủ số dư hoặc thông tin thẻ chưa chính xác."],
  },
  "525": {
    title: "THANH TOÁN CHƯA HOÀN TẤT",
    content: ["Giao dịch không thành công do thẻ bị từ chối, không đủ số dư hoặc thông tin thẻ chưa chính xác."],
  },
  "508": {
    title: "THANH TOÁN CHƯA HOÀN TẤT",
    content: ["Giao dịch không thành công do thẻ bị từ chối, không đủ số dư hoặc thông tin thẻ chưa chính xác."],
  },
  "511": {
    title: "THANH TOÁN CHƯA HOÀN TẤT",
    content: ["Giao dịch không thành công do thẻ bị từ chối, không đủ số dư hoặc thông tin thẻ chưa chính xác."],
  },
  "535": {
    title: "THANH TOÁN CHƯA HOÀN TẤT",
    content: ["Giao dịch không thành công do thẻ bị từ chối, không đủ số dư hoặc thông tin thẻ chưa chính xác."],
  },
  "598": { title: "THANH TOÁN CHƯA HOÀN TẤT", content: ["Đã xảy ra lỗi không xác định trong quá trình thanh toán."] },
  ORDER_MAX_RETRIES_EXCEEDED: {
    title: "THANH TOÁN KHÔNG THÀNH CÔNG",
    content: [
      "Đã hết số lần thanh toán lại. Đơn hàng sẽ được hệ thống hủy khi hết thời gian phiên thanh toán cuối cùng. Vui lòng đặt lại đơn hàng mới.",
    ],
  },
};

export const DEFAULT_MAX_PAYMENT_RETRIES = 3;

export function resolveMaxPaymentRetries(order?: Pick<OrderStatusByOrderCodeResponse, "maxPaymentRetries"> | null): number {
  const max = order?.maxPaymentRetries;
  return typeof max === "number" && Number.isFinite(max) && max > 0 ? max : DEFAULT_MAX_PAYMENT_RETRIES;
}

export function resolvePaymentRetryCount(order?: Pick<OrderStatusByOrderCodeResponse, "paymentRetryCount"> | null): number | null {
  const count = order?.paymentRetryCount;
  return typeof count === "number" && Number.isFinite(count) ? count : null;
}

/** Đã dùng hết retry (1 phiên chính + maxPaymentRetries lần thanh toán lại). */
export function isLastPaymentAttempt(
  order?: Pick<OrderStatusByOrderCodeResponse, "paymentRetryCount" | "maxPaymentRetries"> | null,
): boolean {
  const retryCount = resolvePaymentRetryCount(order);
  if (retryCount === null) return false;
  return retryCount >= resolveMaxPaymentRetries(order);
}

export const normalizePayooStatus = (status: string | null, errorCode: string | null): UIStatus | null => {
  if (status === "1") return UIStatus.SUCCESS;
  if (status === "0") return UIStatus.FAILED;
  if (status === "2") {
    return errorCode === "599" ? UIStatus.FAILED : UIStatus.PENDING;
  }
  return status as UIStatus | null;
};

function buildMaxRetriesExceededStatus(): StatusInfo {
  return {
    uiStatus: UIStatus.FAILED,
    isOrderTimeout: true,
    isPaymentTimeout: false,
    errorCode: "ORDER_MAX_RETRIES_EXCEEDED",
  };
}

export const getStatusInfo = (
  orderStatus: OrderStatusByOrderCodeResponse | undefined,
  initialStatus: UIStatus | null,
  errorCode: string | null,
  now = new Date(),
): StatusInfo => {
  const defaultRes: StatusInfo = {
    uiStatus: initialStatus || UIStatus.PENDING,
    isOrderTimeout: false,
    isPaymentTimeout: false,
    errorCode,
  };

  if (errorCode === "ORDER_MAX_RETRIES_EXCEEDED") {
    return buildMaxRetriesExceededStatus();
  }

  if (!orderStatus) return defaultRes;

  if (orderStatus.paymentStatus === "Paid") {
    return { ...defaultRes, uiStatus: UIStatus.SUCCESS };
  }

  const lastAttempt = isLastPaymentAttempt(orderStatus);
  const orderExpiry = orderStatus.orderExpiresAt ? new Date(orderStatus.orderExpiresAt) : null;
  const linkExpiry = orderStatus.paymentLinkExpiresAt ? new Date(orderStatus.paymentLinkExpiresAt) : null;

  const isOrderDead = !!(orderExpiry && orderExpiry < now);
  const isUserCancelled = orderStatus.orderStatus === "Cancelled";
  const isLinkDead = !!(linkExpiry && linkExpiry < now);
  const isPaymentLinkExpiredState = orderStatus.displayState === "PAYMENT_LINK_EXPIRED";

  if (isUserCancelled || isOrderDead) {
    if (lastAttempt) return buildMaxRetriesExceededStatus();
    return { ...defaultRes, uiStatus: UIStatus.FAILED, isOrderTimeout: isOrderDead };
  }

  if (orderStatus.paymentStatus === "Unpaid" || orderStatus.displayState === "AWAITING_PAYMENT") {
    // COD place-order lands on ?status=success → keep SUCCESS.
    // Do NOT treat COD+Unpaid as success when user is on pending (Payoo) —
    // pre-order /pay can still report leftover paymentMethod=COD while a payment link exists.
    const isAwaitingOnlinePayment =
      initialStatus === UIStatus.PENDING || initialStatus === UIStatus.FAILED_PAYMENT || Boolean(orderStatus.paymentLink?.trim());

    if (orderStatus.paymentMethod === "COD" && !isAwaitingOnlinePayment) {
      return { ...defaultRes, uiStatus: UIStatus.SUCCESS };
    }

    // Lần retry cuối: back/hủy Payoo hoặc hết hạn link → THANH TOÁN KHÔNG THÀNH CÔNG (không countdown UI).
    // BE tự hủy đơn khi hết phiên cuối; FE không invent / không hiển thị đếm ngược.
    if (lastAttempt) {
      const lastAttemptExhausted =
        errorCode === "599" ||
        initialStatus === UIStatus.FAILED ||
        initialStatus === UIStatus.FAILED_PAYMENT ||
        isLinkDead ||
        isPaymentLinkExpiredState;

      if (lastAttemptExhausted) {
        return buildMaxRetriesExceededStatus();
      }
    }

    if (isLinkDead) {
      return { ...defaultRes, uiStatus: UIStatus.FAILED_PAYMENT, isPaymentTimeout: true };
    }

    if (initialStatus === UIStatus.FAILED || initialStatus === UIStatus.SUCCESS || initialStatus === UIStatus.FAILED_PAYMENT) {
      return { ...defaultRes, uiStatus: initialStatus };
    }

    if (errorCode === "599") {
      return { ...defaultRes, uiStatus: UIStatus.FAILED };
    }

    return { ...defaultRes, uiStatus: UIStatus.PENDING };
  }

  return defaultRes;
};

export const isTerminalStatus = (status: UIStatus): boolean => {
  return status === UIStatus.SUCCESS || status === UIStatus.FAILED || status === UIStatus.FAILED_PAYMENT;
};
