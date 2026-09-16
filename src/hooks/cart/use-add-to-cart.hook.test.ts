import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import type { AuthState, CartState } from "@/redux/types";
import authReducer, { setCredentials, setGuestState } from "@/redux/slices/auth.slice";
import cartReducer from "@/redux/slices/cart.slice";
import useAddToCart from "./use-add-to-cart.hook";

const postCartMock = vi.fn();
const getCartMock = vi.fn();

vi.mock("@/utils/api", () => ({
  CartApi: {
    postCart: (...args: unknown[]) => postCartMock(...args),
    getCart: (...args: unknown[]) => getCartMock(...args),
  },
}));

vi.mock("@/lib/gtm/track-add-to-cart", () => ({
  safeTrackAddToCartFromApiItem: vi.fn(),
  safeTrackAddToCartFromViewItem: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

import { toast } from "react-toastify";

const createCartItem = (overrides: Partial<CartViewItem> = {}): CartViewItem => ({
  id: "var-1",
  productSlug: "product-1",
  name: "Test Product",
  image: { src: "/test.jpg", alt: "Test" },
  quantity: 1,
  unitPrice: 100_000,
  price: { current: "100.000đ" },
  selected: true,
  variationId: "var-1",
  ...overrides,
});

const initialAuthState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isLogin: false,
  isResolved: false,
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

type TestState = {
  auth: AuthState;
  cart: CartState;
};

const createTestStore = (preloadedState?: Partial<TestState>) =>
  configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
    },
    preloadedState: {
      auth: { ...initialAuthState, ...preloadedState?.auth },
      cart: { ...initialCartState, ...preloadedState?.cart },
    },
  });

type ProviderWrapperProps = React.PropsWithChildren<{ store: ReturnType<typeof createTestStore> }>;

const ReduxProviderWrapper: React.FC<ProviderWrapperProps> = ({ store, children }) =>
  React.createElement(Provider as React.ComponentType<React.PropsWithChildren<{ store: typeof store }>>, { store }, children);

const createWrapper = (testStore: ReturnType<typeof createTestStore>) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(ReduxProviderWrapper, { store: testStore }, children);
  };

const renderAddToCartHook = (testStore: ReturnType<typeof createTestStore>) =>
  renderHook(() => useAddToCart({ debounceMs: 0 }), { wrapper: createWrapper(testStore) });

