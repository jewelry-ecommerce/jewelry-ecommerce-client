import { beforeEach, expect, test, vi } from "vitest";
const transport = vi.hoisted(() => ({ post: vi.fn(), get: vi.fn() }));
vi.mock("@/utils/axios", () => ({ authAxios: { post: transport.post }, commonAxios: { get: transport.get } }));
import { javaMomoPayment, latestOrderPhone, javaPaymentMethod } from "./java-momo.api";
beforeEach(() => { transport.post.mockReset(); sessionStorage.clear(); });

test("payment start sends phone from this order only and accepts sandbox URL", async () => {
  sessionStorage.setItem("latest_order", JSON.stringify({ orderCode: "DH1", phone: "0901234567" }));
  transport.post.mockResolvedValue({ data: { orderCode: "DH1", sandbox: true, paymentUrl: "https://test-payment.momo.vn/pay/1" } });
  await javaMomoPayment("DH1");
  expect(transport.post).toHaveBeenCalledWith("storefront/payment/momo/start", { orderCode: "DH1", phone: "0901234567" });
  expect(latestOrderPhone("DH2")).toBeUndefined();
});
test("foreign links and production links cannot redirect the sandbox checkout", async () => {
  for (const paymentUrl of ["https://evil.test/pay", "https://payment.momo.vn/pay", "http://test-payment.momo.vn/pay"]) {
    transport.post.mockResolvedValue({ data: { orderCode: "DH1", sandbox: true, paymentUrl } });
    await expect(javaMomoPayment("DH1")).rejects.toThrow("không hợp lệ");
  }
});
test("malformed storage does not become an order credential; unsupported payment does not become COD", () => {
  sessionStorage.setItem("latest_order", "invalid-json");
  expect(latestOrderPhone("DH1")).toBeUndefined();
  expect(javaPaymentMethod("MOMO_WALLET")).toBe("MOMO");
  expect(() => javaPaymentMethod("PAYOO")).toThrow();
});
