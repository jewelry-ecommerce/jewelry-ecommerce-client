import { resolveElapsedMs } from "@/utils/format";
import {
  getPreOrderDisplayState,
  isConvertedOrderStatus,
  isPreOrderOrder,
  PreOrderStatusCode,
} from "@/utils/api/pre-order/pre-order-order.util";
import { IS_PRODUCT_REVIEW_UI_ENABLED } from "@/utils/constants/commerce-feature.constant";
import { ORDER_STATUS_LABEL, OrderStatus, PaymentMethod, PaymentStatus } from "./order.enum";
import type { OrderDetailResponse, OrderListItem } from "./order.interface";

type SharedOrderDisplayData = Pick<
  OrderListItem,
  | "status"
  | "paymentStatus"
  | "paymentMethod"
  | "paymentFailedAt"
  | "paymentLink"
  | "paymentLinkExpiresAt"
  | "paymentLinkStatus"
  | "deliveredAt"
  | "completedAt"
> &
  Partial<
    Pick<
      OrderDetailResponse,
      | "paymentMethod"
      | "paymentFailedAt"
      | "paymentLink"
      | "paymentLinkExpiresAt"
      | "paymentLinkStatus"
      | "deliveredAt"
      | "completedAt"
      | "fulfillmentType"
      | "preOrderStatus"
      | "fulfillmentSummary"
      | "paymentHoldExpiresAt"
    >
  > & {
    orderExpiresAt?: string | null;
    orderRemainingSeconds?: number | null;
    paymentRetryCount?: number | null;
    maxPaymentRetries?: number | null;
    displayState?: string | null;
    orderReturnCode?: string | null;
  };

export type OrderDisplayActionType =
  | "PAYMENT"
  | "CANCEL"
  | "COMPLETE"
  | "WRITE_REVIEW"
  | "VIEW_REVIEW"
  | "REPURCHASE"
  | "RETURN"
  | "VIEW_RETURN_EXCHANGE"
  | "WAITING_RETURN_EXCHANGE";

export interface OrderStatusInfo {
  label: string;
  bg: string;
  color: string;
  tone: "success" | "error" | "processing" | "shipping" | "default";
}

export interface OrderDisplayState {
  statusInfo: OrderStatusInfo;
  returnNotice: string | null;
  paymentNotice: string | null;
  paymentCountdownLabel: string | null;
  actionTypes: OrderDisplayActionType[];
  /** Pre-order: disable primary payment CTA when 48h hold elapsed. */
  isPaymentActionDisabled?: boolean;
  /** Pre-order: hold timed out — FE should notify + reload. */
  isPaymentHoldExpired?: boolean;
}

const PAYMENT_ERROR_ACTION_WINDOW_MINUTES = 30;
const PAYMENT_ERROR_ACTION_WINDOW_MS = PAYMENT_ERROR_ACTION_WINDOW_MINUTES * 60 * 1000;
const REVIEW_AND_RETURN_WINDOW_DAYS = 15;

const resolveRemainingMs = (dateValue?: Date | string | null, now: number = Date.now()): number | null => {
  if (!dateValue) return null;
  const timestamp = new Date(dateValue).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(timestamp - now, 0);
};

const resolvePendingOrderRemainingMs = (order: SharedOrderDisplayData, now: number) => {
  if (order.status !== OrderStatus.PENDING) return null;
  if (order.paymentStatus !== PaymentStatus.UNPAID) return null;
  return resolveRemainingMs(order.orderExpiresAt, now);
};

