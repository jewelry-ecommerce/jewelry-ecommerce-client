import type {
  CheckoutSession,
  IOrderShippingServiceItem,
  NearestWarehouseResponse,
  PlaceOrderPayload,
  ShippingAddress,
} from "@/utils/api/checkout/checkout.interface";
import { buildPreOrderDetailUrlTemplate, isPreOrderReserveCheckout } from "@/utils/api/pre-order/pre-order-checkout.util";
import {
  resolveEstimatedDeliveryAt,
  resolvePlaceOrderShippingCarrier,
  resolvePlaceOrderShippingMethod,
} from "../_components/checkout.helpers";
import type { CheckoutFormValues } from "../_components/checkout.constant";

export const normalizeVoucherCodes = (values: readonly string[] | undefined): string[] =>
  [...new Set((values ?? []).map((value) => String(value ?? "").trim()).filter(Boolean))].sort();

export const buildShippingAddressPayload = (values: CheckoutFormValues): ShippingAddress => ({
  firstName: values.firstName,
  receiverPhone: values.receiverPhone,
  addressLine: values.addressLine,
  wardCode: values.wardCode,
  wardName: values.wardName,
  provinceCode: values.provinceCode,
  provinceName: values.provinceName,
});

/** Alias giữ call-site (sync address / price-change modal). */
export const buildAddressPayload = buildShippingAddressPayload;

export const buildAddressBookPayload = (values: CheckoutFormValues) => ({
  ...buildShippingAddressPayload(values),
  lastName: values.lastName || "",
});

export interface BuildPlaceOrderPayloadParams {
  values: CheckoutFormValues;
  recaptchaToken: string | null;
  checkoutSession?: CheckoutSession | null;
  isLoggedIn: boolean;
  shippingService?: IOrderShippingServiceItem | null;
  shippingServiceId?: number;
  nearestWarehouse?: NearestWarehouseResponse | null;
  origin?: string;
  /** Giá trị phí ship UI đang hiển thị để OMS phát hiện dữ liệu cũ (từ pricing.shippingFee). */
  rawShippingFee?: number;
  /** Defined only for HEARTLOCK checkout sessions containing a Set. */
  isAllowCheck?: boolean;
}

export function buildPlaceOrderPayload({
  values,
  recaptchaToken,
  checkoutSession,
  isLoggedIn,
  shippingService,
  shippingServiceId,
  nearestWarehouse,
  origin = typeof window !== "undefined" ? window.location.origin : "",
  rawShippingFee,
  isAllowCheck,
}: BuildPlaceOrderPayloadParams): PlaceOrderPayload {
  // Gửi giá trị UI đang hiển thị từ OMS pricing.shippingFee để OMS phát hiện mismatch / dữ liệu cũ
  const uiShippingFee =
    rawShippingFee !== undefined
      ? rawShippingFee
      : checkoutSession?.pricing?.shippingFee !== undefined
        ? Math.max(0, Math.round(Number(checkoutSession.pricing.shippingFee) || 0))
        : undefined;
  const resolvedCarrier = shippingService ? resolvePlaceOrderShippingCarrier(shippingService) : "GHN";
  const resolvedMethod = resolvePlaceOrderShippingMethod(shippingService, checkoutSession?.shippingMethod);

  const isReserve = isPreOrderReserveCheckout(checkoutSession);

  const payload: PlaceOrderPayload = {
    consent: isLoggedIn ? true : values.consent,
    note: values.showNote ? values.note : "",
    subscribeToNewsletter: checkoutSession?.subscribeToNewsletter ?? false,
    acceptPriceChanges: false,
    shippingMethod: resolvedMethod,
    ...(uiShippingFee !== undefined ? { shippingFee: uiShippingFee } : {}),
    shippingCarrier: resolvedCarrier,
    vatInvoice: values.showVat
      ? {
          companyName: values.companyName,
          companyAddress: values.companyAddress,
          taxCode: values.taxCode,
          email: values.vatEmail,
        }
      : undefined,
  };

  if (isReserve) {
    payload.detailUrlTemplate = buildPreOrderDetailUrlTemplate(origin);
    payload.consentCollabPartnerSharing = values.consentCollabPartnerSharing;
    const email = values.email?.trim();
    if (email) payload.email = email;
  } else {
    payload.returnUrl = `${origin}/trang-thai-thanh-toan`;
    if (values.paymentMethod) payload.paymentMethod = values.paymentMethod;
  }

  if (checkoutSession?.contactEmail?.trim()) {
    payload.contactEmail = checkoutSession.contactEmail.trim();
  }

  if (recaptchaToken) {
    payload.recaptchaToken = recaptchaToken;
  }

  if (isAllowCheck !== undefined) {
    payload.isAllowCheck = isAllowCheck;
  }

  if (shippingServiceId !== undefined) {
    payload.carrierServiceId = shippingServiceId;
  }

  if (nearestWarehouse) {
    payload.pickupAddress = {
      warehouseId: nearestWarehouse.warehouseId,
      warehouseName: nearestWarehouse.warehouseName,
      addressLine: nearestWarehouse.addressLine,
      provinceCode: nearestWarehouse.provinceCode,
      provinceName: nearestWarehouse.provinceName,
      phone: nearestWarehouse.phone,
      wardCode: nearestWarehouse.wardCode,
      wardName: nearestWarehouse.wardName,
    };
  }

  const estimatedDeliveryAt = resolveEstimatedDeliveryAt(shippingService);
  if (estimatedDeliveryAt) {
    payload.estimatedDeliveryAt = estimatedDeliveryAt;
  }

  return payload;
}
