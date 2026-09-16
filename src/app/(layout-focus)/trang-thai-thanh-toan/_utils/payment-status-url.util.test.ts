import { describe, expect, it } from "vitest";
import { buildChangePaymentMethodUrl, buildPaymentStatusUrl, stripOrderCodeFromPaymentStatusHref } from "./payment-status-url.util";

describe("buildPaymentStatusUrl", () => {
  it("omits orderCode from the query string", () => {
    expect(
      buildPaymentStatusUrl({
        status: "pending",
        orderCode: "SEVA_SECRET",
        sessionId: "abc",
      }),
    ).toBe("/trang-thai-thanh-toan?status=pending&sessionId=abc");
  });

  it("returns bare path when no params remain", () => {
    expect(buildPaymentStatusUrl({ orderCode: "SEVA_SECRET" })).toBe("/trang-thai-thanh-toan");
  });
});

describe("buildChangePaymentMethodUrl", () => {
  it("does not expose orderCode in the query string", () => {
    expect(buildChangePaymentMethodUrl()).toBe("/xac-nhan-thanh-toan?from=update-payment-method");
  });
});

describe("stripOrderCodeFromPaymentStatusHref", () => {
  it("removes orderCode and keeps other params", () => {
    expect(stripOrderCodeFromPaymentStatusHref("/trang-thai-thanh-toan?status=pending&orderCode=SEVA&sessionId=1")).toBe(
      "/trang-thai-thanh-toan?status=pending&sessionId=1",
    );
  });
});
