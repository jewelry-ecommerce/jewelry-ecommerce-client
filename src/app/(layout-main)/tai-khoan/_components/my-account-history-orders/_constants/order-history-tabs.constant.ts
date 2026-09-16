import type { OrderListSummary } from "@/utils/api/checkout/checkout.interface";
import { OrderHistoryFilterStatus, OrderStatus } from "@/utils/api/order/order.enum";
import { ORDER_LIST_SUMMARY_PRE_ORDER_KEY } from "@/utils/api/pre-order/pre-order-order.util";

export type OrderHistoryTabId =
  | "all"
  | "pre_order"
  | "pending"
  | "packing"
  | "packed"
  | "shipping"
  | "delivered"
  | "return_refund"
  | "delivery_failed"
  | "completed"
  | "cancelled";

export interface OrderHistoryTabConfig {
  id: OrderHistoryTabId;
  label: string;
  /** Giá trị `status` gửi API — undefined = tab Tất cả / Đặt Trước. */
  filterStatus?: OrderHistoryFilterStatus;
  /** Filter `fulfillmentType` — dùng cho tab Đặt Trước. */
  fulfillmentType?: "RETAIL" | "PRE_ORDER";
  getCount: (summary?: OrderListSummary) => number;
}

export const ORDER_HISTORY_TABS: OrderHistoryTabConfig[] = [
  {
    id: "all",
    label: "Tất cả",
    getCount: (summary) => summary?.ALL ?? 0,
  },
  {
    id: "pre_order",
    label: "Đặt Trước",
    fulfillmentType: "PRE_ORDER",
    getCount: (summary) => summary?.[ORDER_LIST_SUMMARY_PRE_ORDER_KEY] ?? 0,
  },
  {
    id: "pending",
    label: "Chờ xác nhận",
    filterStatus: OrderHistoryFilterStatus.PENDING,
    getCount: (summary) => summary?.[OrderStatus.PENDING] ?? 0,
  },
  {
    id: "packing",
    label: "Chờ đóng gói",
    filterStatus: OrderHistoryFilterStatus.CONFIRMED,
    getCount: (summary) => summary?.[OrderStatus.CONFIRMED] ?? 0,
  },
  {
    id: "packed",
    label: "Đã đóng gói",
    filterStatus: OrderHistoryFilterStatus.PACKED,
    getCount: (summary) => summary?.[OrderStatus.PACKED] ?? 0,
  },
  {
    id: "shipping",
    label: "Đang giao hàng",
    filterStatus: OrderHistoryFilterStatus.SHIPPING,
    getCount: (summary) =>
      (summary?.[OrderStatus.PICKING] ?? 0) + (summary?.[OrderStatus.SHIPPING] ?? 0) + (summary?.[OrderStatus.IN_TRANSIT] ?? 0),
  },
  {
    id: "delivered",
    label: "Giao hàng thành công",
    filterStatus: OrderHistoryFilterStatus.DELIVERED,
    getCount: (summary) => summary?.[OrderStatus.DELIVERED] ?? 0,
  },
  {
    id: "return_refund",
    label: "Đổi trả - hoàn tiền",
    filterStatus: OrderHistoryFilterStatus.RETURNED,
    getCount: (summary) =>
      (summary?.[OrderStatus.RETURN_PROCESSING] ?? 0) + (summary?.[OrderStatus.RETURNED] ?? 0) + (summary?.[OrderStatus.REFUNDED] ?? 0),
  },
  {
    id: "delivery_failed",
    label: "Giao thất bại",
    filterStatus: OrderHistoryFilterStatus.DELIVERY_FAILED,
    getCount: (summary) => summary?.[OrderStatus.DELIVERY_FAILED] ?? 0,
  },
  {
    id: "completed",
    label: "Hoàn tất",
    filterStatus: OrderHistoryFilterStatus.COMPLETED,
    getCount: (summary) => summary?.[OrderStatus.COMPLETED] ?? 0,
  },
  {
    id: "cancelled",
    label: "Đã hủy",
    filterStatus: OrderHistoryFilterStatus.CANCELLED,
    getCount: (summary) => summary?.[OrderStatus.CANCELLED] ?? 0,
  },
];

export const DEFAULT_ORDER_HISTORY_TAB_ID: OrderHistoryTabId = "all";

export function getOrderHistoryTabConfig(tabId: OrderHistoryTabId): OrderHistoryTabConfig {
  return ORDER_HISTORY_TABS.find((tab) => tab.id === tabId) ?? ORDER_HISTORY_TABS[0];
}
