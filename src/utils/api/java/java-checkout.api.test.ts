import { afterEach, beforeEach, expect, test, vi } from "vitest";
import axios, { type AxiosResponse } from "axios";
const transport = vi.hoisted(() => ({ common: { post: vi.fn() }, auth: { post: vi.fn(), get: vi.fn() } }));
const storage = vi.hoisted(() => ({ owned: vi.fn(), save: vi.fn() }));
vi.mock("@/utils/axios", () => ({ commonAxios: transport.common, authAxios: transport.auth }));
vi.mock("./java-checkout.storage", () => ({ ownedJavaDraft: storage.owned, saveJavaDraft: storage.save }));
vi.mock("../cart/cart.util", () => ({ withFreshGuestCartHeader: () => ({ headers: { "x-guest-id": "guest-1" } }) }));
import { javaPlaceOrder, javaUpdatePricing, javaUpdateAddress } from "./java-checkout.api";
import type { JavaDraft } from "./java-commerce.types";
function draft(): JavaDraft {
  return { session: { checkoutSessionId: "checkout-1", status: "DRAFT", totalAmount: 0, consentThirdPartySharing: false, shippingAddress: {
    firstName: "Khách", receiverPhone: "0796406514", provinceName: "Hồ Chí Minh", wardName: "Phường 1",
    addressLine: "12 Đường A", provinceCode: 0, wardCode: 0,
  } }, items: [{ skuId: 12, quantity: 2 }], authenticated: false, ownerId: null, expiresAt: Date.now() + 60000 };
}
beforeEach(() => {
  transport.common.post.mockImplementation(async (path: string) => ({ data: path.includes("quote") ? {
    items: [{ id: 1, productId: 4, skuId: 12, name: "Nhẫn", imageUrl: null, quantity: 2, unitPrice: 100, lineTotal: 200 }],
    summary: { subtotal: 200, productDiscount: 0, voucherDiscount: 0, shippingFee: 0, grandTotal: 200 },
  } : { id: 42, code: "ORD42", status: "PENDING", paymentMethod: "COD" } }));
});
afterEach(() => vi.resetAllMocks());

