import type { CheckoutFulfillmentSummary } from "@/utils/api/checkout/checkout.interface";
import type { OrderDisplayActionType, OrderDisplayState, OrderStatusInfo } from "@/utils/api/order/order.constant";
import { PRE_ORDER_BADGE_COLORS } from "@/utils/constants/pre-order-badge.constant";

/**
 * BE `PreOrderStatus` (PascalCase string values).
 * Prefer const map over TypeScript enum — matches project convention.
 */
export const PreOrderStatusCode = {
  DRAFT: "Draft",
  PRE_ORDERED: "PreOrdered",
  STOCK_AVAILABLE: "StockAvailable",
  ZNS_FAILED: "ZnsFailed",
  AWAITING_PAYMENT: "AwaitingPayment",
  CONVERTED: "Converted",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
} as const;

export type PreOrderStatusCode = (typeof PreOrderStatusCode)[keyof typeof PreOrderStatusCode];

/**
 * List/detail APIs có thể trả SCREAMING_SNAKE hoặc alias (`STOCK_READY` = StockAvailable).
 * Chuẩn hóa về PascalCase trước khi map UI.
 */
const PRE_ORDER_STATUS_ALIASES: Record<string, PreOrderStatusCode> = {
  DRAFT: PreOrderStatusCode.DRAFT,
  PRE_ORDERED: PreOrderStatusCode.PRE_ORDERED,
  STOCK_AVAILABLE: PreOrderStatusCode.STOCK_AVAILABLE,
  STOCK_READY: PreOrderStatusCode.STOCK_AVAILABLE,
  ZNS_FAILED: PreOrderStatusCode.ZNS_FAILED,
  AWAITING_PAYMENT: PreOrderStatusCode.AWAITING_PAYMENT,
  CONVERTED: PreOrderStatusCode.CONVERTED,
  /** BE / OMS đôi khi trả SUCCESS thay vì Converted. */
  SUCCESS: PreOrderStatusCode.CONVERTED,
  CANCELLED: PreOrderStatusCode.CANCELLED,
  EXPIRED: PreOrderStatusCode.EXPIRED,
};

const CANONICAL_PRE_ORDER_STATUSES = new Set<string>(Object.values(PreOrderStatusCode));

export function normalizePreOrderStatus(raw?: string | null): PreOrderStatusCode | null {
  const value = raw?.trim();
  if (!value) return null;
  if (CANONICAL_PRE_ORDER_STATUSES.has(value)) return value as PreOrderStatusCode;

  const aliasKey = value.toUpperCase().replace(/-/g, "_");
  return PRE_ORDER_STATUS_ALIASES[aliasKey] ?? null;
}

export const PRE_ORDER_STATUS_LABEL: Record<PreOrderStatusCode, string> = {
  [PreOrderStatusCode.DRAFT]: "Nháp",
  // BR-03: PreOrdered / StockAvailable / ZnsFailed đều hiển thị "Đặt trước" với khách.
  [PreOrderStatusCode.PRE_ORDERED]: "Đặt trước",
  [PreOrderStatusCode.STOCK_AVAILABLE]: "Đặt trước",
  [PreOrderStatusCode.ZNS_FAILED]: "Đặt trước",
  [PreOrderStatusCode.AWAITING_PAYMENT]: "Chờ thanh toán",
  [PreOrderStatusCode.CONVERTED]: "Đã đặt hàng",
  [PreOrderStatusCode.CANCELLED]: "Đã hủy",
  [PreOrderStatusCode.EXPIRED]: "Hết hạn",
};

/** Terminal — không chuyển tiếp / không action trên FE. */
export const TERMINAL_PRE_ORDER_STATUSES = [
  PreOrderStatusCode.CONVERTED,
  PreOrderStatusCode.CANCELLED,
  PreOrderStatusCode.EXPIRED,
] as const;

export type OrderFulfillmentType = "RETAIL" | "PRE_ORDER";

export interface PreOrderOrderFields {
  fulfillmentType?: OrderFulfillmentType | null;
  preOrderStatus?: PreOrderStatusCode | string | null;
  fulfillmentSummary?: CheckoutFulfillmentSummary | null;
  /** 48h payment hold end (ISO). Used when preOrderStatus = AwaitingPayment. */
  paymentHoldExpiresAt?: string | null;
  /** Mã PO hiển thị trên tab Đặt trước (khác `orderCode`). */
  preOrderCode?: string | null;
  orderCode?: string | null;
}

