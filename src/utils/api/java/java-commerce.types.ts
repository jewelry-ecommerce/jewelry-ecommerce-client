import type { CheckoutSession, Address } from "../checkout/checkout.interface";
export const JAVA_CHECKOUT_POLICY = { storagePrefix: "java-checkout:", ttlMs: 30 * 60 * 1000, pageTake: 100,
  shippingMethod: "STANDARD", paymentMethod: "COD" } as const;
export interface JavaOrderLine { id: number | string; productId: number | string; skuId: number | string;
  name: string; imageUrl: string | null; quantity: number; unitPrice: number | string; lineTotal: number | string }
export interface JavaOrder { id: number | string; code: string; status: string; paymentStatus: string; paymentMethod: string;
  customerId?:number|string|null;contactEmail?:string|null;deliveredAt?:string|null;
  shippingMethod: string; shipRecipientName: string; shipPhone: string; shipProvince: string; shipWard: string;
  shipAddressLine: string; subtotal: number | string; productDiscount: number | string; voucherDiscount: number | string;
  shippingFee: number | string; grandTotal: number | string; placedAt: string; createdAt?: string; updatedAt?: string;
  note?: string; items: JavaOrderLine[]; timeline: Array<{ status: string; note?: string; occurredAt: string }> }
export interface JavaQuote { items: JavaOrderLine[]; summary: { subtotal: number; productDiscount: number;
  voucherDiscount: number; shippingFee: number; grandTotal: number }; estimatedDeliveryDate?: string }
export interface JavaAddress { id: number | string; recipientName: string; phone: string; province: string; ward: string;
  addressLine: string; isDefault: boolean }
export interface JavaCartLine { id: string; found: boolean; productId: string; variationId: string; name: string; skuCode: string;
  quantity: number; sellingPriceAfterTaxMinor: number; product?: { image?: string }; isValid: boolean }
export interface JavaDraft { session: CheckoutSession; items: Array<{ skuId: number; quantity: number }>;
  submission?: { path: string; body: Record<string, unknown>; key: string };
  addressId?: string; authenticated: boolean; ownerId: string | null; expiresAt: number; submitting?: boolean;
  uncertain?: boolean; placed?: { orderId: string; orderCode: string; status: string; paymentMethod: string } }
export interface JavaPage<T> { list: T[]; total: number; pagination: { hasNextPage: boolean; currentPage: number } }
export function javaAddressView(address: JavaAddress): Address {
  return { id: String(address.id), firstName: address.recipientName, lastName: "", receiverPhone: address.phone,
    provinceName: address.province, wardName: address.ward, addressLine: address.addressLine,
    provinceCode: 0, wardCode: 0, isDefault: address.isDefault };
}
