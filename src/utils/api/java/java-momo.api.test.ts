import { beforeEach, expect, test, vi } from "vitest";
const transport = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/utils/axios", () => ({ commonAxios: transport }));
import { isMomoPayUrl, javaMomoStart, javaPaymentMethod, momoStartUrl } from "./java-momo.api";

beforeEach(() => transport.post.mockReset());

test("payment method accepts COD and MoMo only", () => {
  expect(javaPaymentMethod(undefined)).toBe("COD");
  expect(javaPaymentMethod("MOMO")).toBe("MOMO");
  expect(() => javaPaymentMethod("VNPAY")).toThrow("MoMo");
});

test("start url stays on the shop and pay url must be MoMo https", () => {
  expect(momoStartUrl("DH1")).toBe("/thanh-toan-momo?orderCode=DH1&start=1");
  expect(isMomoPayUrl("https://test-payment.momo.vn/v2/gateway/pay?t=1")).toBe(true);
  expect(isMomoPayUrl("https://payment.momo.vn/v2/gateway/pay?t=1")).toBe(true);
  expect(isMomoPayUrl("http://test-payment.momo.vn/v2/gateway/pay")).toBe(false);
  expect(isMomoPayUrl("https://evil.momo.vn/v2/gateway/pay")).toBe(false);
  expect(isMomoPayUrl("https://user:pass@test-payment.momo.vn/pay")).toBe(false);
});

test("start rejects a pay url outside MoMo", async () => {
  transport.post.mockResolvedValue({ data: { orderCode: "DH1", payUrl: "https://pay.vnpay.vn/paymentv2/vpcpay.html", redirect: true } });
  await expect(javaMomoStart("DH1", "0900000000")).rejects.toThrow("MoMo");
  expect(transport.post).toHaveBeenCalledWith("storefront/payment/momo/start", { orderCode: "DH1", phone: "0900000000" });
});
