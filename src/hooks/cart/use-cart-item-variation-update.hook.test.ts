import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CartProductVariation, CartViewItem } from "@/utils/api/cart/cart.interface";
import type { AuthState, CartState } from "@/redux/types";
import authReducer from "@/redux/slices/auth.slice";
import cartReducer from "@/redux/slices/cart.slice";
import useCartItemVariationUpdate from "./use-cart-item-variation-update.hook";

const postCartMock = vi.fn();
const getCartMock = vi.fn();

vi.mock("@/utils/api", () => ({
  CartApi: {
    postCart: (...args: unknown[]) => postCartMock(...args),
    getCart: (...args: unknown[]) => getCartMock(...args),
  },
}));

vi.mock("react-toastify", () => ({
  toast: {
    warning: vi.fn(),
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
  id: "var-old",
  productId: "prod-1",
  productSlug: "product-1",
  name: "Test Product",
  image: { src: "/test.jpg", alt: "Test" },
  quantity: 2,
  unitPrice: 100_000,
  price: { current: "100.000đ" },
  selected: true,
  maxQuantity: 10,
  ...overrides,
});

const createDetailVariation = (overrides: Partial<CartProductVariation> = {}): CartProductVariation => ({
  id: "var-new",
  name: "Updated Variation",
  skuCode: "SKU-NEW",
  slug: "updated-variation",
  compareAtPriceAfterTaxMinor: 150_000,
  sellingPriceAfterTaxMinor: 120_000,
  stock: 20,
  status: "ACTIVE",
  image: "/updated.jpg",
  attributes: [],
  stockStatus: "IN_STOCK",
  ...overrides,
});

const initialAuthState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isLogin: true,
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

describe("useCartItemVariationUpdate", () => {
  const getStateMock = vi.mocked(store.getState);

  beforeEach(() => {
    vi.clearAllMocks();
    postCartMock.mockResolvedValue({ success: true, items: [] });
    getCartMock.mockResolvedValue([]);
  });

  it("returns not-found when old variation is missing", async () => {
    const testStore = createTestStore([]);
    getStateMock.mockImplementation(() => testStore.getState() as ReturnType<typeof store.getState>);

    const { result } = renderHook(() => useCartItemVariationUpdate(), {
      wrapper: createWrapper(testStore),
    });

    let response: Awaited<ReturnType<typeof result.current.updateCartItemVariation>> | undefined;
    await act(async () => {
      response = await result.current.updateCartItemVariation({
        oldVariationId: "missing",
        nextVariationId: "var-new",
      });
    });

    expect(response).toEqual({ success: false, reason: "not-found" });
  });

  it("returns unchanged when next variation matches old variation", async () => {
    const items = [createCartItem({ id: "var-1" })];
    const testStore = createTestStore(items);
    getStateMock.mockImplementation(() => testStore.getState() as ReturnType<typeof store.getState>);

    const { result } = renderHook(() => useCartItemVariationUpdate(), {
      wrapper: createWrapper(testStore),
    });

    let response: Awaited<ReturnType<typeof result.current.updateCartItemVariation>> | undefined;
    await act(async () => {
      response = await result.current.updateCartItemVariation({
        oldVariationId: "var-1",
        nextVariationId: "var-1",
      });
    });

    expect(response).toEqual({ success: false, reason: "unchanged" });
  });

  it("returns limit when merge would exceed stock", async () => {
    const items = [createCartItem({ id: "var-old", quantity: 3 }), createCartItem({ id: "var-new", quantity: 4 })];
    const testStore = createTestStore(items);
    getStateMock.mockImplementation(() => testStore.getState() as ReturnType<typeof store.getState>);

    const { result } = renderHook(() => useCartItemVariationUpdate(), {
      wrapper: createWrapper(testStore),
    });

    let response: Awaited<ReturnType<typeof result.current.updateCartItemVariation>> | undefined;
    await act(async () => {
      response = await result.current.updateCartItemVariation({
        oldVariationId: "var-old",
        nextVariationId: "var-new",
        targetStock: 5,
      });
    });

    expect(response).toEqual({ success: false, reason: "limit" });
    expect(toast.warning).toHaveBeenCalled();
  });

  it("allows pre-order variation update when target stock is 0", async () => {
    getCartMock.mockResolvedValue([
      {
        id: "var-new",
        variationId: "var-new",
        quantity: 1,
        sellingPriceAfterTaxMinor: 100_000,
        availabilityCode: "PRE_ORDER",
        product: { name: "Pre-order Product", slug: "product-1" },
      },
    ]);

    const items = [
      createCartItem({
        id: "var-old",
        quantity: 1,
        maxQuantity: 999,
        availabilityCode: "PRE_ORDER",
      }),
    ];
    const testStore = createTestStore(items);
    getStateMock.mockImplementation(() => testStore.getState() as ReturnType<typeof store.getState>);

    const { result } = renderHook(() => useCartItemVariationUpdate(), {
      wrapper: createWrapper(testStore),
    });

    let response: Awaited<ReturnType<typeof result.current.updateCartItemVariation>> | undefined;
    await act(async () => {
      response = await result.current.updateCartItemVariation({
        oldVariationId: "var-old",
        nextVariationId: "var-new",
        detailVariation: createDetailVariation({ id: "var-new", stock: 0 }),
        targetStock: 0,
      });
    });

    expect(response).toEqual({ success: true });
    expect(toast.warning).not.toHaveBeenCalled();
    expect(postCartMock).toHaveBeenCalled();
  });

  it("updates variation via POST with old line qty 0 and new absolute qty", async () => {
    getCartMock.mockResolvedValue([
      {
        id: "var-new",
        variationId: "var-new",
        quantity: 2,
        sellingPriceAfterTaxMinor: 100_000,
        product: { name: "Updated Product", slug: "product-1" },
      },
    ]);

    const items = [createCartItem({ id: "var-old" })];
    const testStore = createTestStore(items);
    getStateMock.mockImplementation(() => testStore.getState() as ReturnType<typeof store.getState>);

    const { result } = renderHook(() => useCartItemVariationUpdate(), {
      wrapper: createWrapper(testStore),
    });

    let response: Awaited<ReturnType<typeof result.current.updateCartItemVariation>> | undefined;
    await act(async () => {
      response = await result.current.updateCartItemVariation({
        oldVariationId: "var-old",
        nextVariationId: "var-new",
        detailVariation: createDetailVariation({ id: "var-new", stock: 20 }),
        targetStock: 20,
      });
    });

    expect(response).toEqual({ success: true });
    expect(postCartMock).toHaveBeenCalledWith(
      {
        items: [
          { variationId: "var-old", quantity: 0 },
          { variationId: "var-new", quantity: 2, utm_data: null },
        ],
      },
      { skipAuthLogout: false },
    );
    expect(testStore.getState().cart.items[0].id).toBe("var-new");
  });

  it("merges quantity when target variation already exists in cart", async () => {
    const items = [createCartItem({ id: "var-old", quantity: 2 }), createCartItem({ id: "var-new", quantity: 3 })];
    const testStore = createTestStore(items);
    getStateMock.mockImplementation(() => testStore.getState() as ReturnType<typeof store.getState>);

    const { result } = renderHook(() => useCartItemVariationUpdate(), {
      wrapper: createWrapper(testStore),
    });

    await act(async () => {
      await result.current.updateCartItemVariation({
        oldVariationId: "var-old",
        nextVariationId: "var-new",
        targetStock: 20,
      });
    });

    expect(postCartMock).toHaveBeenCalledWith(
      {
        items: [
          { variationId: "var-old", quantity: 0 },
          { variationId: "var-new", quantity: 5, utm_data: null },
        ],
      },
      { skipAuthLogout: false },
    );
  });

  it("returns api reason when POST responds unsuccessfully", async () => {
    const items = [createCartItem({ id: "var-old" })];
    const testStore = createTestStore(items);
    getStateMock.mockImplementation(() => testStore.getState() as ReturnType<typeof store.getState>);
    postCartMock.mockResolvedValue({ success: false, items: [] });

    const { result } = renderHook(() => useCartItemVariationUpdate(), {
      wrapper: createWrapper(testStore),
    });

    let response: Awaited<ReturnType<typeof result.current.updateCartItemVariation>> | undefined;
    await act(async () => {
      response = await result.current.updateCartItemVariation({
        oldVariationId: "var-old",
        nextVariationId: "var-new",
        targetStock: 20,
      });
    });

    expect(response).toEqual({ success: false, reason: "api" });
    expect(testStore.getState().cart.items[0].id).toBe("var-old");
  });

  it("returns error reason when POST throws", async () => {
    const items = [createCartItem({ id: "var-old" })];
    const testStore = createTestStore(items);
    getStateMock.mockImplementation(() => testStore.getState() as ReturnType<typeof store.getState>);
    postCartMock.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useCartItemVariationUpdate(), {
      wrapper: createWrapper(testStore),
    });

    let response: Awaited<ReturnType<typeof result.current.updateCartItemVariation>> | undefined;
    await act(async () => {
      response = await result.current.updateCartItemVariation({
        oldVariationId: "var-old",
        nextVariationId: "var-new",
        targetStock: 20,
      });
    });

    expect(response).toEqual({ success: false, reason: "api" });
  });
});
