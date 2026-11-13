import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

const harness = vi.hoisted(() => ({
  replace: vi.fn(),
  confirm: vi.fn(),
  query: "orderCode=DH1&txnRef=DH19&amount=25000&sig=abc",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: harness.replace }),
  useSearchParams: () => new URLSearchParams(harness.query),
}));

vi.mock("@/utils/api/java/java-vnpay.api", () => ({
  javaVnpayDemoConfirm: (...args: unknown[]) => harness.confirm(...args),
}));

import VnpayDemo from "./vnpay-demo";

afterEach(() => {
  cleanup();
  harness.replace.mockReset();
  harness.confirm.mockReset();
  harness.query = "orderCode=DH1&txnRef=DH19&amount=25000&sig=abc";
});

test("trial payment confirms then opens the status page", async () => {
  harness.confirm.mockResolvedValue({
    orderCode: "DH1",
    success: true,
    redirect: "/trang-thai-thanh-toan?status=success&orderCode=DH1",
  });
  render(<VnpayDemo />);
  expect(screen.getByText("Mã đơn: DH1")).toBeTruthy();
  expect(screen.getByText(/Số tiền:.*25/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Thanh toán thử" }));
  await vi.waitFor(() => expect(harness.replace).toHaveBeenCalledWith(
    "/trang-thai-thanh-toan?status=success&orderCode=DH1",
  ));
  expect(harness.confirm).toHaveBeenCalledWith({
    orderCode: "DH1", txnRef: "DH19", amount: 25000, success: true, sig: "abc",
  });
});

test("cancel posts an unsuccessful confirm", async () => {
  harness.confirm.mockResolvedValue({
    orderCode: "DH1",
    success: false,
    redirect: "/trang-thai-thanh-toan?status=failed&orderCode=DH1",
  });
  render(<VnpayDemo />);
  fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
  await vi.waitFor(() => expect(harness.confirm).toHaveBeenCalledWith(
    expect.objectContaining({ success: false }),
  ));
  expect(harness.replace).toHaveBeenCalledWith("/trang-thai-thanh-toan?status=failed&orderCode=DH1");
});
