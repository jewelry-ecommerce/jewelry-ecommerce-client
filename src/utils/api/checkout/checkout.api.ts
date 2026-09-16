import { withFreshGuestCartHeader } from "@/utils/api/cart/cart.util";
import { authAxios, commonAxios } from "@/utils/axios";
import {
  Address,
  AddressListResponse,
  AddressStatus,
  CheckoutSession,
  InitiateCheckoutPayload,
  LocationApiResponse,
  PayooRedirectParams,
  PlaceOrderPayload,
  PlaceOrderResponse,
  UpdatePricingContextPayload,
  VerifyPaymentRedirectResponse,
  Province,
  ShippingAddress,
  UpdateShippingAddressPayload,
  Ward,
} from "./checkout.interface";

export const getProvinces = async (search?: string): Promise<LocationApiResponse<Province>> =>
  (await commonAxios.get("iam/location/provinces", { params: search ? { search } : {} })).data;

export const getWards = async (provinceCode: string | number, search?: string): Promise<LocationApiResponse<Ward>> =>
  (await commonAxios.get(`iam/location/provinces/${provinceCode}/wards`, { params: search ? { search } : {} })).data;

export const initiateCheckout = async (payload: InitiateCheckoutPayload): Promise<CheckoutSession> =>
  (await commonAxios.post("order/checkout/initiate", payload, withFreshGuestCartHeader())).data;

export const getCheckoutSession = async (id: string): Promise<CheckoutSession> => (await commonAxios.get(`order/checkout/${id}`)).data;

export const updateShippingAddress = async (id: string, data: UpdateShippingAddressPayload): Promise<CheckoutSession> =>
  (await commonAxios.put(`order/checkout/${id}/shipping-address`, data)).data;

export const updatePricingContext = async (id: string, data: UpdatePricingContextPayload): Promise<CheckoutSession> =>
  (await commonAxios.put(`order/checkout/${id}/pricing-context`, data)).data;

export const getUserAddresses = async (): Promise<AddressListResponse> =>
  (
    await authAxios.get("iam/addresses", {
      params: {
        orderType: "DESC",
        orderBy: "updatedAt",
        page: 1,
        take: 10,
        isPagination: true,
        status: AddressStatus.ACTIVE,
      },
    })
  ).data;

export const placeOrder = async (id: string, payload: PlaceOrderPayload): Promise<PlaceOrderResponse> =>
  (await commonAxios.post(`order/checkout/${id}/place-order`, payload)).data;

export const addUserAddress = async (payload: Partial<Address>): Promise<Address> => (await authAxios.post("iam/addresses", payload)).data;

export const updateUserAddress = async (id: string, payload: Partial<Address>): Promise<Address> =>
  (await authAxios.patch(`iam/addresses/${id}`, payload)).data;

export const deleteUserAddress = async (id: string): Promise<void> => (await authAxios.delete(`iam/addresses/${id}`)).data;

export const verifyPaymentRedirect = async (params: PayooRedirectParams): Promise<VerifyPaymentRedirectResponse> =>
  (await commonAxios.get("payment/payments/redirect-result", { params })).data;

/** @deprecated Import from `@/utils/api/order/order.api` */
export {
  calculateOrderShippingFee,
  createClientOrderReturn,
  getClientOrderReturnByOrderCode,
  getClientOrderReturnDetail,
  getNearestWarehouse,
  getOrderMeByOrderCode,
  getOrdersMe,
  getOrderShippingServicesWithLeadtime,
  getOrderStatusByOrderCode,
  postOrderLookup,
  postOrderLookupByOrderCode,
  retryPayment,
  resolveGuestOrderAccess,
} from "../order/order.api";
