import type { PlaceOrderResponse } from "@/utils/api/checkout/checkout.interface";
import { authAxios, commonAxios } from "@/utils/axios";
import { readStoredGuestOrderAccessToken } from "@/utils/order/guest-order-access.util";
import type {
  CancelOrderRequest,
  ClientOrderReturnDetailResponse,
  CreateClientOrderReturnResponse,
  GetOrdersMeParams,
  GetOrderDetailParams,
  GuestOrderDetailResponse,
  GhnFeeCalculateRequest,
  IGhnFeeCalculateResponse,
  IOrderShippingServiceItem,
  NearestWarehouseRequest,
  NearestWarehouseResponse,
  OrderDetailResponse,
  OrderListResponse,
  OrderLookupRequest,
  OrderShippingLeadtimeRequest,
  OrderStatusByOrderCodeResponse,
} from "./order.interface";

const ORDER_RETURNS_CLIENT_PATH = "order/order-returns/client";

export const getOrdersMe = async (params?: GetOrdersMeParams): Promise<OrderListResponse> =>
  (await authAxios.get("order/orders/me", { params })).data;

export const getOrderMeByOrderCode = async (orderCode: string, params?: GetOrderDetailParams): Promise<OrderDetailResponse> =>
  (await authAxios.get(`order/orders/me/${orderCode}`, { params })).data;

export const postOrderLookup = async (
  payload: OrderLookupRequest,
  accessToken?: string,
): Promise<OrderDetailResponse | OrderListResponse> =>
  (
    await authAxios.post("order/orders/lookup", payload, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    })
  ).data;

export const postOrderLookupByOrderCode = async (
  orderCode: string,
  phone: string,
  accessToken?: string,
  params?: GetOrderDetailParams,
): Promise<OrderDetailResponse> =>
  (
    await authAxios.post(
      "order/orders/lookup",
      { orderCode, phone, ...(params?.includePackaging ? { includePackaging: true } : {}) },
      {
        params,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      },
    )
  ).data;

export const resolveGuestOrderAccess = async (token: string): Promise<GuestOrderDetailResponse> =>
  (await commonAxios.post("order/orders/guest-access", { token })).data;

export const getOrderStatusByOrderCode = async (orderCode: string): Promise<OrderStatusByOrderCodeResponse> =>
  (await authAxios.get(`order/orders/${orderCode}/payment-status`)).data;

export const retryPayment = async (
  orderCode: string,
  payload: { paymentMethod: string; returnUrl: string },
): Promise<PlaceOrderResponse> => {
  const guestOrderAccessToken = readStoredGuestOrderAccessToken();
  const config = guestOrderAccessToken ? { headers: { "x-guest-order-access-token": guestOrderAccessToken } } : undefined;
  return (await authAxios.post(`order/orders/${orderCode}/retry-payment`, payload, config)).data;
};

export const getNearestWarehouse = async (
  payload: NearestWarehouseRequest,
  config?: { signal?: AbortSignal },
): Promise<NearestWarehouseResponse> =>
  (await commonAxios.post("order/orders/warehouses/nearest", payload, { signal: config?.signal })).data;

export const getOrderShippingServicesWithLeadtime = async (
  payload: OrderShippingLeadtimeRequest,
  config?: { signal?: AbortSignal },
): Promise<IOrderShippingServiceItem[]> =>
  (await commonAxios.post("order/orders/services/with-leadtime", payload, { signal: config?.signal })).data;

export const cancelOrder = async (orderCode: string, payload: CancelOrderRequest): Promise<void> => {
  const guestOrderAccessToken = readStoredGuestOrderAccessToken();
  const config = guestOrderAccessToken ? { headers: { "x-guest-order-access-token": guestOrderAccessToken } } : undefined;
  await commonAxios.post(`order/orders/client/${orderCode}/cancel`, payload, config);
};

export const calculateOrderShippingFee = async (
  payload: GhnFeeCalculateRequest,
  config?: { signal?: AbortSignal },
): Promise<IGhnFeeCalculateResponse> => (await commonAxios.post("order/orders/fee/calculate", payload, { signal: config?.signal })).data;

export const createClientOrderReturn = async (formData: FormData): Promise<CreateClientOrderReturnResponse> =>
  (await commonAxios.post<CreateClientOrderReturnResponse>(ORDER_RETURNS_CLIENT_PATH, formData)).data;

export const getClientOrderReturnDetail = async (orderReturnId: string): Promise<ClientOrderReturnDetailResponse> =>
  (await commonAxios.get<ClientOrderReturnDetailResponse>(`${ORDER_RETURNS_CLIENT_PATH}/${orderReturnId}`)).data;

export const getClientOrderReturnByOrderCode = async (returnCode: string): Promise<ClientOrderReturnDetailResponse> =>
  (await commonAxios.get<ClientOrderReturnDetailResponse>(`${ORDER_RETURNS_CLIENT_PATH}/by-code/${returnCode}`)).data;

export const cancelClientOrderReturn = async (returnCode: string): Promise<void> => {
  await commonAxios.put(`${ORDER_RETURNS_CLIENT_PATH}/by-code/${returnCode}/cancel`, {});
};
