export enum OrderStatus {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  PICKING = "Picking",
  PACKED = "Packed",
  SHIPPING = "Shipping",
  IN_TRANSIT = "InTransit",
  DELIVERED = "Delivered",
  DELIVERY_FAILED = "DeliveryFailed",
  RETURN_PROCESSING = "ReturnProcessing",
  RETURNED = "Returned",
  REFUNDED = "Refunded",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export enum OrderHistoryFilterStatus {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  PACKED = "Packed",
  SHIPPING = "Shipping",
  DELIVERED = "Delivered",
  RETURNED = "Returned",
  DELIVERY_FAILED = "DeliveryFailed",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

/** Nhãn hiển thị trạng thái đơn hàng (dùng ở list, tra cứu, chi tiết). */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Chờ xác nhận",
  [OrderStatus.CONFIRMED]: "Chờ đóng gói",
  [OrderStatus.PICKING]: "Chờ đóng gói",
  [OrderStatus.PACKED]: "Đã đóng gói",
  [OrderStatus.SHIPPING]: "Đang giao",
  [OrderStatus.IN_TRANSIT]: "Đang giao",
  [OrderStatus.DELIVERED]: "Giao thành công",
  [OrderStatus.DELIVERY_FAILED]: "Giao thất bại",
  [OrderStatus.RETURN_PROCESSING]: "Đang xử lý trả hàng",
  [OrderStatus.RETURNED]: "Đã trả hàng",
  [OrderStatus.REFUNDED]: "Đã hoàn tiền",
  [OrderStatus.COMPLETED]: "Hoàn tất",
  [OrderStatus.CANCELLED]: "Đã hủy",
};

export const RETURN_FLOW_ORDER_STATUSES: OrderStatus[] = [OrderStatus.RETURN_PROCESSING];

export const RETURN_REFUND_TAB_ORDER_STATUSES: OrderStatus[] = [...RETURN_FLOW_ORDER_STATUSES, OrderStatus.RETURNED, OrderStatus.REFUNDED];

export function isReturnFlowOrderStatus(status?: string | null): boolean {
  if (!status) return false;
  return (RETURN_FLOW_ORDER_STATUSES as string[]).includes(status);
}

/**
 * Đơn thuộc tab Lịch sử đơn hàng → Đổi trả - hoàn tiền.
 */
export function isReturnRefundTabOrder(order: { status?: string | null; orderReturnCode?: string | null }): boolean {
  if (!order.status) return false;
  if ((RETURN_REFUND_TAB_ORDER_STATUSES as string[]).includes(order.status)) return true;
  if (order.status === OrderStatus.DELIVERED && Boolean(order.orderReturnCode?.trim())) return true;
  return false;
}

/**
 * Đơn thuộc tab Lịch sử đơn hàng → Giao hàng thành công.
 * Delivered có orderReturnCode thuộc tab Đổi trả - hoàn tiền.
 */
export function isDeliveredTabOrder(order: { status?: string | null; orderReturnCode?: string | null }): boolean {
  return order.status === OrderStatus.DELIVERED && !order.orderReturnCode?.trim();
}

export enum OrderReturnStatus {
  PENDING = "Pending",
  AWAITING_PICKUP = "AwaitingPickup",
  COLLECTION_FAILED = "CollectionFailed",
  COLLECTED = "Collected",
  INSPECTION = "Inspection",
  REJECTED = "Rejected",
  STORED = "Stored",
  EXCHANGE_RELEASED = "ExchangeReleased",
  AWAITING_EXCHANGE = "AwaitingExchange",
  CANCELLED = "Cancelled",
}

export enum OrderReturnTimelineStatus {
  READY_TO_PICK = "ready_to_pick",
  PICKING = "picking",
  MONEY_COLLECT_PICKING = "money_collect_picking",
  PICKED = "picked",
  STORING = "storing",
  SORTING = "sorting",
  TRANSPORTING = "transporting",
  DELIVERING = "delivering",
  MONEY_COLLECT_DELIVERING = "money_collect_delivering",
  DELIVERED = "delivered",
  DELIVERY_FAIL = "delivery_fail",
  EXCEPTION = "exception",
  DAMAGE = "damage",
  LOST = "lost",
  WAITING_TO_RETURN = "waiting_to_return",
  RETURN = "return",
  RETURN_TRANSPORTING = "return_transporting",
  RETURN_SORTING = "return_sorting",
  RETURNING = "returning",
  RETURNED = "returned",
  CANCELLED = "cancelled",
  RETURN_FAIL = "return_fail",
}

export interface OrderReturnTimelineStatusCopy {
  title: string;
  subtitle: string;
}

const TIMELINE_RETURN_IN_TRANSIT: OrderReturnTimelineStatusCopy = {
  title: "Đang trả hàng về cho người bán",
  subtitle: "Hàng hoàn trả đã được bưu tá tiếp nhận và đang trên đường chuyển về kho của shop.",
};

const TIMELINE_PICKUP_FAILED: OrderReturnTimelineStatusCopy = {
  title: "Lấy hàng không thành công",
  subtitle: "Bưu tá không thể lấy kiện hàng từ bạn. Vui lòng liên hệ bộ phận CSKH để được hỗ trợ sắp xếp lại lịch lấy hàng.",
};

export const ORDER_RETURN_TIMELINE_STATUS_LABEL: Record<OrderReturnTimelineStatus, OrderReturnTimelineStatusCopy> = {
  [OrderReturnTimelineStatus.READY_TO_PICK]: {
    title: "Yêu cầu được chấp nhận - Chờ lấy hàng",
    subtitle: "Yêu cầu của bạn đã được duyệt. Vui lòng đóng gói hàng hoá cẩn thận, bưu tá sẽ sớm liên hệ để đến lấy hàng.",
  },
  [OrderReturnTimelineStatus.PICKING]: {
    title: "Bưu tá đang đến lấy hàng",
    subtitle: "Bưu tá đang trên đường đến địa chỉ của bạn. Vui lòng chú ý điện thoại.",
  },
  [OrderReturnTimelineStatus.MONEY_COLLECT_PICKING]: {
    title: "Bưu tá đang đến lấy hàng",
    subtitle: "Bưu tá đang trên đường đến địa chỉ của bạn. Vui lòng chú ý điện thoại.",
  },
  [OrderReturnTimelineStatus.PICKED]: TIMELINE_RETURN_IN_TRANSIT,
  [OrderReturnTimelineStatus.STORING]: TIMELINE_RETURN_IN_TRANSIT,
  [OrderReturnTimelineStatus.SORTING]: TIMELINE_RETURN_IN_TRANSIT,
  [OrderReturnTimelineStatus.TRANSPORTING]: TIMELINE_RETURN_IN_TRANSIT,
  [OrderReturnTimelineStatus.DELIVERING]: TIMELINE_RETURN_IN_TRANSIT,
  [OrderReturnTimelineStatus.MONEY_COLLECT_DELIVERING]: TIMELINE_RETURN_IN_TRANSIT,
  [OrderReturnTimelineStatus.DELIVERED]: {
    title: "Người bán đã nhận được hàng trả",
    subtitle: "Kiện hàng của bạn đã được giao thành công về kho của người bán để chờ kiểm định.",
  },
  [OrderReturnTimelineStatus.DELIVERY_FAIL]: TIMELINE_PICKUP_FAILED,
  [OrderReturnTimelineStatus.EXCEPTION]: TIMELINE_PICKUP_FAILED,
  [OrderReturnTimelineStatus.DAMAGE]: TIMELINE_PICKUP_FAILED,
  [OrderReturnTimelineStatus.LOST]: TIMELINE_PICKUP_FAILED,
  [OrderReturnTimelineStatus.WAITING_TO_RETURN]: TIMELINE_RETURN_IN_TRANSIT,
  [OrderReturnTimelineStatus.RETURN]: TIMELINE_RETURN_IN_TRANSIT,
  [OrderReturnTimelineStatus.RETURN_TRANSPORTING]: TIMELINE_RETURN_IN_TRANSIT,
  [OrderReturnTimelineStatus.RETURN_SORTING]: TIMELINE_RETURN_IN_TRANSIT,
  [OrderReturnTimelineStatus.RETURNING]: TIMELINE_RETURN_IN_TRANSIT,
  [OrderReturnTimelineStatus.RETURNED]: {
    title: "Người bán đã nhận được hàng trả",
    subtitle: "Kiện hàng của bạn đã được giao thành công về kho của người bán để chờ kiểm định.",
  },
  [OrderReturnTimelineStatus.CANCELLED]: {
    title: "Đã hủy",
    subtitle: "Yêu cầu đổi / trả đã được hủy.",
  },
  [OrderReturnTimelineStatus.RETURN_FAIL]: TIMELINE_PICKUP_FAILED,
};

export enum PaymentStatus {
  UNPAID = "Unpaid",
  PAID = "Paid",
  REFUNDED = "Refunded",
  FAILED = "Failed",
}

export enum PaymentMethod {
  COD = "COD",
  QR_CODE = "QR_CODE",
  CREDIT_CARD = "CREDIT_CARD",
  DIGITAL_WALLET = "DIGITAL_WALLET",
  MOMO_WALLET = "MOMO_WALLET",
  ZALO_PAY = "ZALO_PAY",
  INSTALLMENT = "INSTALLMENT",
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  [PaymentMethod.COD]: "Thanh toán khi nhận hàng",
  [PaymentMethod.QR_CODE]: "QR Code",
  [PaymentMethod.CREDIT_CARD]: "Thẻ Visa/Master/JCB",
  [PaymentMethod.DIGITAL_WALLET]: "Apple Pay / Samsung Pay",
  [PaymentMethod.MOMO_WALLET]: "Ví Momo",
  [PaymentMethod.ZALO_PAY]: "ZaloPay",
  [PaymentMethod.INSTALLMENT]: "Thanh toán trả góp",
  MOMO_PAY_LATER: "Trả sau MoMo",
  ATM_CARD: "Thẻ ATM",
};

export const getPaymentMethodLabel = (paymentMethod?: string | null): string => {
  if (!paymentMethod) return "#";
  return PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod;
};

export enum OrderSource {
  WEBSITE = "Website",
  MOBILE_APP = "MobileApp",
  MANUAL = "Manual",
}

export enum ShippingMethod {
  STANDARD = "Standard",
  EXPRESS = "Express",
}

export enum OrderChangedByType {
  CUSTOMER = "customer",
  ADMIN = "admin",
  SYSTEM = "system",
}

export enum ErrorType {
  ADDRESS = "address",
  PAYMENT = "payment",
  STOCK = "stock",
  CATALOG = "catalog",
  OTHER = "other",
}

export enum OrderCancellationReason {
  CHANGE_MIND = "ChangeMind",
  WRONG_ORDER_INFO = "WrongOrderInfo",
  FOUND_CHEAPER_ELSEWHERE = "FoundCheaperElsewhere",
  SHIPPING_TOO_LONG = "ShippingTooLong",
  DUPLICATE_ORDER = "DuplicateOrder",
  PAYMENT_ISSUE = "PaymentIssue",
  OTHER = "Other",
  RECALL = "Recall",
}

export const ORDER_CANCELLATION_REASON_LABEL: Record<OrderCancellationReason, string> = {
  [OrderCancellationReason.CHANGE_MIND]: "Đổi ý, không muốn mua nữa",
  [OrderCancellationReason.WRONG_ORDER_INFO]: "Nhập sai thông tin đơn hàng",
  [OrderCancellationReason.FOUND_CHEAPER_ELSEWHERE]: "Tìm được giá tốt hơn ở nơi khác",
  [OrderCancellationReason.SHIPPING_TOO_LONG]: "Thời gian giao hàng lâu hơn mong đợi",
  [OrderCancellationReason.DUPLICATE_ORDER]: "Đặt trùng đơn hàng",
  [OrderCancellationReason.PAYMENT_ISSUE]: "Không thanh toán được / lỗi thanh toán",
  [OrderCancellationReason.OTHER]: "Lý do khác",
  [OrderCancellationReason.RECALL]: "Muốn hủy để đặt lại đơn mới",
};

export const ORDER_CANCELLATION_REASON_OPTIONS: OrderCancellationReason[] = [
  OrderCancellationReason.CHANGE_MIND,
  OrderCancellationReason.WRONG_ORDER_INFO,
];

export function getOrderCancellationReasonLabel(reason?: string | null): string {
  const raw = reason?.trim();
  if (!raw) return "—";
  if ((Object.values(OrderCancellationReason) as string[]).includes(raw)) {
    return ORDER_CANCELLATION_REASON_LABEL[raw as OrderCancellationReason];
  }
  return raw;
}

export enum OrderReturnReason {
  WRONG_ORDER_DELIVERED = "WrongOrderDelivered",
  EMPTY_BOX_DELIVERED = "EmptyBoxDelivered",
  MISSING_ITEMS_DELIVERED = "MissingItemsDelivered",
  WRONG_PRODUCT_DELIVERED = "WrongProductDelivered",
  DEFECTIVE_PRODUCT = "DefectiveProduct",
  PRODUCT_NOT_AS_DESCRIBED = "ProductNotAsDescribed",
  CHANGED_MIND = "ChangedMind",
}

export enum OrderReturnType {
  EXCHANGE = "Exchange",
  REFUND = "Refund",
}

export const ORDER_RETURN_REASON_LABEL: Record<OrderReturnReason, string> = {
  [OrderReturnReason.WRONG_ORDER_DELIVERED]: "Giao nhầm (sai toàn bộ đơn)",
  [OrderReturnReason.EMPTY_BOX_DELIVERED]: "Giao thùng rỗng",
  [OrderReturnReason.MISSING_ITEMS_DELIVERED]: "Giao thiếu hàng",
  [OrderReturnReason.WRONG_PRODUCT_DELIVERED]: "Giao sai sản phẩm",
  [OrderReturnReason.DEFECTIVE_PRODUCT]: "Hàng bị lỗi (rớt đá, móp...)",
  [OrderReturnReason.PRODUCT_NOT_AS_DESCRIBED]: "Hàng khác với mô tả",
  [OrderReturnReason.CHANGED_MIND]: "Đổi ý",
};

const ORDER_EXCHANGE_REASON_ORDER: OrderReturnReason[] = [
  OrderReturnReason.WRONG_ORDER_DELIVERED,
  OrderReturnReason.EMPTY_BOX_DELIVERED,
  OrderReturnReason.MISSING_ITEMS_DELIVERED,
  OrderReturnReason.WRONG_PRODUCT_DELIVERED,
  OrderReturnReason.DEFECTIVE_PRODUCT,
  OrderReturnReason.PRODUCT_NOT_AS_DESCRIBED,
  OrderReturnReason.CHANGED_MIND,
];

export interface OrderExchangeReasonOption {
  value: OrderReturnReason;
  label: string;
}

export const ORDER_EXCHANGE_REASON_OPTIONS: OrderExchangeReasonOption[] = ORDER_EXCHANGE_REASON_ORDER.map((value) => ({
  value,
  label: ORDER_RETURN_REASON_LABEL[value],
}));

export function isOrderReturnReason(value: string): value is OrderReturnReason {
  return (Object.values(OrderReturnReason) as string[]).includes(value);
}

export const ORDER_RETURN_STATUS_LABEL: Record<OrderReturnStatus, string> = {
  [OrderReturnStatus.PENDING]: "Chờ xác nhận",
  [OrderReturnStatus.AWAITING_PICKUP]: "Chờ thu hồi",
  [OrderReturnStatus.COLLECTION_FAILED]: "Thu hồi thất bại",
  [OrderReturnStatus.COLLECTED]: "Đã thu hồi",
  [OrderReturnStatus.INSPECTION]: "Đang kiểm định",
  [OrderReturnStatus.REJECTED]: "Từ chối",
  [OrderReturnStatus.STORED]: "Đã nhập kho",
  [OrderReturnStatus.EXCHANGE_RELEASED]: "Đã giải phóng đơn đổi",
  [OrderReturnStatus.AWAITING_EXCHANGE]: "Chờ hàng đổi",
  [OrderReturnStatus.CANCELLED]: "Đã hủy",
};

export interface OrderReturnStatusInfo {
  label: string;
  bg: string;
  color: string;
}

export function getOrderReturnStatusInfo(status?: OrderReturnStatus | string | null): OrderReturnStatusInfo {
  const key = status as OrderReturnStatus;
  const label = (status && ORDER_RETURN_STATUS_LABEL[key]) || status || "—";

  switch (key) {
    case OrderReturnStatus.PENDING:
      return { label, bg: "#FEF3C7", color: "#D97706" };
    case OrderReturnStatus.AWAITING_PICKUP:
    case OrderReturnStatus.AWAITING_EXCHANGE:
      return { label, bg: "#E0F2FE", color: "#0BA5EC" };
    case OrderReturnStatus.COLLECTED:
    case OrderReturnStatus.STORED:
    case OrderReturnStatus.EXCHANGE_RELEASED:
      return { label, bg: "#ECFFD0", color: "#7B9E48" };
    case OrderReturnStatus.COLLECTION_FAILED:
    case OrderReturnStatus.REJECTED:
      return { label, bg: "#FEE2E2", color: "#EF4444" };
    case OrderReturnStatus.INSPECTION:
      return { label, bg: "#FEF9C3", color: "#EAB308" };
    case OrderReturnStatus.CANCELLED:
      return { label, bg: "#E5E5E5", color: "#737373" };
    default:
      return { label, bg: "#F5F5F5", color: "#595959" };
  }
}

export function getOrderReturnTimelineStatusCopy(status?: string | null): OrderReturnTimelineStatusCopy | null {
  if (!status) return null;
  const timelineKey = status.trim().toLowerCase();
  if ((Object.values(OrderReturnTimelineStatus) as string[]).includes(timelineKey)) {
    return ORDER_RETURN_TIMELINE_STATUS_LABEL[timelineKey as OrderReturnTimelineStatus];
  }
  return null;
}

export function timelineStatusTitle(status?: string | null): string {
  if (!status) return "—";
  if ((Object.values(OrderReturnStatus) as string[]).includes(status)) {
    return getOrderReturnStatusInfo(status).label;
  }
  const copy = getOrderReturnTimelineStatusCopy(status);
  if (copy) return copy.title;
  return status;
}

export function getOrderReturnTypeLabel(type: OrderReturnType | string): string {
  if (type === OrderReturnType.EXCHANGE || type === "Exchange") return "Đổi hàng";
  if (type === OrderReturnType.REFUND || type === "Refund") return "Hoàn tiền";
  return String(type);
}

export function getOrderReturnReasonLabel(reason: OrderReturnReason | string): string {
  if (isOrderReturnReason(reason)) return ORDER_RETURN_REASON_LABEL[reason];
  return reason;
}
