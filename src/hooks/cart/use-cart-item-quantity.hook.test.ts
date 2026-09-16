import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import type { AuthState, CartState } from "@/redux/types";
import authReducer, { setGuestState } from "@/redux/slices/auth.slice";
import cartReducer from "@/redux/slices/cart.slice";
import useCartItemQuantity from "./use-cart-item-quantity.hook";

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
  safeTrackAddToCartFromQuantitySource: vi.fn(),
}));

vi.mock("@/lib/gtm/track-remove-from-cart", () => ({
  safeTrackRemoveFromCartFromApiItem: vi.fn(),
  safeTrackRemoveFromCartFromQuantitySource: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("@/redux/store", () => ({
  store: {
    getState: vi.fn(),
  },
}));

import { store } from "@/redux/store";
import { toast } from "react-toastify";

const createCartItem = (overrides: Partial<CartViewItem> = {}): CartViewItem => ({
  id: "var-1",
  productSlug: "product-1",
  name: "Test Product",
  image: { src: "/test.jpg", alt: "Test" },
  quantity: 2,
  unitPrice: 100_000,
  price: { current: "100.000đ" },
  selected: true,
  minQuantity: 1,
  maxQuantity: 10,
  ...overrides,
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

const createTestStore = (items: CartViewItem[] = []) =>
  configureStore({
    reducer: { auth: authReducer, cart: cartReducer },
    preloadedState: {
      auth: initialAuthState,
      cart: { ...initialCartState, items },
    },
  });

type ProviderWrapperProps = React.PropsWithChildren<{ store: ReturnType<typeof createTestStore> }>;

const ReduxProviderWrapper: React.FC<ProviderWrapperProps> = ({ store, children }) =>
  React.createElement(Provider as React.ComponentType<React.PropsWithChildren<{ store: typeof store }>>, { store }, children);

const createWrapper = (testStore: ReturnType<typeof createTestStore>) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(ReduxProviderWrapper, { store: testStore }, children);
  };

describe("useCartItemQuantity", () => {
  const getStateMock = vi.mocked(store.getState);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    postCartMock.mockResolvedValue({ success: true, items: [] });
    getCartMock.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("POSTs absolute quantity after debounce", async () => {
    getCartMock.mockResolvedValue([
      {
        id: "var-1",
        variationId: "var-1",
        quantity: 5,
        sellingPriceAfterTaxMinor: 100_000,
        product: { name: "Test Product", slug: "product-1" },
      },
    ]);

    const testStore = createTestStore([createCartItem({ quantity: 2 })]);
    getStateMock.mockImplementation(() => testStore.getState() as ReturnType<typeof store.getState>);
    testStore.dispatch(setGuestState());

    const { result } = renderHook(() => useCartItemQuantity(), {
      wrapper: createWrapper(testStore),
    });

    await act(async () => {
      await result.current.handleQuantityChange("var-1", 5);
      vi.advanceTimersByTime(700);
    });

    expect(testStore.getState().cart.items[0].quantity).toBe(5);
    expect(postCartMock).toHaveBeenCalledWith({ items: [{ variationId: "var-1", quantity: 5, utm_data: null }] }, { skipAuthLogout: true });
  });

  it("POSTs Set quantity with the original component identities", async () => {
    const firstSetItem = createCartItem({
      id: "line-1",
      setId: "set-1",
      isSet: true,
      setComponents: [createCartItem({ id: "variation-0", variationId: "variation-0", setItemId: "set-item-0", quantity: 1 })],
      quantity: 1,
    });
    const setComponents = [
      createCartItem({ id: "variation-1", variationId: "variation-1", setItemId: "set-item-1", quantity: 1 }),
      createCartItem({ id: "variation-2", variationId: "variation-2", setItemId: "set-item-2", quantity: 1 }),
      createCartItem({ id: "variation-3", variationId: "variation-3", setItemId: "set-item-3", quantity: 1 }),
    ];
    const setItem = createCartItem({
      id: "line-2",
      setId: "set-1",
      isSet: true,
      setComponents,
      quantity: 1,
    });
    const testStore = createTestStore([firstSetItem, setItem]);
    getStateMock.mockImplementation(() => testStore.getState() as ReturnType<typeof store.getState>);
    testStore.dispatch(setGuestState());

    const { result } = renderHook(() => useCartItemQuantity(), {
      wrapper: createWrapper(testStore),
    });

    await act(async () => {
      await result.current.handleQuantityChange("line-2", 2);
    });

    expect(testStore.getState().cart.items[0].quantity).toBe(1);
    expect(testStore.getState().cart.items[1].quantity).toBe(2);

    await act(async () => {
      vi.advanceTimersByTime(700);
    });

    expect(postCartMock).toHaveBeenCalledWith(
      {
        items: [
          {
            setId: "set-1",
            quantity: 2,
            setComponents: [
              { setItemId: "set-item-1", variationId: "variation-1" },
              { setItemId: "set-item-2", variationId: "variation-2" },
              { setItemId: "set-item-3", variationId: "variation-3" },
            ],
            utm_data: null,
          },
        ],
      },
      { skipAuthLogout: true },
    );
  });

  it("aborts a Set quantity update when a component identity is incomplete", async () => {
    const setItem = createCartItem({
      id: "line-1",
      setId: "set-1",
      isSet: true,
      setComponents: [createCartItem({ id: "", variationId: "", setItemId: "set-item-1", quantity: 1 })],
      quantity: 1,
    });
    const testStore = createTestStore([setItem]);
    getStateMock.mockImplementation(() => testStore.getState() as ReturnType<typeof store.getState>);
    testStore.dispatch(setGuestState());

    const { result } = renderHook(() => useCartItemQuantity(), {
      wrapper: createWrapper(testStore),
    });

    await act(async () => {
      await result.current.handleQuantityChange("line-1", 2);
    });

    expect(testStore.getState().cart.items[0].quantity).toBe(1);

    await act(async () => {
      vi.advanceTimersByTime(700);
    });

    expect(postCartMock).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Không thể cập nhật bộ sản phẩm vì thiếu thông tin lựa chọn. Vui lòng tải lại giỏ hàng.", {
      toastId: "update-set-quantity-identity-error-line-1",
    });
  });

  it("POSTs quantity 0 when removing item", async () => {
    const testStore = createTestStore([createCartItem({ quantity: 2 })]);
    getStateMock.mockImplementation(() => testStore.getState() as ReturnType<typeof store.getState>);
    testStore.dispatch(setGuestState());

    const { result } = renderHook(() => useCartItemQuantity(), {
      wrapper: createWrapper(testStore),
    });

    await act(async () => {
      await result.current.handleQuantityChange("var-1", 0);
    });

    expect(testStore.getState().cart.items).toHaveLength(0);
    expect(postCartMock).toHaveBeenCalledWith({ items: [{ variationId: "var-1", quantity: 0 }] }, { skipAuthLogout: true });
  });

  it("rolls back when POST fails", async () => {
    const testStore = createTestStore([createCartItem({ quantity: 2 })]);
    getStateMock.mockImplementation(() => testStore.getState() as ReturnType<typeof store.getState>);
    testStore.dispatch(setGuestState());
    postCartMock.mockResolvedValue({ success: false, items: [] });

    const { result } = renderHook(() => useCartItemQuantity(), {
      wrapper: createWrapper(testStore),
    });

    await act(async () => {
      await result.current.handleQuantityChange("var-1", 0);
    });

    expect(testStore.getState().cart.items).toHaveLength(1);
    expect(testStore.getState().cart.items[0].quantity).toBe(2);
    expect(toast.error).toHaveBeenCalled();
  });
});
