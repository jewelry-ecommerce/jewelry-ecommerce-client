import type { PickupAddressValues } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-return-pickup.interface";
import type { OrderProductItemData } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-product-item.interface";
import type { OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import type { CreateClientOrderReturnRequest } from "@/utils/api/order/order.interface";
import { OrderReturnType, type OrderReturnReason } from "@/utils/api/order/order.enum";

export interface BuildClientOrderExchangePayloadParams {
  order: OrderDetailResponse;
  selectedItemIds: string[];
  exchangeQuantities: Record<string, number>;
  replacementProducts: OrderProductItemData[];
  replacementQuantities: Record<string, number>;
  reason: OrderReturnReason;
  note: string;
  pickupAddress: PickupAddressValues;
}

export interface BuildClientOrderRefundPayloadParams {
  order: OrderDetailResponse;
  selectedItemIds: string[];
  exchangeQuantities: Record<string, number>;
  reason: OrderReturnReason;
  note: string;
  pickupAddress: PickupAddressValues;
  refundBankAccountHolder?: string;
  refundBankAccountNumber?: string;
  refundBankName?: string;
  refundBankBranch?: string;
}

/** Họ và tên form → chỉ gửi `firstName` (full name). Không gửi `lastName`. */
export function mapPickupAddressToOrderReturnShipping(pickup: PickupAddressValues): CreateClientOrderReturnRequest["shippingAddress"] {
  return {
    firstName: pickup.fullName.trim(),
    receiverPhone: pickup.phone.trim(),
    wardCode: pickup.wardCode,
    wardName: pickup.wardName.trim(),
    addressLine: pickup.addressLine.trim(),
    provinceCode: pickup.provinceCode,
    provinceName: pickup.provinceName.trim(),
  };
}

export function buildClientOrderRefundPayload(params: BuildClientOrderRefundPayloadParams): CreateClientOrderReturnRequest {
  const {
    order,
    selectedItemIds,
    exchangeQuantities,
    reason,
    note,
    pickupAddress,
    refundBankAccountHolder,
    refundBankAccountNumber,
    refundBankName,
    refundBankBranch,
  } = params;

  const returnItems = selectedItemIds
    .map((orderItemId) => {
      const item = order.items.find((i) => i.id === orderItemId);
      if (!item) return null;
      return { orderItemId, quantity: exchangeQuantities[orderItemId] ?? 1 };
    })
    .filter((line): line is { orderItemId: string; quantity: number } => line != null);

  return {
    orderId: order.id,
    type: OrderReturnType.REFUND,
    reason,
    returnItems,
    exchangeItems: [],
    shippingAddress: mapPickupAddressToOrderReturnShipping(pickupAddress),
    note: note.trim() || undefined,
    refundBankAccountHolder: refundBankAccountHolder?.trim() || undefined,
    refundBankAccountNumber: refundBankAccountNumber?.trim() || undefined,
    refundBankName: refundBankName?.trim() || undefined,
    refundBankBranch: refundBankBranch?.trim() || undefined,
  };
}

export function buildClientOrderExchangePayload(params: BuildClientOrderExchangePayloadParams): CreateClientOrderReturnRequest {
  const { order, selectedItemIds, exchangeQuantities, replacementProducts, replacementQuantities, reason, note, pickupAddress } = params;

  const returnItems = selectedItemIds
    .map((orderItemId) => {
      const item = order.items.find((i) => i.id === orderItemId);
      if (!item) return null;
      return { orderItemId, quantity: exchangeQuantities[orderItemId] ?? 1 };
    })
    .filter((line): line is { orderItemId: string; quantity: number } => line != null);

  const exchangeItems = replacementProducts.map((product) => ({
    variationId: product.variationId ?? product.productId,
    quantity: replacementQuantities[product.productId] ?? 1,
  }));

  return {
    orderId: order.id,
    type: OrderReturnType.EXCHANGE,
    reason,
    returnItems,
    exchangeItems,
    shippingAddress: mapPickupAddressToOrderReturnShipping(pickupAddress),
    note: note.trim() || undefined,
  };
}

/** Build multipart body khớp Swagger: metadata + `files` (ảnh/video bằng chứng). */
export function buildClientOrderReturnFormData(payload: CreateClientOrderReturnRequest, evidenceFiles: File[]): FormData {
  const formData = new FormData();

  formData.append("orderId", payload.orderId);
  formData.append("type", payload.type);
  formData.append("reason", payload.reason);
  formData.append("returnItems", JSON.stringify(payload.returnItems));
  formData.append("exchangeItems", JSON.stringify(payload.exchangeItems));
  formData.append("shippingAddress", JSON.stringify(payload.shippingAddress));

  if (payload.note) formData.append("note", payload.note);
  if (payload.refundBankAccountNumber) formData.append("refundBankAccountNumber", payload.refundBankAccountNumber);
  if (payload.refundBankAccountHolder) formData.append("refundBankAccountHolder", payload.refundBankAccountHolder);
  if (payload.refundBankName) formData.append("refundBankName", payload.refundBankName);
  if (payload.refundBankBranch) formData.append("refundBankBranch", payload.refundBankBranch);

  for (const file of evidenceFiles) {
    formData.append("files", file);
  }

  return formData;
}
