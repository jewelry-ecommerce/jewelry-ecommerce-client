import { configureStore } from "@reduxjs/toolkit";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authReducer from "@/redux/slices/auth.slice";
import cartReducer from "@/redux/slices/cart.slice";
import type { AuthState, CartState } from "@/redux/types";

vi.mock("@/utils/api", () => ({
  CartApi: {
    getCartRecommendations: vi.fn(),
  },
}));

import { CartApi } from "@/utils/api";
import { useCartRecommendations } from "./use-cart-recommendations.hook";

const store = configureStore({
  reducer: { auth: authReducer, cart: cartReducer },
  preloadedState: {
    auth: {
      accessToken: null,
      refreshToken: null,
      isLogin: false,
      isResolved: true,
      user: null,
    } satisfies AuthState,
    cart: {
      items: [],
      summary: null,
      loading: false,
      writePendingCount: 0,
      error: null,
      isDrawerOpen: false,
    } satisfies CartState,
  },
});

const wrapper = ({ children }: React.PropsWithChildren) =>
  React.createElement(Provider as React.ComponentType<React.PropsWithChildren<{ store: typeof store }>>, { store }, children);

describe("useCartRecommendations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads recommendation items from the paginated response", async () => {
    vi.mocked(CartApi.getCartRecommendations).mockResolvedValue({
      total: 1,
      list: [
        {
          id: "variation-1",
          compareAtPriceAfterTaxMinor: "100000",
          sellingPriceAfterTaxMinor: "90000",
          name: "Ring",
          productId: "product-1",
          stock: 2,
          status: "ACTIVE",
          product: { id: "product-1", name: "Ring", image: "/ring.jpg" },
          attributes: [
            {
              id: "attribute-value-1",
              value: "12",
              image: null,
              displayType: "TEXT",
              name: "Size",
              code: "SIZE",
            },
          ],
        },
      ],
      pagination: {
        total: 1,
        currentPage: 1,
        nextPage: false,
        previousPage: false,
        hasNextPage: false,
        hasPreviousPage: false,
        totalPage: 1,
      },
    });

    const { result } = renderHook(() => useCartRecommendations(true), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(CartApi.getCartRecommendations).toHaveBeenCalledWith({ skipAuthLogout: true }, { page: 1, take: 10 });
    expect(result.current.recommendedProducts).toEqual([expect.objectContaining({ id: "variation-1", size: "12" })]);
  });
});
