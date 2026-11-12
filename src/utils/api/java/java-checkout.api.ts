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
  await quoteDraft(draft); draft.submission = undefined; saveJavaDraft(draft); return draft.session;
}
export async function javaUpdatePricing(id: string, body: UpdatePricingContextPayload) {
  const draft = await ownedJavaDraft(id);
  if (draft.placed || draft.uncertain) throw new Error("Phiên đã đặt hàng hoặc cần kiểm tra kết quả.");
  if (body.paymentMethod && body.paymentMethod !== JAVA_CHECKOUT_POLICY.paymentMethod) throw new Error("Hiện chỉ hỗ trợ thanh toán COD.");
  if ((body.couponCodes?.length ?? 0) > 1) throw new Error("Java chỉ hỗ trợ một voucher trên đơn hàng.");
  draft.session.couponCodes = body.couponCodes ?? draft.session.couponCodes;
  await quoteDraft(draft); draft.submission = undefined; saveJavaDraft(draft); return draft.session;
}
async function createJavaOrder(draft: JavaDraft): Promise<JavaOrder> {
  if (draft.submission) return submitJavaOrder(draft);
  const body = guestBody(draft);
  if (!draft.authenticated) {
    draft.submission = { path: "storefront/order/guest", body, key: crypto.randomUUID() };
    saveJavaDraft(draft); return submitJavaOrder(draft);
  }
  if (!draft.addressId) {
    const address = (await authAxios.post<JavaAddress>("storefront/me/addresses", javaAddressBody(draft.session.shippingAddress ?? {}))).data;
    draft.addressId = String(address.id); saveJavaDraft(draft);
  }
  draft.submission = { path: "storefront/order", key: crypto.randomUUID(), body: {
    addressId: Number(draft.addressId), items: draft.items, paymentMethod: body.paymentMethod,
    shippingMethod: body.shippingMethod, voucherCode: body.voucherCode, note: body.note } };
  saveJavaDraft(draft); return submitJavaOrder(draft);
}
async function submitJavaOrder(draft: JavaDraft): Promise<JavaOrder> {
  const submission = draft.submission;
  if (!submission) throw new Error("Thiếu thông tin yêu cầu đặt hàng.");
  const headers = { ...withFreshGuestCartHeader().headers, "Idempotency-Key": submission.key };
  const transport = draft.authenticated ? authAxios : commonAxios;
  return (await transport.post<JavaOrder>(submission.path, submission.body, { headers })).data;
}
const pendingOrders = new Map<string, Promise<NonNullable<JavaDraft["placed"]>>>();
async function placeDraft(id: string, body: PlaceOrderPayload): Promise<NonNullable<JavaDraft["placed"]>> {
  const draft = await ownedJavaDraft(id);
  if (draft.placed) return draft.placed;
  if (draft.uncertain && !draft.submission) throw new Error("Chưa xác định được kết quả đặt đơn. Kiểm tra lịch sử/tra cứu đơn trước khi đặt lại để tránh trùng đơn.");
  if (body.paymentMethod && body.paymentMethod !== JAVA_CHECKOUT_POLICY.paymentMethod) throw new Error("Hiện chỉ hỗ trợ COD.");
  if (body.vatInvoice) throw new Error("Java chưa hỗ trợ hóa đơn VAT.");
  if (draft.uncertain && (body.note !== draft.session.note || (body.contactEmail ?? body.email) !== draft.session.contactEmail))
    throw new Error("Yêu cầu trước chưa rõ kết quả. Giữ nguyên thông tin để thử lại cùng mã yêu cầu.");
  if (!draft.uncertain) {
    draft.session.note = body.note; draft.session.contactEmail = body.contactEmail ?? body.email;
    await quoteDraft(draft);
  }
  draft.uncertain = true; saveJavaDraft(draft);
  try {
    const order = await createJavaOrder(draft);
    if (!order || !/^[1-9][0-9]*$/.test(String(order.id)) || !order.code?.trim())
      throw new Error("Chưa nhận được mã đơn hợp lệ. Kiểm tra đơn hàng trước khi đặt lại.");
    draft.placed = { orderId: String(order.id), orderCode: order.code, status: order.status, paymentMethod: order.paymentMethod };
    draft.uncertain = false; draft.session.status = "PLACED"; draft.session.orderCode = order.code;
    saveJavaDraft(draft); return draft.placed;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status < 500 && !idempotencyConflict(error.response.data)) {
      draft.uncertain = false; draft.submission = undefined;
    }
    saveJavaDraft(draft); throw error;
  }
}
function idempotencyConflict(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false;
  if ('code' in payload && payload.code === 'IDEMPOTENCY_KEY_REUSED') return true;
  return 'errors' in payload && Array.isArray(payload.errors)
    && payload.errors.some(error => error && typeof error === 'object' && error.code === 'IDEMPOTENCY_KEY_REUSED');
}
export function javaPlaceOrder(id: string, body: PlaceOrderPayload): Promise<NonNullable<JavaDraft["placed"]>> {
  const pending = pendingOrders.get(id); if (pending) return pending;
  const operation = placeDraft(id, body).finally(() => pendingOrders.delete(id));
  pendingOrders.set(id, operation); return operation;
}