describe("useAddToCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    getCartMock.mockResolvedValue([
      {
        id: "var-1",
        variationId: "var-1",
        quantity: 1,
        sellingPriceAfterTaxMinor: 100_000,
        product: { name: "Test Product", slug: "product-1" },
      },
    ]);
    postCartMock.mockResolvedValue({
      success: true,
      items: [
        {
          id: "var-1",
          variationId: "var-1",
          quantity: 1,
          sellingPriceAfterTaxMinor: 100_000,
          product: { name: "Test Product", slug: "product-1" },
        },
      ],
    });
  });

  it("auth pending returns auth-pending and does not call API", async () => {
    const store = createTestStore();
    const { result } = renderAddToCartHook(store);

    let addResult: Awaited<ReturnType<typeof result.current.handleAddToCart>> | undefined;
    await act(async () => {
      addResult = await result.current.handleAddToCart("var-1");
    });

    expect(addResult).toEqual({ success: false, reason: "auth-pending" });
    expect(postCartMock).not.toHaveBeenCalled();
    expect(toast.warning).toHaveBeenCalled();
    expect(store.getState().cart.items).toHaveLength(0);
  });

  it("guest calls postCart with skipAuthLogout", async () => {
    const store = createTestStore({ auth: { ...initialAuthState, isResolved: true, isLogin: false } });
    store.dispatch(setGuestState());

    const optimisticItem = createCartItem();
    const { result } = renderAddToCartHook(store);

    await act(async () => {
      await result.current.handleAddToCart("var-1", 1, optimisticItem);
    });

    expect(postCartMock).toHaveBeenCalledWith(
      {
        items: [{ variationId: "var-1", quantity: 1, utm_data: null }],
      },
      { skipAuthLogout: true },
    );
    expect(getCartMock).toHaveBeenCalledWith(expect.objectContaining({ skipAuthLogout: true }));
    expect(store.getState().cart.items).toHaveLength(1);
  });

  it("refetches full cart from server after postCart", async () => {
    const store = createTestStore({ auth: { ...initialAuthState, isResolved: true, isLogin: false } });
    store.dispatch(setGuestState());

    getCartMock.mockResolvedValue([
      {
        id: "var-old",
        variationId: "var-old",
        quantity: 2,
        sellingPriceAfterTaxMinor: 50_000,
        product: { name: "Old Product", slug: "old-product" },
      },
      {
        id: "var-1",
        variationId: "var-1",
        quantity: 1,
        sellingPriceAfterTaxMinor: 100_000,
        product: { name: "Test Product", slug: "product-1" },
      },
    ]);

    const { result } = renderAddToCartHook(store);

    await act(async () => {
      await result.current.handleAddToCart("var-1", 1, createCartItem());
    });

    expect(store.getState().cart.items).toHaveLength(2);
    expect(store.getState().cart.items.map((item) => item.id)).toEqual(["var-old", "var-1"]);
  });

  it("logged-in user calls postCart with packaging ids from optimisticItem", async () => {
    const store = createTestStore({
      auth: { ...initialAuthState, isResolved: true, isLogin: true },
    });
    store.dispatch(
      setCredentials({
        user: { id: "user-1", email: "test@example.com", name: "Test" } as never,
      }),
    );

    const optimisticItem = createCartItem({
      selectedPackagingRelationIds: ["pkg-1", "pkg-2"],
    });
    const { result } = renderAddToCartHook(store);

    await act(async () => {
      await result.current.handleAddToCart("var-1", 2, optimisticItem);
    });

    expect(postCartMock).toHaveBeenCalledWith(
      {
        items: [
          {
            variationId: "var-1",
            quantity: 2,
            selectedPackagingRelationIds: ["pkg-1", "pkg-2"],
            utm_data: null,
          },
        ],
      },
      { skipAuthLogout: false },
    );
    expect(store.getState().cart.items).toHaveLength(1);
  });

  it("logged-in user omits packaging field when optimisticItem has none", async () => {
    const store = createTestStore({
      auth: { ...initialAuthState, isResolved: true, isLogin: true },
    });
    store.dispatch(
      setCredentials({
        user: { id: "user-1", email: "test@example.com", name: "Test" } as never,
      }),
    );

    const { result } = renderAddToCartHook(store);

    await act(async () => {
      await result.current.handleAddToCart("var-1", 1);
    });

    expect(postCartMock).toHaveBeenCalledWith(
      {
        items: [{ variationId: "var-1", quantity: 1, utm_data: null }],
      },
      { skipAuthLogout: false },
    );
  });

  it("sends absolute quantity when item already exists in cart", async () => {
    getCartMock.mockResolvedValue([
      {
        id: "var-1",
        variationId: "var-1",
        quantity: 3,
        sellingPriceAfterTaxMinor: 100_000,
        product: { name: "Test Product", slug: "product-1" },
      },
    ]);

    const store = createTestStore({
      auth: { ...initialAuthState, isResolved: true, isLogin: false },
      cart: {
        ...initialCartState,
        items: [createCartItem({ quantity: 2 })],
      },
    });
    store.dispatch(setGuestState());

    const { result } = renderAddToCartHook(store);

    await act(async () => {
      await result.current.handleAddToCart("var-1", 1, createCartItem({ quantity: 1 }));
    });

    expect(postCartMock).toHaveBeenCalledWith({ items: [{ variationId: "var-1", quantity: 3, utm_data: null }] }, { skipAuthLogout: true });
    expect(store.getState().cart.items[0].quantity).toBe(3);
  });

  it("returns limit when guest item is out of stock", async () => {
    const store = createTestStore({
      auth: { ...initialAuthState, isResolved: true, isLogin: false },
    });
    store.dispatch(setGuestState());

    const { result } = renderAddToCartHook(store);

    let addResult: Awaited<ReturnType<typeof result.current.handleAddToCart>> | undefined;
    await act(async () => {
      addResult = await result.current.handleAddToCart(
        "var-1",
        1,
        createCartItem({ maxQuantity: 0, status: { label: "Hết hàng", tone: "error" } }),
      );
    });

    expect(addResult).toEqual({ success: false, reason: "limit" });
    expect(store.getState().cart.items).toHaveLength(0);
    expect(toast.warning).toHaveBeenCalledWith("Sản phẩm này hiện đã hết hàng.");
  });

  it("returns limit when quantity exceeds max", async () => {
    const store = createTestStore({
      auth: { ...initialAuthState, isResolved: true, isLogin: false },
      cart: {
        ...initialCartState,
        items: [createCartItem({ quantity: 5, maxQuantity: 5 })],
      },
    });
    store.dispatch(setGuestState());

    const { result } = renderAddToCartHook(store);

    let addResult: Awaited<ReturnType<typeof result.current.handleAddToCart>> | undefined;
    await act(async () => {
      addResult = await result.current.handleAddToCart("var-1", 1, createCartItem());
    });

    expect(addResult).toEqual({ success: false, reason: "limit" });
    expect(postCartMock).not.toHaveBeenCalled();
    expect(store.getState().cart.items[0].quantity).toBe(5);
  });

  it("API error does not add item to cart", async () => {
    postCartMock.mockRejectedValue(new Error("network"));

    const store = createTestStore({
      auth: { ...initialAuthState, isResolved: true, isLogin: true },
    });
    store.dispatch(
      setCredentials({
        user: { id: "user-1", email: "test@example.com", name: "Test" } as never,
      }),
    );

    const optimisticItem = createCartItem();
    const { result } = renderAddToCartHook(store);

    let addResult: Awaited<ReturnType<typeof result.current.handleAddToCart>> | undefined;
    await act(async () => {
      addResult = await result.current.handleAddToCart("var-1", 1, optimisticItem);
    });

    expect(addResult).toEqual({ success: false, reason: "api" });
    expect(store.getState().cart.items).toHaveLength(0);
    expect(toast.error).toHaveBeenCalled();
  });

  it("debounces rapid adds for the same variation into one postCart", async () => {
    vi.useFakeTimers();

    const store = createTestStore({ auth: { ...initialAuthState, isResolved: true, isLogin: false } });
    store.dispatch(setGuestState());

    const optimisticItem = createCartItem();
    const { result } = renderHook(() => useAddToCart({ debounceMs: 500 }), { wrapper: createWrapper(store) });

    let firstResult: Awaited<ReturnType<typeof result.current.handleAddToCart>> | undefined;
    let secondResult: Awaited<ReturnType<typeof result.current.handleAddToCart>> | undefined;
    let firstCall: ReturnType<typeof result.current.handleAddToCart>;
    let secondCall: ReturnType<typeof result.current.handleAddToCart>;

    await act(async () => {
      firstCall = result.current.handleAddToCart("var-1", 1, optimisticItem);
      await vi.advanceTimersByTimeAsync(100);
      secondCall = result.current.handleAddToCart("var-1", 1, optimisticItem);
    });

    expect(postCartMock).not.toHaveBeenCalled();
    expect(store.getState().cart.items[0]?.quantity).toBe(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
      firstResult = await firstCall!;
      secondResult = await secondCall!;
    });

    expect(postCartMock).toHaveBeenCalledTimes(1);
    expect(postCartMock).toHaveBeenCalledWith({ items: [{ variationId: "var-1", quantity: 2, utm_data: null }] }, { skipAuthLogout: true });
    expect(firstResult).toEqual({ success: true, item: expect.objectContaining({ id: "var-1" }) });
    expect(secondResult).toEqual({ success: true, item: expect.objectContaining({ id: "var-1" }) });
  });

  it("opens cart drawer immediately when openCartDrawerOnSuccess is enabled", async () => {
    const store = createTestStore({ auth: { ...initialAuthState, isResolved: true, isLogin: false } });
    store.dispatch(setGuestState());

    const { result } = renderHook(() => useAddToCart({ debounceMs: 500, openCartDrawerOnSuccess: true }), {
      wrapper: createWrapper(store),
    });

    void result.current.handleAddToCart("var-1", 1, createCartItem());

    expect(store.getState().cart.isDrawerOpen).toBe(true);
    expect(postCartMock).not.toHaveBeenCalled();
  });
});