const formatRemainingDuration = (remainingMs: number | null) => {
  if (remainingMs === null || remainingMs <= 0) return null;
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const resolveElapsedMinutes = (dateValue?: Date | string | null, now: number = Date.now()) => {
  const elapsedMs = resolveElapsedMs(dateValue, now);
  return elapsedMs === null ? null : elapsedMs / (1000 * 60);
};

const resolveElapsedDays = (dateValue?: Date | string | null, now: number = Date.now()) => {
  const elapsedMs = resolveElapsedMs(dateValue, now);
  return elapsedMs === null ? null : elapsedMs / (1000 * 60 * 60 * 24);
};

const getReturnableDaysLeft = (elapsedDays: number | null) =>
  elapsedDays === null ? 0 : Math.max(REVIEW_AND_RETURN_WINDOW_DAYS - Math.floor(elapsedDays), 0);

export const hasActivePaymentLink = (order: SharedOrderDisplayData, now: number = Date.now()) => {
  if (order.status !== OrderStatus.PENDING) return false;
  if (order.paymentStatus === PaymentStatus.PAID) return false;
  if (order.paymentMethod === PaymentMethod.COD) return false;
  if (!order.paymentLink) return false;
  if (order.paymentLinkStatus && order.paymentLinkStatus !== "ACTIVE") return false;
  const remainingMs = resolveRemainingMs(order.paymentLinkExpiresAt, now);
  return remainingMs !== null && remainingMs > 0;
};

const getPaymentErrorRemainingMs = (order: SharedOrderDisplayData, now: number = Date.now()) => {
  if (!isPaymentErrorOrder(order)) return null;
  const paymentFailedTimestamp = order.paymentFailedAt ? new Date(order.paymentFailedAt).getTime() : NaN;
  if (Number.isFinite(paymentFailedTimestamp)) {
    return Math.max(paymentFailedTimestamp + PAYMENT_ERROR_ACTION_WINDOW_MS - now, 0);
  }
  return PAYMENT_ERROR_ACTION_WINDOW_MS;
};

export const isPaymentErrorOrder = (order: Pick<SharedOrderDisplayData, "status" | "paymentStatus">) =>
  order.status === OrderStatus.PENDING && order.paymentStatus === PaymentStatus.FAILED;

export const getOrderStatusInfo = (
  order: Pick<SharedOrderDisplayData, "status" | "paymentStatus" | "displayState" | "paymentRetryCount" | "orderReturnCode">,
): OrderStatusInfo => {
  if (order.status === OrderStatus.PENDING && order.displayState === "PAYMENT_LINK_EXPIRED" && order.paymentRetryCount === 3) {
    return { label: "Đã hủy", bg: "#E5E5E5", color: "#737373", tone: "error" };
  }
  if (isPaymentErrorOrder(order)) {
    return { label: "Lỗi thanh toán", bg: "#FEE2E2", color: "#EF4444", tone: "error" };
  }
  switch (order.status) {
    case OrderStatus.PENDING:
      return { label: ORDER_STATUS_LABEL[OrderStatus.PENDING], bg: "#E5E7EB", color: "#6B7280", tone: "default" };
    case OrderStatus.CONFIRMED:
      return { label: ORDER_STATUS_LABEL[OrderStatus.CONFIRMED], bg: "#FEF9C3", color: "#EAB308", tone: "processing" };
    case OrderStatus.PACKED:
      return { label: ORDER_STATUS_LABEL[OrderStatus.PACKED], bg: "#E0F2FE", color: "#0BA5EC", tone: "processing" };
    case OrderStatus.PICKING:
      return { label: ORDER_STATUS_LABEL[OrderStatus.PICKING], bg: "#FEF9C3", color: "#EAB308", tone: "processing" };
    case OrderStatus.SHIPPING:
    case OrderStatus.IN_TRANSIT:
      return { label: ORDER_STATUS_LABEL[OrderStatus.SHIPPING], bg: "#DBEAFE", color: "#3B82F6", tone: "shipping" };
    case OrderStatus.DELIVERED: {
      return order.orderReturnCode
        ? { label: "Chờ xử lý", bg: "#FEF3C7", color: "#D97706", tone: "processing" }
        : {
            label: ORDER_STATUS_LABEL[OrderStatus.DELIVERED],
            bg: "#019A011F",
            color: "#019A01",
            tone: "success",
          };
    }
    case OrderStatus.DELIVERY_FAILED:
      return { label: ORDER_STATUS_LABEL[OrderStatus.DELIVERY_FAILED], bg: "#FFEAD5", color: "#FB6514", tone: "error" };
    case OrderStatus.COMPLETED:
      return { label: ORDER_STATUS_LABEL[OrderStatus.COMPLETED], bg: "#ECFFD0", color: "#7B9E48", tone: "success" };
    case OrderStatus.CANCELLED:
      return { label: ORDER_STATUS_LABEL[OrderStatus.CANCELLED], bg: "#E5E5E5", color: "#737373", tone: "error" };
    case OrderStatus.RETURN_PROCESSING:
      return {
        label: ORDER_STATUS_LABEL[OrderStatus.RETURN_PROCESSING],
        bg: "#FEF3C7",
        color: "#D97706",
        tone: "processing",
      };
    case OrderStatus.RETURNED:
      return { label: ORDER_STATUS_LABEL[OrderStatus.RETURNED], bg: "#F5F5F5", color: "#595959", tone: "default" };
    case OrderStatus.REFUNDED:
      return { label: ORDER_STATUS_LABEL[OrderStatus.REFUNDED], bg: "#ECFFD0", color: "#7B9E48", tone: "success" };
    default:
      return { label: order.status, bg: "#F5F5F5", color: "#595959", tone: "default" };
  }
};

export const ORDER_DISPLAY_ACTION_LABELS: Record<OrderDisplayActionType, string> = {
  PAYMENT: "Thanh toán lại",
  CANCEL: "Hủy đơn",
  COMPLETE: "Hoàn tất đơn hàng",
  WRITE_REVIEW: "Viết đánh giá",
  VIEW_REVIEW: "Xem đánh giá",
  REPURCHASE: "Mua lại",
  RETURN: "Đổi trả / hoàn tiền",
  VIEW_RETURN_EXCHANGE: "Xem chi tiết",
  WAITING_RETURN_EXCHANGE: "Hủy yêu cầu",
};

export const getOrderStatusInfoByStatus = (status: OrderStatus | string): OrderStatusInfo =>
  getOrderStatusInfo({ status: status as OrderStatus, paymentStatus: PaymentStatus.PAID });

export const getOrderDisplayState = (
  order: SharedOrderDisplayData,
  now: number = Date.now(),
  hasReviewedOrder?: boolean,
): OrderDisplayState => {
  // Chỉ field `status === "Converted"` → badge "Đã đặt hàng" (không check preOrderStatus / SUCCESS).
  if (isConvertedOrderStatus(order.status)) {
    return getPreOrderDisplayState({ ...order, preOrderStatus: PreOrderStatusCode.CONVERTED }, now);
  }

  if (isPreOrderOrder(order)) {
    return getPreOrderDisplayState(order, now);
  }

  const maxRetries = order.maxPaymentRetries || 3;
  const currentRetry = order.paymentRetryCount || 0;
  const isLastAttempt = order.status === OrderStatus.PENDING && currentRetry === maxRetries;
  const isExpiredLastAttempt = isLastAttempt && order.displayState === "PAYMENT_LINK_EXPIRED";
  const effectiveOrder = isExpiredLastAttempt ? { ...order, status: OrderStatus.CANCELLED } : order;

  const pendingOrderRemainingMs = isLastAttempt ? null : resolvePendingOrderRemainingMs(effectiveOrder, now);
  const lastAttemptRemainingMs = isLastAttempt ? resolveRemainingMs(effectiveOrder.paymentLinkExpiresAt, now) : null;
  const paymentErrorRemainingMs = getPaymentErrorRemainingMs(effectiveOrder, now);
  const paymentFailedElapsedMinutes = resolveElapsedMinutes(effectiveOrder.paymentFailedAt, now);
  const deliveredElapsedDays = resolveElapsedDays(effectiveOrder.deliveredAt, now);
  const completedElapsedDays = resolveElapsedDays(effectiveOrder.completedAt, now);
  const deliveredReturnableDaysLeft = getReturnableDaysLeft(deliveredElapsedDays);

  const isWithinDeliveredReviewWindow = deliveredElapsedDays !== null && deliveredElapsedDays <= REVIEW_AND_RETURN_WINDOW_DAYS;
  const isWithinCompletedReviewWindow = completedElapsedDays !== null && completedElapsedDays <= REVIEW_AND_RETURN_WINDOW_DAYS;
  const actionTypes: OrderDisplayActionType[] = [];

  switch (effectiveOrder.status) {
    case OrderStatus.PENDING:
      if (!isLastAttempt && effectiveOrder.paymentMethod !== PaymentMethod.COD && effectiveOrder.paymentStatus !== PaymentStatus.PAID) {
        actionTypes.push("PAYMENT");
      }
      actionTypes.push("CANCEL");
      break;
    case OrderStatus.DELIVERED:
      if (order.orderReturnCode) {
        actionTypes.push("VIEW_RETURN_EXCHANGE");
        actionTypes.push("WAITING_RETURN_EXCHANGE");
        break;
      }

      if (isWithinDeliveredReviewWindow) {
        if (IS_PRODUCT_REVIEW_UI_ENABLED && hasReviewedOrder === true) actionTypes.push("VIEW_REVIEW");
        else if (IS_PRODUCT_REVIEW_UI_ENABLED && hasReviewedOrder === false) actionTypes.push("WRITE_REVIEW");
        actionTypes.push("RETURN");
      } else {
        if (IS_PRODUCT_REVIEW_UI_ENABLED && hasReviewedOrder === true) actionTypes.push("VIEW_REVIEW");
        actionTypes.push("REPURCHASE");
      }
      break;
    case OrderStatus.COMPLETED:
      if (isWithinCompletedReviewWindow) {
        if (IS_PRODUCT_REVIEW_UI_ENABLED && hasReviewedOrder === true) actionTypes.push("VIEW_REVIEW");
        else if (IS_PRODUCT_REVIEW_UI_ENABLED && hasReviewedOrder === false) actionTypes.push("WRITE_REVIEW");
      } else if (IS_PRODUCT_REVIEW_UI_ENABLED && hasReviewedOrder === true) {
        actionTypes.push("VIEW_REVIEW");
      }
      actionTypes.push("REPURCHASE");
      break;
    case OrderStatus.CANCELLED:
      actionTypes.push("REPURCHASE");
      break;
    case OrderStatus.RETURN_PROCESSING:
    case OrderStatus.RETURNED:
    case OrderStatus.REFUNDED:
      actionTypes.push("VIEW_RETURN_EXCHANGE");
      break;
    default:
      if (order.orderReturnCode) {
        actionTypes.push("VIEW_RETURN_EXCHANGE");
      }
      break;
  }

  const isDeliveredReturnProcessing = effectiveOrder.status === OrderStatus.DELIVERED && Boolean(order.orderReturnCode?.trim());

  const returnNotice =
    effectiveOrder.status === OrderStatus.DELIVERED &&
    !isDeliveredReturnProcessing &&
    isWithinDeliveredReviewWindow &&
    deliveredReturnableDaysLeft > 0
      ? `Có thể đổi / trả đơn hàng trong vòng ${deliveredReturnableDaysLeft} ngày`
      : null;

  // Chi tiết / list đơn: luôn order-hold (orderExpiresAt). Cho phiên cuối cùng (lượt cuối), đếm paymentLinkExpiresAt (~15p Payoo).
  const paymentCountdownLabel =
    formatRemainingDuration(pendingOrderRemainingMs) ??
    formatRemainingDuration(lastAttemptRemainingMs) ??
    formatRemainingDuration(paymentErrorRemainingMs);

  let paymentNotice = null;
  if (
    effectiveOrder.status === OrderStatus.PENDING &&
    effectiveOrder.paymentMethod !== PaymentMethod.COD &&
    effectiveOrder.paymentStatus !== PaymentStatus.PAID
  ) {
    if (currentRetry < maxRetries) {
      paymentNotice = `Bạn còn ${maxRetries - currentRetry}/${maxRetries} lượt thanh toán. Vui lòng hoàn tất thanh toán trong`;
    } else if (currentRetry === maxRetries) {
      paymentNotice = "Bạn còn lượt thanh toán cuối cùng. Vui lòng hoàn tất thanh toán trong";
    }
  }

  return {
    statusInfo: getOrderStatusInfo(effectiveOrder),
    returnNotice,
    paymentNotice,
    paymentCountdownLabel,
    actionTypes,
  };
};

export const getOrderStatusDisplay = (
  order: Pick<SharedOrderDisplayData, "status" | "paymentStatus" | "displayState" | "paymentRetryCount" | "orderReturnCode">,
) => getOrderStatusInfo(order).label;
