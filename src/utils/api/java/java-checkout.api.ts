import axios from "axios";
import { commonAxios, authAxios } from "@/utils/axios";
import { withFreshGuestCartHeader } from "../cart/cart.util";
import type { PlaceOrderPayload, UpdatePricingContextPayload, UpdateShippingAddressPayload, ShippingAddress } from "../checkout/checkout.interface";
import { JAVA_CHECKOUT_POLICY, javaAddressView, type JavaAddress, type JavaDraft, type JavaQuote, type JavaOrder } from "./java-commerce.types";
import { ownedJavaDraft, saveJavaDraft } from "./java-checkout.storage";
import { javaOrderItem } from "./java-order.mapper";

export function javaAddressBody(address: Partial<ShippingAddress>, isDefault = false) {
  return { recipientName: [address.lastName, address.firstName].filter(Boolean).join(" ").trim(),
    phone: address.receiverPhone, province: address.provinceName, ward: address.wardName,
    district: "", addressLine: address.addressLine, isDefault };
}
function guestBody(draft: JavaDraft) {
  const address = draft.session.shippingAddress;
  if (!address?.firstName || !address.receiverPhone || !address.provinceName || !address.wardName || !address.addressLine)
    throw new Error("Điền đầy đủ địa chỉ giao hàng.");
  return { ...javaAddressBody(address), items: draft.items, paymentMethod: JAVA_CHECKOUT_POLICY.paymentMethod,
    shippingMethod: JAVA_CHECKOUT_POLICY.shippingMethod, voucherCode: draft.session.couponCodes?.[0],
    note: draft.session.note, email: draft.session.contactEmail || undefined };
}
async function quoteDraft(draft: JavaDraft): Promise<void> {
  if (!draft.session.shippingAddress) return;
  const body = guestBody(draft);
  const quote = draft.authenticated && draft.addressId
    ? (await authAxios.post<JavaQuote>("storefront/checkout/quote", {
      addressId: Number(draft.addressId), items: draft.items, paymentMethod: body.paymentMethod,
      shippingMethod: body.shippingMethod, voucherCode: body.voucherCode,
    })).data
    : (await commonAxios.post<JavaQuote>("storefront/checkout/quote/guest", body)).data;
  const summary = quote.summary;
  draft.session.pricing = { subtotal: summary.subtotal, discountTotal: Number(summary.productDiscount) + Number(summary.voucherDiscount),
    shippingFee: summary.shippingFee, grandTotal: summary.grandTotal, taxTotal: 0 };
  draft.session.totalAmount = Number(summary.grandTotal);
  draft.session.items = quote.items.map(item => {
    const previous = draft.session.items?.find(line => line.type !== "SET" && line.variationId === String(item.skuId));
    return { ...javaOrderItem(item), skuCode: previous && previous.type !== "SET" ? previous.skuCode : "" };
  });
}
export async function javaUpdateAddress(id: string, body: UpdateShippingAddressPayload) {
  const draft = await ownedJavaDraft(id);
  if (draft.placed || draft.uncertain) throw new Error("Phiên đã đặt hàng hoặc cần kiểm tra kết quả, không thể sửa.");
  if (body.addressId) {
    const addresses = (await authAxios.get<JavaAddress[]>("storefront/me/addresses")).data;
    const address = addresses.find(entry => String(entry.id) === body.addressId);
    if (!address) throw new Error("Không tìm thấy địa chỉ.");
    draft.session.shippingAddress = javaAddressView(address);
    draft.addressId = body.addressId;
  } else { draft.session.shippingAddress = body.shippingAddress; draft.addressId = undefined; }
  await quoteDraft(draft); saveJavaDraft(draft); return draft.session;
}
export async function javaUpdatePricing(id: string, body: UpdatePricingContextPayload) {
  const draft = await ownedJavaDraft(id);
  if (draft.placed || draft.uncertain) throw new Error("Phiên đã đặt hàng hoặc cần kiểm tra kết quả.");
  if (body.paymentMethod && body.paymentMethod !== JAVA_CHECKOUT_POLICY.paymentMethod) throw new Error("Hiện chỉ hỗ trợ thanh toán COD.");
  if ((body.couponCodes?.length ?? 0) > 1) throw new Error("Java chỉ hỗ trợ một voucher trên đơn hàng.");
  draft.session.couponCodes = body.couponCodes ?? draft.session.couponCodes;
  await quoteDraft(draft); saveJavaDraft(draft); return draft.session;
}
async function createJavaOrder(draft: JavaDraft): Promise<JavaOrder> {
  const body = guestBody(draft);
  if (!draft.authenticated) return (await commonAxios.post<JavaOrder>("storefront/order/guest", body, withFreshGuestCartHeader())).data;
  if (!draft.addressId) {
    const address = (await authAxios.post<JavaAddress>("storefront/me/addresses", javaAddressBody(draft.session.shippingAddress ?? {}))).data;
    draft.addressId = String(address.id); saveJavaDraft(draft);
  }
  return (await authAxios.post<JavaOrder>("storefront/order", { addressId: Number(draft.addressId), items: draft.items,
    paymentMethod: body.paymentMethod, shippingMethod: body.shippingMethod, voucherCode: body.voucherCode, note: body.note })).data;
}
const pendingOrders = new Map<string, Promise<NonNullable<JavaDraft["placed"]>>>();
async function placeDraft(id: string, body: PlaceOrderPayload): Promise<NonNullable<JavaDraft["placed"]>> {
  const draft = await ownedJavaDraft(id);
  if (draft.placed) return draft.placed;
  if (draft.uncertain) throw new Error("Chưa xác định được kết quả đặt đơn. Kiểm tra lịch sử/tra cứu đơn trước khi đặt lại để tránh trùng đơn.");
  if (body.paymentMethod && body.paymentMethod !== JAVA_CHECKOUT_POLICY.paymentMethod) throw new Error("Hiện chỉ hỗ trợ COD.");
  if (body.vatInvoice) throw new Error("Java chưa hỗ trợ hóa đơn VAT.");
  draft.session.note = body.note; draft.session.contactEmail = body.contactEmail ?? body.email;
  await quoteDraft(draft);
  draft.uncertain = true; saveJavaDraft(draft);
  try {
    const order = await createJavaOrder(draft);
    draft.placed = { orderId: String(order.id), orderCode: order.code, status: order.status, paymentMethod: order.paymentMethod };
    draft.uncertain = false; draft.session.status = "PLACED"; draft.session.orderCode = order.code;
    saveJavaDraft(draft); return draft.placed;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status < 500) draft.uncertain = false;
    saveJavaDraft(draft); throw error;
  }
}
export function javaPlaceOrder(id: string, body: PlaceOrderPayload): Promise<NonNullable<JavaDraft["placed"]>> {
  const pending = pendingOrders.get(id); if (pending) return pending;
  const operation = placeDraft(id, body).finally(() => pendingOrders.delete(id));
  pendingOrders.set(id, operation); return operation;
}
