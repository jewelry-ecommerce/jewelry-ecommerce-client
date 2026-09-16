import { describe, expect, it } from "vitest";
import { resolvePaymentHoldCountdownParams, resolvePaymentHoldTiming } from "./payment-hold-timing.util";

describe("payment-hold-timing.util", () => {
  it("normalizes valid API payment hold fields", () => {
    const result = resolvePaymentHoldTiming({
      paymentLinkExpiresAt: "2026-07-09T10:00:00.000Z",
      orderExpiresAt: "2026-07-09T11:00:00.000Z",
      orderRemainingSeconds: 120,
    });

    expect(result.paymentLinkExpiresAt).toBe("2026-07-09T10:00:00.000Z");
    expect(result.orderExpiresAt).toBe("2026-07-09T11:00:00.000Z");
    expect(result.orderRemainingSeconds).toBe(120);
  });

  it("returns nulls when API has no hold fields (no FE invent)", () => {
    const result = resolvePaymentHoldTiming({});

    expect(result.paymentLinkExpiresAt).toBeNull();
    expect(result.orderExpiresAt).toBeNull();
    expect(result.orderRemainingSeconds).toBeNull();
  });

  it("treats orderRemainingSeconds = 0 as missing", () => {
    const result = resolvePaymentHoldTiming({ orderRemainingSeconds: 0 });

    expect(result.orderRemainingSeconds).toBeNull();
  });

  it("payment-session mode uses only paymentLinkExpiresAt from BE", () => {
    const params = resolvePaymentHoldCountdownParams(
      {
        paymentLinkExpiresAt: "2026-07-09T10:00:00.000Z",
        orderExpiresAt: "2026-07-09T11:00:00.000Z",
        orderRemainingSeconds: 3600,
      },
      { mode: "payment-session" },
    );

    expect(params.expiryAt).toBe("2026-07-09T10:00:00.000Z");
    expect(params.initialSeconds).toBeUndefined();
  });

  it("payment-session mode returns empty when paymentLinkExpiresAt missing", () => {
    const params = resolvePaymentHoldCountdownParams(
      {
        orderExpiresAt: "2026-07-09T11:00:00.000Z",
        orderRemainingSeconds: 3600,
      },
      { mode: "payment-session" },
    );

    expect(params).toEqual({});
  });

  it("order-hold mode uses orderExpiresAt and ignores paymentLinkExpiresAt", () => {
    const params = resolvePaymentHoldCountdownParams(
      {
        paymentLinkExpiresAt: "2026-07-09T10:00:00.000Z",
        orderExpiresAt: "2026-07-09T11:00:00.000Z",
      },
      { mode: "order-hold" },
    );

    expect(params.expiryAt).toBe("2026-07-09T11:00:00.000Z");
    expect(params.initialSeconds).toBeUndefined();
  });

  it("order-hold mode uses remaining seconds only when orderExpiresAt missing", () => {
    const params = resolvePaymentHoldCountdownParams(
      {
        paymentLinkExpiresAt: "2026-07-09T10:00:00.000Z",
        orderRemainingSeconds: 45,
      },
      { mode: "order-hold" },
    );

    expect(params.expiryAt).toBeUndefined();
    expect(params.initialSeconds).toBe(45);
  });

  it("order-hold mode returns empty when order fields missing", () => {
    const params = resolvePaymentHoldCountdownParams({ paymentLinkExpiresAt: "2026-07-09T10:00:00.000Z" }, { mode: "order-hold" });

    expect(params).toEqual({});
  });
});
