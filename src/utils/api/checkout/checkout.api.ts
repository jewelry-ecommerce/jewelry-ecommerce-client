import { withFreshGuestCartHeader } from "@/utils/api/cart/cart.util";
import { authAxios, commonAxios } from "@/utils/axios";
import { isJavaBackend } from "@/utils/config/java-backend.config";
import { javaInitiateCheckout } from "../java/java-checkout-init.api";
import { ownedJavaDraft } from "../java/java-checkout.storage";
import { javaUpdateAddress, javaUpdatePricing, javaPlaceOrder, javaAddressBody } from "../java/java-checkout.api";
import { javaAddressView, type JavaAddress } from "../java/java-commerce.types";
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

async function javaAddresses(): Promise<AddressListResponse> {
  const addresses = (await authAxios.get<JavaAddress[]>("storefront/me/addresses")).data;
  return { total: addresses.length, list: addresses.map(javaAddressView) };
}

export const getProvinces = async (search?: string): Promise<LocationApiResponse<Province>> =>
  (await commonAxios.get("iam/location/provinces", { params: search ? { search } : {} })).data;

export const getWards = async (provinceCode: string | number, search?: string): Promise<LocationApiResponse<Ward>> =>
  (await commonAxios.get(`iam/location/provinces/${provinceCode}/wards`, { params: search ? { search } : {} })).data;

export const initiateCheckout = async (payload: InitiateCheckoutPayload): Promise<CheckoutSession> =>
  isJavaBackend() ? javaInitiateCheckout(payload) : (await commonAxios.post("order/checkout/initiate", payload, withFreshGuestCartHeader())).data;

export const getCheckoutSession = async (id: string): Promise<CheckoutSession> => isJavaBackend() ? (await ownedJavaDraft(id)).session : (await commonAxios.get(`order/checkout/${id}`)).data;

export const updateShippingAddress = async (id: string, data: UpdateShippingAddressPayload): Promise<CheckoutSession> =>
  isJavaBackend() ? javaUpdateAddress(id, data) : (await commonAxios.put(`order/checkout/${id}/shipping-address`, data)).data;

export const updatePricingContext = async (id: string, data: UpdatePricingContextPayload): Promise<CheckoutSession> =>
  isJavaBackend() ? javaUpdatePricing(id, data) : (await commonAxios.put(`order/checkout/${id}/pricing-context`, data)).data;

export const getUserAddresses = async (): Promise<AddressListResponse> =>
  isJavaBackend() ? javaAddresses() : (
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
  isJavaBackend() ? javaPlaceOrder(id, payload) : (await commonAxios.post(`order/checkout/${id}/place-order`, payload)).data;

export const addUserAddress = async (payload: Partial<Address>): Promise<Address> => isJavaBackend() ? javaAddressView((await authAxios.post<JavaAddress>("storefront/me/addresses", javaAddressBody(payload, payload.isDefault))).data) : (await authAxios.post("iam/addresses", payload)).data;

export const updateUserAddress = async (id: string, payload: Partial<Address>): Promise<Address> =>
  isJavaBackend() ? javaAddressView((await authAxios.put<JavaAddress>(`storefront/me/addresses/${id}`, javaAddressBody(payload, payload.isDefault))).data) : (await authAxios.patch(`iam/addresses/${id}`, payload)).data;

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