/** Mã PO (`preOrderCode` hoặc `orderCode` dạng `PO_…`) — phân biệt pre-order với đơn retail sinh từ pre-order. */
export function hasPreOrderIdentity(order: Pick<PreOrderOrderFields, "preOrderCode" | "orderCode"> | null | undefined): boolean {
  if (!order) return false;
  if (order.preOrderCode?.trim()) return true;
  const orderCode = order.orderCode?.trim();
  if (!orderCode) return false;
  return orderCode.toUpperCase().startsWith("PO_");
}

/**
 * Đơn đang theo lifecycle pre-order trên FE (badge / action / route chi tiết đặt trước).
 * `Converted` / `SUCCESS` = đã thành đơn bán thường → không còn coi là pre-order active.
 * `Cancelled` / `Expired` vẫn là pre-order (tab Đặt trước, UI hủy).
 *
 * Đơn retail sinh từ pre-order (có `orderCode` thường, không có `preOrderCode` / `PO_`)
 * dù BE còn trả `fulfillmentType: PRE_ORDER` → không coi là pre-order.
 */
export function isPreOrderOrder(order: PreOrderOrderFields | null | undefined): boolean {
  if (!order) return false;

  const status = normalizePreOrderStatus(order.preOrderStatus);
  if (status === PreOrderStatusCode.CONVERTED) return false;
  if (!hasPreOrderIdentity(order)) return false;

  if (order.fulfillmentType === "PRE_ORDER") return true;
  return Boolean(status);
}

/**
 * Chi tiết pre-order: chỉ khi field `status` === `"Converted"` mới hiện "Đã đặt hàng".
 * Không dùng `preOrderStatus` / alias `SUCCESS` — tránh lệch badge đơn bán thường (vd. Picking).
 */
export function isConvertedOrderStatus(status?: string | null): boolean {
  return status?.trim() === PreOrderStatusCode.CONVERTED;
}

/** Tab Đặt trước: ưu tiên `preOrderCode`, fallback `orderCode`. */
export function getPreOrderListDisplayCode(order: Pick<PreOrderOrderFields, "preOrderCode" | "orderCode">): string {
  return order.preOrderCode?.trim() || order.orderCode?.trim() || "";
}

/** Call detail/pay/cancel: ưu tiên `orderCode`, thiếu thì dùng `preOrderCode`. */
export function getPreOrderDetailLookupCode(order: Pick<PreOrderOrderFields, "preOrderCode" | "orderCode">): string {
  return order.orderCode?.trim() || order.preOrderCode?.trim() || "";
}

export function isTerminalPreOrderStatus(preOrderStatus?: string | null): boolean {
  const normalized = normalizePreOrderStatus(preOrderStatus);
  return Boolean(normalized && (TERMINAL_PRE_ORDER_STATUSES as readonly string[]).includes(normalized));
}

/**
 * Tab "Đặt Trước": ẩn đơn đã convert (và draft nội bộ).
 * Giữ cancelled / expired / awaiting stock & payment.
 */
export function isPreOrderVisibleInHistoryTab(preOrderStatus?: string | null): boolean {
  const normalized = normalizePreOrderStatus(preOrderStatus);
  if (!normalized) return true;
  if (normalized === PreOrderStatusCode.CONVERTED) return false;
  if (normalized === PreOrderStatusCode.DRAFT) return false;
  return true;
}

/** Summary badge key expected from `GET order/orders/me` for the pre-order tab. */
export const ORDER_LIST_SUMMARY_PRE_ORDER_KEY = "PRE_ORDER";

/** Customer-facing badge label (BE `PreOrderStatusLabel`). */
export function getPreOrderDisplayLabel(preOrderStatus?: string | null): string {
  const normalized = normalizePreOrderStatus(preOrderStatus);
  if (normalized) return PRE_ORDER_STATUS_LABEL[normalized];
  return PRE_ORDER_STATUS_LABEL[PreOrderStatusCode.PRE_ORDERED];
}

