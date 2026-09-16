import type { OrderDetailItem, OrderDetailResponse, OrderVatInvoice } from "@/utils/api/order/order.interface";

/**
 * `GET order/pre-orders/client/:orderCode`.
 * BE trả subset của order detail — các field còn thiếu được fill ở `preOrderDetailToViewOrder`.
 */
export type PreOrderDetailResponse = Partial<Omit<OrderDetailResponse, "orderCode" | "items">> & {
  orderCode: string;
  preOrderCode?: string | null;
  items?: OrderDetailItem[];
  shippingCarrier?: string | null;
  carrierServiceId?: number | null;
};

/** `POST order/pre-orders/access` — guest/ZNS deep-link `#access=<token>`. */
export type PreOrderAccessResponse = PreOrderDetailResponse & {
  accessExpiresAt?: string;
};

/** `POST order/pre-orders/client/:orderCode/cancel` */
export interface CancelPreOrderRequest {
  reason: string;
}

/** Snapshot địa chỉ gửi lên `PUT .../shipping-address`. */
export interface PreOrderShippingAddressSnapshotPayload {
  lastName: string;
  firstName: string;
  receiverPhone: string;
  wardCode: number;
  wardName: string;
  addressLine: string;
  provinceCode: number;
  provinceName: string;
}

/** `PUT order/pre-orders/client/:orderCode/shipping-address` */
export interface UpdatePreOrderShippingAddressRequest {
  shippingAddressSnapshot: PreOrderShippingAddressSnapshotPayload;
  shippingMethod?: string;
  shippingCarrier?: string;
  carrierServiceId?: number;
}

/** `PUT order/pre-orders/client/:orderCode/special-requests` */
export interface UpdatePreOrderSpecialRequestsRequest {
  note?: string;
  vatInvoice?: OrderVatInvoice | null;
}

/** `POST order/pre-orders/client/:orderCode/pay` */
export interface PayPreOrderRequest {
  paymentMethod: string;
  returnUrl: string;
}

export interface PayPreOrderResponse {
  orderId?: string;
  orderCode?: string;
  status?: string;
  paymentMethod?: string;
  paymentUrl?: string;
  /** Token `goa_*` cho trang trạng thái / Payoo back — gọi `orders/guest-access` (không dùng `gpa_`). */
  guestOrderAccess?: {
    token: string;
    expiresAt: string;
  };
}
