import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import cartReducer from "@/redux/slices/cart.slice";
import { performCartMergeAndSync } from "./use-cart-sync.hook";
import { getCartApiOptions } from "@/utils/api/cart/cart.util";
import { GUEST_CART_ID_STORAGE_KEY } from "@/utils/api/cart/guest-cart-id.util";

const getCartMock = vi.fn();
const mergeCartMock = vi.fn();

vi.mock("@/utils/api", () => ({
  CartApi: {
    getCart: (...args: unknown[]) => getCartMock(...args),
    mergeCart: (...args: unknown[]) => mergeCartMock(...args),
  },
}));

describe("getCartApiOptions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("skips auth logout for guest", () => {
    expect(getCartApiOptions(false)).toEqual({ skipAuthLogout: true });
  });

  it("does not skip auth logout for logged-in user", () => {
    expect(getCartApiOptions(true)).toEqual({ skipAuthLogout: false });
  });

  it("includes x-guest-id header when guest id is stored", () => {
    localStorage.setItem(GUEST_CART_ID_STORAGE_KEY, "guest-123");

    expect(getCartApiOptions(false)).toEqual({
      skipAuthLogout: true,
      headers: { "x-guest-id": "guest-123" },
    });
    expect(getCartApiOptions(true)).toEqual({
      skipAuthLogout: false,
      headers: { "x-guest-id": "guest-123" },
    });
  });
});

describe("performCartMergeAndSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    getCartMock.mockResolvedValue([]);
    mergeCartMock.mockResolvedValue({ success: true, items: [] });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("calls merge then sync when logged in and guest id exists", async () => {
    localStorage.setItem(GUEST_CART_ID_STORAGE_KEY, "guest-123");
    const testStore = configureStore({ reducer: { cart: cartReducer } });
    const dispatchSpy = vi.spyOn(testStore, "dispatch");

    await performCartMergeAndSync(testStore.dispatch, true);

    expect(mergeCartMock).toHaveBeenCalledWith({
      skipAuthLogout: false,
      headers: { "x-guest-id": "guest-123" },
    });
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(testStore.getState().cart.loading).toBe(false);
  });

  it("skips merge when guest is not logged in", async () => {
    localStorage.setItem(GUEST_CART_ID_STORAGE_KEY, "guest-123");
    const testStore = configureStore({ reducer: { cart: cartReducer } });
    const dispatchSpy = vi.spyOn(testStore, "dispatch");

    await performCartMergeAndSync(testStore.dispatch, false);

    expect(mergeCartMock).not.toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  });

  it("skips merge when guest id is missing", async () => {
    const testStore = configureStore({ reducer: { cart: cartReducer } });
    const dispatchSpy = vi.spyOn(testStore, "dispatch");

    await performCartMergeAndSync(testStore.dispatch, true);

    expect(mergeCartMock).not.toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  });

  it("still syncs when merge fails", async () => {
    localStorage.setItem(GUEST_CART_ID_STORAGE_KEY, "guest-123");
    mergeCartMock.mockRejectedValue(new Error("merge failed"));
    const testStore = configureStore({ reducer: { cart: cartReducer } });
    const dispatchSpy = vi.spyOn(testStore, "dispatch");

    await performCartMergeAndSync(testStore.dispatch, true);

    expect(mergeCartMock).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(testStore.getState().cart.loading).toBe(false);
  });
});
