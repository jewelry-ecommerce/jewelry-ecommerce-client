import { beforeEach, expect, test, vi } from "vitest";

const { transport } = vi.hoisted(() => ({ transport: { post: vi.fn() } }));
vi.mock("@/utils/axios", () => ({ commonAxios: transport, authAxios: transport }));

import { isPayosPayUrl, javaPaymentMethod, javaPayosStart, payosStartUrl } from "./java-payos.api";

test("accepts only COD or PayOS", () => {
  expect(javaPaymentMethod(undefined)).toBe("COD");
  expect(javaPaymentMethod("PAYOS")).toBe("PAYOS");
  expect(() => javaPaymentMethod("MOMO")).toThrow("PayOS");
});

test("builds the start page and allows only pay.payos.vn", () => {
  expect(payosStartUrl("DH1")).toBe("/thanh-toan-payos?orderCode=DH1&start=1");
  expect(isPayosPayUrl("https://pay.payos.vn/web/abc")).toBe(true);
  expect(isPayosPayUrl("http://pay.payos.vn/web/abc")).toBe(false);
  expect(isPayosPayUrl("https://evil.payos.vn/web/abc")).toBe(false);
  expect(isPayosPayUrl("https://user:pass@pay.payos.vn/web/abc")).toBe(false);
});

test("starts PayOS with the guest phone", async () => {
  transport.post.mockResolvedValue({ data: { orderCode: "DH1", payUrl: "https://pay.payos.vn/web/abc", redirect: true } });
  await javaPayosStart("DH1", "0900000000");
  expect(transport.post).toHaveBeenCalledWith("storefront/payment/payos/start", { orderCode: "DH1", phone: "0900000000" });
});

beforeEach(() => {
  transport.post.mockReset();
});