test("missing order code never marks the session as placed", async () => {
  const value=draft();storage.owned.mockResolvedValue(value);
  transport.common.post.mockImplementation(async(path:string)=>({data:path.includes("quote")
    ?{items:[],summary:{subtotal:200,productDiscount:0,voucherDiscount:0,shippingFee:0,grandTotal:200}}
    :{status:404,message:"Invalid SKU"}}));
  await expect(javaPlaceOrder("checkout-1",{paymentMethod:"COD",consent:false})).rejects.toThrow("mã đơn");
  expect(value.placed).toBeUndefined();expect(value.uncertain).toBe(true);
});
test("guest COD uses numeric SKU, backend totals, real address and guest cart header", async () => {
  const value = draft(); storage.owned.mockResolvedValue(value);
  const result = await javaPlaceOrder("checkout-1", { paymentMethod: "COD", consent: false });
  expect(result.orderId).toBe("42");
  expect(value.session.pricing?.grandTotal).toBe(200);
  expect(transport.common.post).toHaveBeenCalledWith("storefront/order/guest", expect.objectContaining({
    recipientName: "Khách", phone: "0796406514", province: "Hồ Chí Minh", items: [{ skuId: 12, quantity: 2 }],
    paymentMethod: "COD",
  }), expect.objectContaining({ headers: expect.objectContaining({ "x-guest-id": "guest-1", "Idempotency-Key": expect.any(String) }) }));
});
test("authenticated COD saves new address once and uses the returned numeric ID", async () => {
  const value = draft(); value.authenticated = true; value.ownerId = "7"; storage.owned.mockResolvedValue(value);
  transport.auth.post.mockImplementation(async (path: string) => ({ data: path.endsWith("addresses") ? { id: 15 } :
    { id: 43, code: "ORD43", status: "PENDING", paymentMethod: "COD" } }));
  await javaPlaceOrder("checkout-1", { paymentMethod: "COD", consent: false });
  expect(transport.auth.post).toHaveBeenCalledWith("storefront/order", expect.objectContaining({ addressId: 15 }),
    expect.objectContaining({ headers: expect.objectContaining({ "Idempotency-Key": expect.any(String) }) }));
  expect(transport.common.post.mock.calls.some(call => call[0] === "storefront/order/guest")).toBe(false);
});
test("double click shares one placement and reloading a placed draft never creates again", async () => {
  const value = draft(); storage.owned.mockResolvedValue(value);
  const first = javaPlaceOrder("checkout-1", { consent: false }), second = javaPlaceOrder("checkout-1", { consent: false });
  expect(first).toBe(second); await first; await javaPlaceOrder("checkout-1", { consent: false });
  expect(transport.common.post.mock.calls.filter(call => call[0] === "storefront/order/guest")).toHaveLength(1);
});
test("v6 retries a lost response with the same key and frozen body, without re-quoting", async () => {
  const value = draft(); storage.owned.mockResolvedValue(value);
  transport.common.post.mockRejectedValueOnce(new axios.AxiosError("offline"));
  await expect(javaPlaceOrder("checkout-1", { consent: false })).rejects.toThrow("offline");
  // Quote failed before order submission, so this attempt remains retryable.
  expect(value.uncertain).toBeUndefined();
  transport.common.post.mockImplementation(async (path: string) => {
    if (path.includes("quote")) return { data: { items: [], summary: { subtotal: 200, productDiscount: 0, voucherDiscount: 0, shippingFee: 0, grandTotal: 200 } } };
    throw new axios.AxiosError("connection lost after submit");
  });
  await expect(javaPlaceOrder("checkout-1", { consent: false })).rejects.toThrow("connection lost");
  expect(value.uncertain).toBe(true);
  const submission = value.submission;
  const quoteCalls = transport.common.post.mock.calls.filter(call => call[0].includes('quote')).length;
  transport.common.post.mockResolvedValue({ data: { id: 42, code: 'ORD42', status: 'PENDING', paymentMethod: 'COD' } });
  await javaPlaceOrder("checkout-1", { consent: false });
  expect(transport.common.post).toHaveBeenLastCalledWith(submission!.path, submission!.body,
    expect.objectContaining({ headers: expect.objectContaining({ 'Idempotency-Key': submission!.key }) }));
  expect(transport.common.post.mock.calls.filter(call => call[0].includes('quote'))).toHaveLength(quoteCalls);
  expect(value.uncertain).toBe(false);
});
test("online payment and multiple vouchers cannot silently fall back to COD", async () => {
  storage.owned.mockResolvedValue(draft());
  await expect(javaPlaceOrder("checkout-1", { paymentMethod: "MOMO", consent: false })).rejects.toThrow("COD");
  await expect(javaUpdatePricing("checkout-1", { couponCodes: ["A", "B"] })).rejects.toThrow("một voucher");
  expect(transport.common.post).not.toHaveBeenCalled();
});
test("saved address selection must belong to the current customer", async () => {
  storage.owned.mockResolvedValue(draft()); transport.auth.get.mockResolvedValue({ data: [{ id: 15 }] });
  await expect(javaUpdateAddress("checkout-1", { addressId: "99" })).rejects.toThrow("địa chỉ");
  expect(transport.common.post).not.toHaveBeenCalled();
});
test('key-reused conflict remains locked; editing the payload cannot silently generate another key',async()=>{
  const value=draft();storage.owned.mockResolvedValue(value);
  const response={status:409,data:{errors:[{code:'IDEMPOTENCY_KEY_REUSED'}]}};
  transport.common.post.mockImplementation(async(path:string)=>{
    if(path.includes('quote'))return {data:{items:[],summary:{subtotal:200,productDiscount:0,voucherDiscount:0,shippingFee:0,grandTotal:200}}};
    throw new axios.AxiosError('Key reused',undefined,undefined,undefined,response as AxiosResponse);
  });
  await expect(javaPlaceOrder('checkout-1',{consent:false})).rejects.toThrow('Key reused');
  const key=value.submission?.key;expect(value.uncertain).toBe(true);
  await expect(javaPlaceOrder('checkout-1',{consent:false,note:'Changed'})).rejects.toThrow('Giữ nguyên');
  expect(value.submission?.key).toBe(key);
});
