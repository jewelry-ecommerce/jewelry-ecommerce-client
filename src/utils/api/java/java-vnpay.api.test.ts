import { afterEach, expect, test, vi } from "vitest";
import { isAllowedPayUrl, isDemoPayUrl, isSandboxPayUrl, javaPaymentMethod, javaVnpayDemoConfirm, javaVnpayStart, vnpayStartUrl } from "./java-vnpay.api";

const transport = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/utils/axios", () => ({ commonAxios: { post: transport.post, get: vi.fn() }, authAxios: {} }));

afterEach(() => vi.resetAllMocks());

test("payment method accepts COD and VNPay only", () => {
  expect(javaPaymentMethod(undefined)).toBe("COD");
  expect(javaPaymentMethod("VNPAY")).toBe("VNPAY");
  expect(() => javaPaymentMethod("MOMO")).toThrow("COD");
});

test("start page url is internal and sandbox pay url is host-locked", () => {
  expect(vnpayStartUrl("DH1")).toBe("/thanh-toan-vnpay?orderCode=DH1&start=1");
  expect(isSandboxPayUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=DH1")).toBe(true);
  expect(isSandboxPayUrl("https://pay.vnpay.vn/paymentv2/vpcpay.html")).toBe(false);
  expect(isSandboxPayUrl("http://sandbox.vnpayment.vn/paymentv2/vpcpay.html")).toBe(false);
  expect(isDemoPayUrl("http://localhost:3100/thanh-toan-vnpay/demo?orderCode=DH1")).toBe(true);
  expect(isDemoPayUrl("/thanh-toan-vnpay/demo?orderCode=DH1&txnRef=DH11")).toBe(true);
  expect(isDemoPayUrl("https://sandbox.vnpayment.vn/thanh-toan-vnpay/demo")).toBe(false);
  expect(isDemoPayUrl("https://evil.example/thanh-toan-vnpay/demo")).toBe(false);
  expect(isDemoPayUrl("http://user:pass@localhost:3100/thanh-toan-vnpay/demo")).toBe(false);
  expect(isAllowedPayUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=DH1")).toBe(true);
});

test("start rejects a non-sandbox pay url", async () => {
  transport.post.mockResolvedValue({ data: { orderCode: "DH1", payUrl: "https://pay.vnpay.vn/paymentv2/vpcpay.html", redirect: true } });
  await expect(javaVnpayStart("DH1", "0900000000")).rejects.toThrow("không hợp lệ");
  expect(transport.post).toHaveBeenCalledWith("storefront/payment/vnpay/start", { orderCode: "DH1", phone: "0900000000" });
});

test("start accepts the local demo pay page and confirm posts the signature", async () => {
  const payUrl = "http://localhost:3100/thanh-toan-vnpay/demo?orderCode=DH1&txnRef=DH11&amount=25000&sig=abc";
  const body = { orderCode: "DH1", txnRef: "DH11", amount: 25000, success: true, sig: "abc" };
  transport.post.mockResolvedValueOnce({ data: { orderCode: "DH1", payUrl, redirect: true } });
  await expect(javaVnpayStart("DH1")).resolves.toMatchObject({ payUrl, redirect: true });
  transport.post.mockResolvedValueOnce({ data: { orderCode: "DH1", success: true, redirect: "/trang-thai-thanh-toan?status=success&orderCode=DH1" } });
  await expect(javaVnpayDemoConfirm(body)).resolves.toMatchObject({ success: true });
  expect(transport.post).toHaveBeenLastCalledWith("storefront/payment/vnpay/demo/confirm", body);
});
