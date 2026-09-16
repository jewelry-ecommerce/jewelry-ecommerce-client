import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import type { AuthState, CartState } from "@/redux/types";
import authReducer from "@/redux/slices/auth.slice";
import cartReducer, { endCartWritePending, syncCartFromServer, updateCartItem } from "@/redux/slices/cart.slice";
import useCartSummary from "./use-cart-summary.hook";

vi.mock("@/utils/api", () => ({
  CartApi: {
    calculateCartTotal: vi.fn(),
  },
}));

import { CartApi } from "@/utils/api";

const createCartItem = (overrides: Partial<CartViewItem> = {}): CartViewItem => ({
  id: "item-1",
  productSlug: "product-1",
  name: "Test Product",
  image: { src: "/test.jpg", alt: "Test" },
  quantity: 2,
  unitPrice: 100_000,
  price: { current: "100.000đ" },
  selected: true,
  ...overrides,
});

// set term
const createSetCartItem = (): CartViewItem => ({
  ...createCartItem({ id: "set-1", quantity: 1 }),
  setId: "set-1",
  isSet: true,
  setComponents: [
    createCartItem({ id: "variation-1", variationId: "variation-1", setItemId: "set-item-1", quantity: 1 }),
    createCartItem({ id: "variation-2", variationId: "variation-2", setItemId: "set-item-2", quantity: 1 }),
  ],
});

const initialAuthState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isLogin: false,
  isResolved: true,
  user: null,
};

const initialCartState: CartState = {
  items: [],
  summary: null,
  loading: false,
  writePendingCount: 0,
  error: null,
  isDrawerOpen: false,
};

const createTestStore = (items: CartViewItem[] = [], cartOverrides: Partial<CartState> = {}) =>
  configureStore({
    reducer: { auth: authReducer, cart: cartReducer },
    preloadedState: {
      auth: initialAuthState,
      cart: { ...initialCartState, items, ...cartOverrides },
    },
  });

type ProviderWrapperProps = React.PropsWithChildren<{ store: ReturnType<typeof createTestStore> }>;

const ReduxProviderWrapper: React.FC<ProviderWrapperProps> = ({ store, children }) =>
  React.createElement(Provider as React.ComponentType<React.PropsWithChildren<{ store: typeof store }>>, { store }, children);

const createWrapper = (testStore: ReturnType<typeof createTestStore>) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(ReduxProviderWrapper, { store: testStore }, children);
  };

describe("useCartSummary", () => {
  const calculateCartTotalMock = vi.mocked(CartApi.calculateCartTotal);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    calculateCartTotalMock.mockResolvedValue({
      subTotal: 250_000,
      discountTotal: 0,
      discounts: [],
      shippingFee: 0,
      totalAmount: 250_000,
      rewardPoints: 250,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fetches API summary after debounce", async () => {
    const items = [createCartItem()];
    const testStore = createTestStore(items);

    const { result } = renderHook(() => useCartSummary({ enabled: true, debounceMs: 500, shouldUpdateRedux: true }), {
      wrapper: createWrapper(testStore),
    });

    // While waiting for calculate, keep loading so summary UI does not flash zeros.
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(calculateCartTotalMock).toHaveBeenCalledWith(
      {
        items: [{ variationId: "item-1", quantity: 2 }],
      },
      { skipAuthLogout: true },
    );
    expect(result.current.summary.totalAmount).toBe(250_000);
    expect(result.current.isLoading).toBe(false);
    expect(testStore.getState().cart.summary).toEqual(result.current.summary);
  });

  // set term
  it("sends a selected Set to calculate-total as one Set payload", async () => {
    const testStore = createTestStore([createSetCartItem()]);

    renderHook(() => useCartSummary({ enabled: true, debounceMs: 500, shouldUpdateRedux: false }), {
      wrapper: createWrapper(testStore),
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(calculateCartTotalMock).toHaveBeenCalledWith(
      {
        items: [
          {
            setId: "set-1",
            quantity: 1,
            setComponents: [
              { setItemId: "set-item-1", variationId: "variation-1" },
              { setItemId: "set-item-2", variationId: "variation-2" },
            ],
          },
        ],
      },
      { skipAuthLogout: true },
    );
  });

  it("stays loading when cart selection changes until new calculate resolves", async () => {
    const testStore = createTestStore([createCartItem()]);

    const { result, rerender } = renderHook(() => useCartSummary({ enabled: true, debounceMs: 500, shouldUpdateRedux: false }), {
      wrapper: createWrapper(testStore),
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      testStore.dispatch(updateCartItem({ id: "item-1", quantity: 3, selected: true }));
      rerender();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("does not call API when enabled is false", async () => {
    const items = [createCartItem()];
    const testStore = createTestStore(items);

    renderHook(() => useCartSummary({ enabled: false, shouldUpdateRedux: false }), {
      wrapper: createWrapper(testStore),
    });

    await vi.advanceTimersByTimeAsync(1000);
    expect(calculateCartTotalMock).not.toHaveBeenCalled();
  });

  it("does not call API while cart is syncing, then calculates once after", async () => {
    const items = [createCartItem()];
    const testStore = createTestStore(items, { loading: true });

    const { rerender } = renderHook(() => useCartSummary({ enabled: true, debounceMs: 500, shouldUpdateRedux: false }), {
      wrapper: createWrapper(testStore),
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(calculateCartTotalMock).not.toHaveBeenCalled();

    await act(async () => {
      testStore.dispatch(syncCartFromServer.fulfilled(items, "req", undefined));
      rerender();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(calculateCartTotalMock).toHaveBeenCalledTimes(1);
  });

  it("does not call API while cart write is pending, then calculates once after", async () => {
    const items = [createCartItem()];
    const testStore = createTestStore(items, { writePendingCount: 1 });

    const { rerender } = renderHook(() => useCartSummary({ enabled: true, debounceMs: 500, shouldUpdateRedux: false }), {
      wrapper: createWrapper(testStore),
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(calculateCartTotalMock).not.toHaveBeenCalled();

    await act(async () => {
      testStore.dispatch(endCartWritePending());
      rerender();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(calculateCartTotalMock).toHaveBeenCalledTimes(1);
  });
});
