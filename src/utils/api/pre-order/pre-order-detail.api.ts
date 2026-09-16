import { commonAxios } from "@/utils/axios";
import type {
  CancelPreOrderRequest,
  PayPreOrderRequest,
  PayPreOrderResponse,
  PreOrderAccessResponse,
  PreOrderDetailResponse,
  UpdatePreOrderShippingAddressRequest,
  UpdatePreOrderSpecialRequestsRequest,
} from "./pre-order-detail.interface";
import { buildPreOrderAccessRequestConfig } from "./pre-order-detail.util";

function preOrderClientPath(orderCode: string, suffix: string): string {
  return `order/pre-orders/client/${encodeURIComponent(orderCode)}${suffix}`;
}

/** Chi tiết đơn đặt trước (member / đã có orderCode). Guest kèm `x-pre-order-access-token`. */
export const getPreOrderDetailByOrderCode = async (orderCode: string): Promise<PreOrderDetailResponse> =>
  (await commonAxios.get(preOrderClientPath(orderCode, ""), buildPreOrderAccessRequestConfig())).data;

/** Guest/ZNS: `POST order/pre-orders/access` body `{ token }` — không dùng `orders/guest-access`. */
export const resolvePreOrderAccess = async (token: string): Promise<PreOrderAccessResponse> =>
  (await commonAxios.post("order/pre-orders/access", { token })).data;

/** Hủy đơn đặt trước — `POST order/pre-orders/client/:orderCode/cancel`. */
export const cancelPreOrder = async (orderCode: string, payload: CancelPreOrderRequest): Promise<void> => {
  await commonAxios.post(preOrderClientPath(orderCode, "/cancel"), payload, buildPreOrderAccessRequestConfig());
};

/** Cập nhật địa chỉ giao hàng trước khi thanh toán lần 2. */
export const updatePreOrderShippingAddress = async (
  orderCode: string,
  payload: UpdatePreOrderShippingAddressRequest,
): Promise<PreOrderDetailResponse | void> =>
  (await commonAxios.put(preOrderClientPath(orderCode, "/shipping-address"), payload, buildPreOrderAccessRequestConfig())).data;

/** Cập nhật ghi chú / VAT trước khi thanh toán lần 2. */
export const updatePreOrderSpecialRequests = async (
  orderCode: string,
  payload: UpdatePreOrderSpecialRequestsRequest,
): Promise<PreOrderDetailResponse | void> =>
  (await commonAxios.put(preOrderClientPath(orderCode, "/special-requests"), payload, buildPreOrderAccessRequestConfig())).data;

/** Thanh toán đơn đặt trước lần 2 — `POST .../pay` (+ `x-pre-order-access-token` khi guest). */
export const payPreOrder = async (orderCode: string, payload: PayPreOrderRequest): Promise<PayPreOrderResponse> =>
  (await commonAxios.post(preOrderClientPath(orderCode, "/pay"), payload, buildPreOrderAccessRequestConfig())).data;