export function getPreOrderStatusInfo(preOrderStatus?: string | null): OrderStatusInfo {
  const normalized = normalizePreOrderStatus(preOrderStatus);
  const label = getPreOrderDisplayLabel(preOrderStatus);
  switch (normalized) {
    case PreOrderStatusCode.AWAITING_PAYMENT:
      return {
        label,
        bg: PRE_ORDER_BADGE_COLORS.backgroundColor,
        color: PRE_ORDER_BADGE_COLORS.color,
        tone: "processing",
      };
    case PreOrderStatusCode.CONVERTED:
      return { label, bg: "#ECFFD0", color: "#7B9E48", tone: "success" };
    case PreOrderStatusCode.CANCELLED:
    case PreOrderStatusCode.EXPIRED:
      return { label, bg: "#E5E5E5", color: "#737373", tone: "error" };
    case PreOrderStatusCode.DRAFT:
    case PreOrderStatusCode.PRE_ORDERED:
    case PreOrderStatusCode.STOCK_AVAILABLE:
    case PreOrderStatusCode.ZNS_FAILED:
    default:
      // BR-03: Đặt trước / Đã có hàng / ZNS lỗi — cùng badge cam "Đặt trước"
      return {
        label,
        bg: PRE_ORDER_BADGE_COLORS.backgroundColor,
        color: PRE_ORDER_BADGE_COLORS.color,
        tone: "processing",
      };
  }
}

function formatHhMmSs(remainingMs: number | null): string | null {
  if (remainingMs === null || remainingMs <= 0) return null;
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function resolveRemainingMs(dateValue?: string | null, now: number = Date.now()): number | null {
  if (!dateValue) return null;
  const timestamp = new Date(dateValue).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(timestamp - now, 0);
}

/**
 * AC3 / BR-03 action + countdown rules for pre-order detail.
 * - PreOrdered / StockAvailable / ZnsFailed: hủy đơn, badge "Đặt trước", chưa thanh toán
 * - AwaitingPayment: "Chờ thanh toán" + thanh toán/hủy + đếm 48h
 * - Terminal: read-only
 */
export function getPreOrderDisplayState(
  order: PreOrderOrderFields & { orderExpiresAt?: string | null; orderRemainingSeconds?: number | null },
  now: number = Date.now(),
): OrderDisplayState {
  const status = normalizePreOrderStatus(order.preOrderStatus);
  const statusInfo = getPreOrderStatusInfo(status);
  const actionTypes: OrderDisplayActionType[] = [];

  let paymentCountdownLabel: string | null = null;
  let paymentNotice: string | null = null;
  let isPaymentActionDisabled = false;
  let isPaymentHoldExpired = false;

  if (isTerminalPreOrderStatus(status) || status === PreOrderStatusCode.DRAFT) {
    // Terminal / draft — no customer actions
  } else if (status === PreOrderStatusCode.AWAITING_PAYMENT) {
    // Chỉ AwaitingPayment mới hiện "Hoàn tất thanh toán".
    actionTypes.push("CANCEL", "PAYMENT");
    const fromHold = resolveRemainingMs(order.paymentHoldExpiresAt, now);
    const fromOrderExpiry = resolveRemainingMs(order.orderExpiresAt, now);
    const fromSeconds =
      typeof order.orderRemainingSeconds === "number" && Number.isFinite(order.orderRemainingSeconds)
        ? Math.max(order.orderRemainingSeconds, 0) * 1000
        : null;
    const remainingMs = fromHold ?? fromOrderExpiry ?? fromSeconds;
    const hasHoldClock = remainingMs !== null;
    isPaymentHoldExpired = hasHoldClock && remainingMs === 0;
    isPaymentActionDisabled = isPaymentHoldExpired;
    paymentCountdownLabel = isPaymentHoldExpired ? "00:00:00" : formatHhMmSs(remainingMs);
    paymentNotice = "Thanh toán trong";
  } else {
    // PreOrdered / StockAvailable / ZnsFailed / unknown → hủy đơn, chưa thanh toán
    actionTypes.push("CANCEL");
  }

  return {
    statusInfo,
    returnNotice: null,
    paymentNotice,
    paymentCountdownLabel,
    actionTypes,
    isPaymentActionDisabled,
    isPaymentHoldExpired,
  };
}

export const PRE_ORDER_CANCEL_CONFIRM_MESSAGE =
  "Bạn có chắc chắn muốn hủy đơn đặt trước này không? Hành động này không thể hoàn tác và đơn hàng đặt trước của bạn sẽ bị hủy.";

export const PRE_ORDER_PAYMENT_ACTION_LABEL = "Hoàn tất thanh toán";

export const PRE_ORDER_CANCEL_ACTION_LABEL = "Huỷ Đơn";

export const PRE_ORDER_PAYMENT_EXPIRED_MESSAGE = "Thời gian thanh toán đã hết.";
