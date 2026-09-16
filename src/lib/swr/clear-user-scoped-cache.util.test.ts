import { describe, expect, it, vi } from "vitest";
import {
  isGuestOrderAccessSwrKey,
  isOrderDetailSwrKey,
  isOrdersMeSwrKey,
  isUserScopedSwrKey,
  revalidateOrderRelatedCaches,
} from "./clear-user-scoped-cache.util";

describe("isUserScopedSwrKey", () => {
  it("matches customer-profile string and tuple keys", () => {
    expect(isUserScopedSwrKey("customer-profile")).toBe(true);
    expect(isUserScopedSwrKey(["customer-profile", "user-1"])).toBe(true);
  });

  it("matches order history infinite keys", () => {
    expect(isUserScopedSwrKey(["orders-me-infinite", "user-1", {}, 1])).toBe(true);
  });

  it("ignores unrelated keys", () => {
    expect(isUserScopedSwrKey("catalog/products/foo")).toBe(false);
    expect(isUserScopedSwrKey(["product-badges", "x"])).toBe(false);
  });
});

describe("isOrdersMeSwrKey", () => {
  it("matches both orders-me and orders-me-infinite", () => {
    expect(isOrdersMeSwrKey(["orders-me", "user-1"])).toBe(true);
    expect(isOrdersMeSwrKey(["orders-me-infinite", "user-1", {}, 1])).toBe(true);
    expect(isOrdersMeSwrKey(["header-user-orders-count", "user-1"])).toBe(false);
  });

  it("matches SWR Infinite meta keys so cancel invalidation clears list cache", () => {
    expect(isOrdersMeSwrKey(["$inf$", ["orders-me-infinite", "user-1", {}, 1]])).toBe(true);
    expect(isOrdersMeSwrKey('$inf$["orders-me-infinite","user-1"]')).toBe(true);
  });
});

describe("isOrderDetailSwrKey", () => {
  it("matches pre-order and retail detail cache keys", () => {
    expect(isOrderDetailSwrKey("order/SEVA_1/pre-order-detail", "SEVA_1")).toBe(true);
    expect(isOrderDetailSwrKey("order/SEVA_1", "SEVA_1")).toBe(true);
    expect(isOrderDetailSwrKey("order/OTHER/pre-order-detail", "SEVA_1")).toBe(false);
  });
});

describe("isGuestOrderAccessSwrKey", () => {
  it("matches guest retail and pre-order access keys", () => {
    expect(isGuestOrderAccessSwrKey("guest-order-access:abc")).toBe(true);
    expect(isGuestOrderAccessSwrKey("pre-order-guest-access:xyz")).toBe(true);
    expect(isGuestOrderAccessSwrKey("order/SEVA_1")).toBe(false);
  });
});

describe("revalidateOrderRelatedCaches", () => {
  it("revalidates guest-order-access after cancel", async () => {
    const mutateSwr = vi.fn(async (filter: (key: unknown) => boolean) => {
      expect(filter("guest-order-access:uuid-1")).toBe(true);
      expect(filter("order/SEVA_1")).toBe(true);
      expect(filter("catalog/products")).toBe(false);
      return undefined;
    });

    await revalidateOrderRelatedCaches(mutateSwr, "SEVA_1");

    expect(mutateSwr).toHaveBeenCalledWith(expect.any(Function), undefined, { revalidate: true });
  });
});
