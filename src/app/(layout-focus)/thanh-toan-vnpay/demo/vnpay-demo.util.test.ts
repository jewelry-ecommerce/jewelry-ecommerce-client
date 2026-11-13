import { expect, test } from "vitest";
import { demoConfirmBody, demoStatusPath, formatDemoAmount } from "./vnpay-demo.util";

test("demo query becomes a confirm body and a status redirect", () => {
  const params = new URLSearchParams("orderCode=DH1&txnRef=DH19&amount=25000&sig=abc");
  expect(demoConfirmBody(params, true)).toEqual({
    orderCode: "DH1", txnRef: "DH19", amount: 25000, success: true, sig: "abc",
  });
  expect(demoConfirmBody(params, false)?.success).toBe(false);
  expect(demoConfirmBody(new URLSearchParams("orderCode=DH1"), true)).toBeNull();
  expect(formatDemoAmount("25000")).toMatch(/25[.,\s]000đ/);
  expect(demoStatusPath(true, "DH1", "/trang-thai-thanh-toan?status=success&orderCode=DH1"))
    .toBe("/trang-thai-thanh-toan?status=success&orderCode=DH1");
  expect(demoStatusPath(false, "DH1", "https://evil.example/trang-thai-thanh-toan"))
    .toBe("/trang-thai-thanh-toan?status=failed&orderCode=DH1");
});
