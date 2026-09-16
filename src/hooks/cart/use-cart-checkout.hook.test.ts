import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import type { CartState } from "@/redux/types";
import cartReducer from "@/redux/slices/cart.slice";
import useCartCheckout from "./use-cart-checkout.hook";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/utils/api/checkout/checkout.api", () => ({
  initiateCheckout: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    warning: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { initiateCheckout } from "@/utils/api/checkout/checkout.api";
import { toast } from "react-toastify";
import { ProductAvailabilityCode } from "@/utils/api/product/product.enum";
import { CheckoutRequestLineType } from "@/utils/api/checkout/checkout.interface";
import { MIXED_RETAIL_PREORDER_MESSAGE } from "@/utils/api/cart/cart-availability.util";

const createCartItem = (overrides: Partial<CartViewItem> = {}): CartViewItem => ({
  id: "item-1",
  productSlug: "product-1",
  name: "Test Product",
  image: { src: "/test.jpg", alt: "Test" },
  quantity: 1,
  unitPrice: 100_000,
  price: { current: "100.000đ" },
  selected: true,
  ...overrides,
});

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
    reducer: { cart: cartReducer },
    preloadedState: { cart: { ...initialCartState, items } },
  });

type ProviderWrapperProps = React.PropsWithChildren<{ store: ReturnType<typeof createTestStore> }>;

const ReduxProviderWrapper: React.FC<ProviderWrapperProps> = ({ store, children }) =>
  React.createElement(Provider as React.ComponentType<React.PropsWithChildren<{ store: typeof store }>>, { store }, children);

const createWrapper = (testStore: ReturnType<typeof createTestStore>) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(ReduxProviderWrapper, { store: testStore }, children);
  };

