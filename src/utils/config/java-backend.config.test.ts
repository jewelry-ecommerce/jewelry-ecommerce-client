import { afterEach, describe, expect, it, vi } from "vitest";
import { isJavaBackend, javaApiPath, normalizeJavaPage, unwrapJavaResponse } from "./java-backend.config";

afterEach(() => vi.unstubAllEnvs());

describe("Java contract transport", () => {
  it("enables Java only when explicitly configured", () => {
    vi.stubEnv("NEXT_PUBLIC_BACKEND_PROVIDER", "JAVA");
    expect(isJavaBackend()).toBe(true);
    vi.stubEnv("NEXT_PUBLIC_BACKEND_PROVIDER", "NEST");
    expect(isJavaBackend()).toBe(false);
  });
  it.each([
    ["iam/customer/login", "auth/login"],
    ["iam/customer/profile", "storefront/me"],
    ["/cart/cart", "storefront/cart/cart"],
    ["cart/cart/merge", "storefront/cart/cart/merge"],
    ["catalog/products/ring", "storefront/product/ring"],
    ["cms/storefront/pages/home", "storefront/cms/pages/home"],
    ["order/orders/me/123", "storefront/order/123"]
  ])("maps %s without duplicating storefront", (source, target) => {
    expect(javaApiPath(source)).toBe(target);
    expect(javaApiPath(target)).toBe(target);
  });
  it("unwraps successful responses without converting numeric IDs", () => {
    expect(unwrapJavaResponse({ status: 200, data: { id: 17 } })).toEqual({ id: 17 });
  });
  it("keeps validation errors readable", () => {
    const failure = { status: 400, message: "Không đủ tồn kho", data: null };
    expect(unwrapJavaResponse(failure)).toEqual(failure);
  });
  it("normalizes the Java PageResponse with one-based paging", () => {
    const page = normalizeJavaPage({ content: [{ id: 7 }], page: 2, size: 20, totalElements: 21, totalPages: 2 });
    expect(page).toMatchObject({ list: [{ id: 7 }], total: 21, pagination: {
      currentPage: 2, hasNextPage: false, hasPreviousPage: true
    } });
  });
});
