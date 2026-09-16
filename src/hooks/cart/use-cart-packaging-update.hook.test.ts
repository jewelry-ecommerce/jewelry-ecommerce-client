import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import type { AuthState, CartState } from "@/redux/types";
import authReducer from "@/redux/slices/auth.slice";
import cartReducer from "@/redux/slices/cart.slice";
import useCartPackagingUpdate from "./use-cart-packaging-update.hook";

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
    error: vi.fn(),
  },
}));

import { toast } from "react-toastify";

const createCartItem = (overrides: Partial<CartViewItem> = {}): CartViewItem => ({
  id: "item-1",
  productSlug: "product-1",
  name: "Test Product",
  image: { src: "/test.jpg", alt: "Test" },
  quantity: 1,
  unitPrice: 100_000,
  price: { current: "100.000đ" },
  packaging: {
    requiredIncludedPackaging: [],
    optionalPackagingOptions: [
      {
        relationId: "pkg-1",
        quantity: 1,
        isRequired: false,
        packaging: { variationId: "p1", name: "Gift box" },
        includedPriceAfterTax: 10_000,
      },
    ],
    selectedOptionalPackagingRelationIds: [],
    selectedOptionalPackaging: [],
  },
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

describe("useCartPackagingUpdate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postCartMock.mockResolvedValue({ success: true, items: [] });
    getCartMock.mockResolvedValue([]);
  });

  it("updates redux and syncs packaging selection via POST", async () => {
    getCartMock.mockResolvedValue([
      {
        id: "item-1",
        variationId: "item-1",
        quantity: 1,
        sellingPriceAfterTaxMinor: 100_000,
        product: { name: "Test Product", slug: "product-1" },
        packaging: {
          optionalPackagingOptions: [
            {
              relationId: "pkg-1",
              quantity: 1,
              isRequired: false,
              packaging: { variationId: "p1", name: "Gift box" },
            },
          ],
          selectedOptionalPackagingRelationIds: ["pkg-1"],
        },
      },
    ]);

    const items = [createCartItem()];
    const testStore = createTestStore(items);

    const { result } = renderHook(() => useCartPackagingUpdate(), {
      wrapper: createWrapper(testStore),
    });

    await act(async () => {
      await result.current.handlePackagingSelectionChange("item-1", "pkg-1", true);
    });

    const updatedItem = testStore.getState().cart.items[0];
    expect(updatedItem.selectedPackagingRelationIds).toEqual(["pkg-1"]);
    expect(postCartMock).toHaveBeenCalledWith(
      {
        items: [
          {
            variationId: "item-1",
            quantity: 1,
            selectedPackagingRelationIds: ["pkg-1"],
            utm_data: null,
          },
        ],
      },
      { skipAuthLogout: false },
    );
    expect(getCartMock).toHaveBeenCalled();
  });

  it("no-ops when item is missing", async () => {
    const testStore = createTestStore([]);

    const { result } = renderHook(() => useCartPackagingUpdate(), {
      wrapper: createWrapper(testStore),
    });

    await act(async () => {
      await result.current.handlePackagingSelectionChange("missing", "pkg-1", true);
    });

    expect(postCartMock).not.toHaveBeenCalled();
  });

  it("rolls back and shows toast when POST fails", async () => {
    const items = [createCartItem()];
    const testStore = createTestStore(items);
    postCartMock.mockResolvedValue({ success: false, reason: "api-failed", items: [] });

    const { result } = renderHook(() => useCartPackagingUpdate(), {
      wrapper: createWrapper(testStore),
    });

    await act(async () => {
      await result.current.handlePackagingSelectionChange("item-1", "pkg-1", true);
    });

    expect(toast.error).toHaveBeenCalled();
    expect(testStore.getState().cart.items[0].selectedPackagingRelationIds).toBeUndefined();
  });
});
