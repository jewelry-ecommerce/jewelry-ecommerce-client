import type { CheckoutFormValues } from "@/app/(layout-focus)/thanh-toan/_components/checkout.constant";
import { PaymentMethod } from "@/utils/api/order/order.enum";
import type { OrderShippingAddressSnapshot, OrderVatInvoice } from "@/utils/api/order/order.interface";
import type {
  PreOrderDetailResponse,
  PreOrderShippingAddressSnapshotPayload,
  UpdatePreOrderShippingAddressRequest,
  UpdatePreOrderSpecialRequestsRequest,
} from "@/utils/api/pre-order/pre-order-detail.interface";

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function normalizeCode(value: number | null | undefined): number {
  return Number(value ?? 0) || 0;
}

export function normalizeReceiverPhone(value: string | null | undefined): string {
  return normalizeText(value);
}

export function getPreOrderPaymentFormValues(order: PreOrderDetailResponse): CheckoutFormValues {
  const addr = order.shippingAddressSnapshot;
  return {
    lastName: addr?.lastName || "",
    firstName: addr?.firstName || "",
    provinceCode: addr?.provinceCode || 0,
    provinceName: addr?.provinceName || "",
    wardCode: addr?.wardCode || 0,
    wardName: addr?.wardName || "",
    addressLine: addr?.addressLine || "",
    receiverPhone: addr?.receiverPhone || "",
    email: "",
    paymentMethod: order.paymentMethod || PaymentMethod.QR_CODE,
    note: order.note || "",
    showNote: !!order.note,
    showVat: !!order.vatInvoice,
    companyName: order.vatInvoice?.companyName || "",
    companyAddress: order.vatInvoice?.companyAddress || "",
    taxCode: order.vatInvoice?.taxCode || "",
    vatEmail: order.vatInvoice?.email || "",
    consent: true,
    isAllowCheck: false,
    consentCollabPartnerSharing: false,
    saveAddress: false,
  };
}

export function buildPreOrderShippingAddressPayload(values: CheckoutFormValues): PreOrderShippingAddressSnapshotPayload {
  return {
    lastName: normalizeText(values.lastName),
    firstName: normalizeText(values.firstName),
    receiverPhone: normalizeText(values.receiverPhone),
    wardCode: normalizeCode(values.wardCode),
    wardName: normalizeText(values.wardName),
    addressLine: normalizeText(values.addressLine),
    provinceCode: normalizeCode(values.provinceCode),
    provinceName: normalizeText(values.provinceName),
  };
}

/**
 * Payload đổi địa chỉ lần 2 — chỉ gửi snapshot địa chỉ.
 * Không kèm shippingMethod / shippingCarrier / carrierServiceId cũ (service theo tuyến cũ)
 * để BE tính lại phí ship theo địa chỉ mới.
 */
export function buildUpdatePreOrderShippingAddressRequest(
  _order: PreOrderDetailResponse,
  values: CheckoutFormValues,
): UpdatePreOrderShippingAddressRequest {
  return {
    shippingAddressSnapshot: buildPreOrderShippingAddressPayload(values),
  };
}

/** Ghép response PUT shipping-address (shippingFee / grandTotal / …) vào snapshot đang hiển thị. */
export function mergePreOrderShippingAddressResult(
  current: PreOrderDetailResponse,
  shippingPayload: UpdatePreOrderShippingAddressRequest,
  shippingResult?: PreOrderDetailResponse | void,
): PreOrderDetailResponse {
  const orderCode = current.orderCode;
  const nextAddress = {
    ...(current.shippingAddressSnapshot || {
      firstName: "",
      lastName: "",
      receiverPhone: "",
      addressLine: "",
      wardCode: null,
      wardName: "",
      provinceCode: null,
      provinceName: "",
    }),
    ...shippingPayload.shippingAddressSnapshot,
  };

  return {
    ...current,
    ...(shippingResult || {}),
    orderCode,
    shippingAddressSnapshot: nextAddress,
  };
}

/** Đủ tỉnh / phường / số nhà để gọi PUT tính lại ship. */
export function isPreOrderShippingAddressReady(
  values: Pick<CheckoutFormValues, "provinceCode" | "wardCode" | "addressLine" | "firstName" | "receiverPhone">,
): boolean {
  return (
    Number(values.provinceCode || 0) > 0 &&
    Number(values.wardCode || 0) > 0 &&
    Boolean(normalizeText(values.addressLine)) &&
    Boolean(normalizeText(values.firstName)) &&
    Boolean(normalizeText(values.receiverPhone))
  );
}

export function buildUpdatePreOrderSpecialRequestsRequest(values: CheckoutFormValues): UpdatePreOrderSpecialRequestsRequest {
  const vatInvoice: OrderVatInvoice | null = values.showVat
    ? {
        companyName: normalizeText(values.companyName),
        companyAddress: normalizeText(values.companyAddress),
        taxCode: normalizeText(values.taxCode),
        email: normalizeText(values.vatEmail),
      }
    : null;

  return {
    note: values.showNote ? normalizeText(values.note) : "",
    vatInvoice,
  };
}

export function isPreOrderShippingAddressChanged(
  baseline: OrderShippingAddressSnapshot | null | undefined,
  values: CheckoutFormValues,
): boolean {
  const next = buildPreOrderShippingAddressPayload(values);
  return (
    normalizeText(baseline?.lastName) !== next.lastName ||
    normalizeText(baseline?.firstName) !== next.firstName ||
    normalizeText(baseline?.receiverPhone) !== next.receiverPhone ||
    normalizeCode(baseline?.wardCode) !== next.wardCode ||
    normalizeText(baseline?.wardName) !== next.wardName ||
    normalizeText(baseline?.addressLine) !== next.addressLine ||
    normalizeCode(baseline?.provinceCode) !== next.provinceCode ||
    normalizeText(baseline?.provinceName) !== next.provinceName
  );
}

export function isPreOrderSpecialRequestsChanged(
  baseline: Pick<PreOrderDetailResponse, "note" | "vatInvoice">,
  values: CheckoutFormValues,
): boolean {
  const next = buildUpdatePreOrderSpecialRequestsRequest(values);
  const baselineNote = normalizeText(baseline.note);
  const nextNote = normalizeText(next.note);

  if (baselineNote !== nextNote) return true;

  const baselineVat = baseline.vatInvoice ?? null;
  const nextVat = next.vatInvoice ?? null;

  if (!baselineVat && !nextVat) return false;
  if (!baselineVat || !nextVat) return true;

  return (
    normalizeText(baselineVat.companyName) !== normalizeText(nextVat.companyName) ||
    normalizeText(baselineVat.companyAddress) !== normalizeText(nextVat.companyAddress) ||
    normalizeText(baselineVat.taxCode) !== normalizeText(nextVat.taxCode) ||
    normalizeText(baselineVat.email) !== normalizeText(nextVat.email)
  );
}