describe("useCartCheckout", () => {
  const initiateCheckoutMock = vi.mocked(initiateCheckout);

  beforeEach(() => {
    vi.clearAllMocks();
    initiateCheckoutMock.mockResolvedValue({ checkoutSessionId: "session-123" } as never);
  });

  describe("initiateCartCheckout", () => {
    it("returns empty-scope when scope count is zero", async () => {
      const testStore = createTestStore();
      const { result } = renderHook(() => useCartCheckout(), { wrapper: createWrapper(testStore) });

      let response: Awaited<ReturnType<typeof result.current.initiateCartCheckout>> | undefined;
      await act(async () => {
        response = await result.current.initiateCartCheckout({ items: [], scopeItemCount: 0 });
      });

      expect(response).toEqual({ success: false, reason: "empty-scope" });
      expect(initiateCheckoutMock).not.toHaveBeenCalled();
    });

    it("warns when no eligible items remain", async () => {
      const testStore = createTestStore();
      const { result } = renderHook(() => useCartCheckout(), { wrapper: createWrapper(testStore) });

      let response: Awaited<ReturnType<typeof result.current.initiateCartCheckout>> | undefined;
      await act(async () => {
        response = await result.current.initiateCartCheckout({ items: [], scopeItemCount: 2 });
      });

      expect(response).toEqual({ success: false, reason: "no-eligible" });
      expect(toast.warning).toHaveBeenCalled();
    });

    it("initiates checkout and navigates on success", async () => {
      const testStore = createTestStore();
      const items = [createCartItem()];
      const onBeforeNavigate = vi.fn();
      const { result } = renderHook(() => useCartCheckout(), { wrapper: createWrapper(testStore) });

      let response: Awaited<ReturnType<typeof result.current.initiateCartCheckout>> | undefined;
      await act(async () => {
        response = await result.current.initiateCartCheckout({
          items,
          scopeItemCount: 1,
          onBeforeNavigate,
        });
      });

      expect(response).toEqual({ success: true });
      expect(initiateCheckoutMock).toHaveBeenCalledWith({
        items: [{ type: CheckoutRequestLineType.LOOSE, variationId: "item-1", quantity: 1, utm_data: null }],
      });
      expect(onBeforeNavigate).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/thanh-toan?sessionId=session-123");
    });

    it("returns error reason when checkout API fails", async () => {
      const testStore = createTestStore();
      initiateCheckoutMock.mockRejectedValue(new Error("checkout failed"));
      const { result } = renderHook(() => useCartCheckout(), { wrapper: createWrapper(testStore) });

      let response: Awaited<ReturnType<typeof result.current.initiateCartCheckout>> | undefined;
      await act(async () => {
        response = await result.current.initiateCartCheckout({
          items: [createCartItem()],
          scopeItemCount: 1,
        });
      });

      expect(response).toEqual({ success: false, reason: "error" });
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("initiateCheckoutFromCart", () => {
    it("selected-eligible returns empty-scope when nothing is selected", async () => {
      const items = [createCartItem({ selected: false })];
      const testStore = createTestStore(items);
      const { result } = renderHook(() => useCartCheckout(), { wrapper: createWrapper(testStore) });

      let response: Awaited<ReturnType<typeof result.current.initiateCheckoutFromCart>> | undefined;
      await act(async () => {
        response = await result.current.initiateCheckoutFromCart({ mode: "selected-eligible" });
      });

      expect(response).toEqual({ success: false, reason: "empty-scope" });
    });

    it("blocks checkout when selected items mix retail and pre-order", async () => {
      const items = [
        createCartItem({
          id: "retail",
          selected: true,
          availabilityCode: ProductAvailabilityCode.IN_STOCK,
          status: { label: "Đang có hàng", tone: "success" },
        }),
        createCartItem({
          id: "preorder",
          selected: true,
          availabilityCode: ProductAvailabilityCode.PRE_ORDER,
          status: { label: "Hàng đặt trước", tone: "warning" },
        }),
      ];
      const testStore = createTestStore(items);
      const { result } = renderHook(() => useCartCheckout(), { wrapper: createWrapper(testStore) });

      let response: Awaited<ReturnType<typeof result.current.initiateCheckoutFromCart>> | undefined;
      await act(async () => {
        response = await result.current.initiateCheckoutFromCart({ mode: "selected-eligible" });
      });

      expect(response).toEqual({ success: false, reason: "mixed-fulfillment" });
      expect(initiateCheckoutMock).not.toHaveBeenCalled();
      expect(toast.warning).toHaveBeenCalledWith(MIXED_RETAIL_PREORDER_MESSAGE);
    });

    it("checks out only pre-order items when fulfillmentGroup is PRE_ORDER", async () => {
      const items = [
        createCartItem({
          id: "retail",
          selected: true,
          availabilityCode: ProductAvailabilityCode.IN_STOCK,
        }),
        createCartItem({
          id: "preorder",
          selected: true,
          availabilityCode: ProductAvailabilityCode.PRE_ORDER,
        }),
      ];
      const testStore = createTestStore(items);
      const { result } = renderHook(() => useCartCheckout(), { wrapper: createWrapper(testStore) });

      await act(async () => {
        await result.current.initiateCheckoutFromCart({
          mode: "all-eligible",
          fulfillmentGroup: "PRE_ORDER",
        });
      });

      expect(initiateCheckoutMock).toHaveBeenCalledWith({
        items: [{ type: CheckoutRequestLineType.LOOSE, variationId: "preorder", quantity: 1, utm_data: null }],
      });
    });

    it("checks out only retail items when fulfillmentGroup is RETAIL", async () => {
      const items = [
        createCartItem({
          id: "retail",
          selected: true,
          availabilityCode: ProductAvailabilityCode.IN_STOCK,
        }),
        createCartItem({
          id: "preorder",
          selected: true,
          availabilityCode: ProductAvailabilityCode.PRE_ORDER,
        }),
      ];
      const testStore = createTestStore(items);
      const { result } = renderHook(() => useCartCheckout(), { wrapper: createWrapper(testStore) });

      await act(async () => {
        await result.current.initiateCheckoutFromCart({
          mode: "all-eligible",
          fulfillmentGroup: "RETAIL",
        });
      });

      expect(initiateCheckoutMock).toHaveBeenCalledWith({
        items: [{ type: CheckoutRequestLineType.LOOSE, variationId: "retail", quantity: 1, utm_data: null }],
      });
    });

    it("selected-eligible checks out only selected eligible items", async () => {
      const items = [
        createCartItem({ id: "a", selected: true }),
        createCartItem({ id: "b", selected: false }),
        createCartItem({ id: "c", selected: true, isValid: false, reason: "OUT_OF_STOCK" }),
      ];
      const testStore = createTestStore(items);
      const { result } = renderHook(() => useCartCheckout(), { wrapper: createWrapper(testStore) });

      await act(async () => {
        await result.current.initiateCheckoutFromCart({ mode: "selected-eligible" });
      });

      expect(initiateCheckoutMock).toHaveBeenCalledWith({
        items: [{ type: CheckoutRequestLineType.LOOSE, variationId: "a", quantity: 1, utm_data: null }],
      });
    });

    it("all-eligible warns when cart is empty", async () => {
      const testStore = createTestStore([]);
      const { result } = renderHook(() => useCartCheckout(), { wrapper: createWrapper(testStore) });

      let response: Awaited<ReturnType<typeof result.current.initiateCheckoutFromCart>> | undefined;
      await act(async () => {
        response = await result.current.initiateCheckoutFromCart({ mode: "all-eligible" });
      });

      expect(response).toEqual({ success: false, reason: "no-eligible" });
      expect(toast.warning).toHaveBeenCalledWith(
        "Giỏ hàng chỉ có sản phẩm hết hàng. Vui lòng bỏ chọn hoặc xóa sản phẩm hết hàng trước khi thanh toán.",
      );
      expect(initiateCheckoutMock).not.toHaveBeenCalled();
    });

    it("all-eligible checks out all eligible items", async () => {
      const items = [
        createCartItem({ id: "a", selected: false }),
        createCartItem({ id: "b", selected: true, isValid: false, reason: "OUT_OF_STOCK" }),
      ];
      const testStore = createTestStore(items);
      const { result } = renderHook(() => useCartCheckout(), { wrapper: createWrapper(testStore) });

      await act(async () => {
        await result.current.initiateCheckoutFromCart({ mode: "all-eligible" });
      });

      expect(initiateCheckoutMock).toHaveBeenCalledWith({
        items: [{ type: CheckoutRequestLineType.LOOSE, variationId: "a", quantity: 1, utm_data: null }],
      });
    });
  });
});
