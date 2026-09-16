import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/utils/api", () => ({
  CartApi: {
    getCart: vi.fn(),
  },
}));
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import type { CartState, RootState } from "../types";
import { logOut } from "./auth.slice";
import cartReducer, {
  addCartItem,
  clearCart,
  closeCartDrawer,
  fetchCart,
  syncCartFromServer,
  openCartDrawer,
  removeCartItem,
  removeCartItems,
  selectAllCartItems,
  selectCartItems,
  selectCartLoading,
  selectCartSummary,
  selectCartTotalQuantity,
  selectCheckoutEligibleItems,
  selectSelectedCartItems,
  setCartItems,
  setCartSummary,
  toggleCartItemSelection,
  updateCartItem,
} from "./cart.slice";

const createCartItem = (overrides: Partial<CartViewItem> = {}): CartViewItem => ({
  id: "item-1",
  productSlug: "product-1",
  name: "Test Product",
  image: { src: "/test.jpg", alt: "Test" },
  quantity: 1,
  unitPrice: 100_000,
  price: { current: "100.000đ" },
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

const createTestRootState = (cart: Partial<CartState>): RootState => ({
  auth: {
    accessToken: null,
    refreshToken: null,
    isLogin: false,
    isResolved: true,
    user: null,
  },
  badge: {
    byProductId: {},
    loading: false,
  },
  cart: { ...initialCartState, ...cart },
  wishlist: {
    productIds: [],
  },
});

const createCartStore = (preloadedCart: Partial<CartState> = {}) =>
  configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: { ...initialCartState, ...preloadedCart } },
  });

describe("cart.slice", () => {
  describe("setCartItems", () => {
    it("defaults selected to true for selectable items", () => {
      const state = cartReducer(
        initialCartState,
        setCartItems([createCartItem({ id: "a" }), createCartItem({ id: "b", selected: false })]),
      );

      expect(state.items[0].selected).toBe(true);
      expect(state.items[1].selected).toBe(false);
    });

    it("forces selected false when disableSelection is true", () => {
      const state = cartReducer(initialCartState, setCartItems([createCartItem({ id: "a", disableSelection: true, selected: true })]));

      expect(state.items[0].selected).toBe(false);
    });

    it("clears error", () => {
      const state = cartReducer({ ...initialCartState, error: "old error" }, setCartItems([]));
      expect(state.error).toBeNull();
    });
  });

  describe("addCartItem", () => {
    it("appends item with selected default true", () => {
      const state = cartReducer(initialCartState, addCartItem(createCartItem({ id: "new" })));

      expect(state.items).toHaveLength(1);
      expect(state.items[0].selected).toBe(true);
    });

    it("merges quantity when variationId already exists", () => {
      const base = cartReducer(initialCartState, addCartItem(createCartItem({ id: "var-1", quantity: 2 })));
      const state = cartReducer(base, addCartItem(createCartItem({ id: "var-1", quantity: 1 })));

      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(3);
    });
  });

  describe("toggleCartItemSelection", () => {
    it("flips selected for a selectable item", () => {
      const base = cartReducer(initialCartState, setCartItems([createCartItem({ id: "a", selected: true })]));

      const toggled = cartReducer(base, toggleCartItemSelection("a"));
      expect(toggled.items[0].selected).toBe(false);

      const toggledBack = cartReducer(toggled, toggleCartItemSelection("a"));
      expect(toggledBack.items[0].selected).toBe(true);
    });

    it("ignores items with disableSelection", () => {
      const base = cartReducer(initialCartState, setCartItems([createCartItem({ id: "a", disableSelection: true, selected: false })]));

      const next = cartReducer(base, toggleCartItemSelection("a"));
      expect(next.items[0].selected).toBe(false);
    });

    it("ignores unknown item id", () => {
      const base = cartReducer(initialCartState, setCartItems([createCartItem({ id: "a", selected: true })]));
      const next = cartReducer(base, toggleCartItemSelection("missing"));
      expect(next.items[0].selected).toBe(true);
    });
  });

  describe("selectAllCartItems", () => {
    it("selects or deselects all selectable items", () => {
      const base = cartReducer(
        initialCartState,
        setCartItems([createCartItem({ id: "a", selected: false }), createCartItem({ id: "b", disableSelection: true, selected: false })]),
      );

      const allSelected = cartReducer(base, selectAllCartItems(true));
      expect(allSelected.items[0].selected).toBe(true);
      expect(allSelected.items[1].selected).toBe(false);

      const allDeselected = cartReducer(allSelected, selectAllCartItems(false));
      expect(allDeselected.items[0].selected).toBe(false);
    });
  });

  describe("updateCartItem", () => {
    it("updates quantity and preserves selected when not provided", () => {
      const base = cartReducer(initialCartState, setCartItems([createCartItem({ id: "a", quantity: 1, selected: true })]));

      const next = cartReducer(base, updateCartItem({ id: "a", quantity: 3 }));
      expect(next.items[0].quantity).toBe(3);
      expect(next.items[0].selected).toBe(true);
    });

    it("replaces item when oldVariationId is provided", () => {
      const base = cartReducer(initialCartState, setCartItems([createCartItem({ id: "old", quantity: 2, selected: true })]));

      const next = cartReducer(
        base,
        updateCartItem({
          ...createCartItem({ id: "new", quantity: 2, selected: true }),
          oldVariationId: "old",
        }),
      );

      expect(next.items).toHaveLength(1);
      expect(next.items[0].id).toBe("new");
      expect(next.items[0].selected).toBe(true);
    });
  });

  describe("removeCartItem", () => {
    it("removes item by id", () => {
      const base = cartReducer(initialCartState, setCartItems([createCartItem({ id: "a" }), createCartItem({ id: "b" })]));

      const next = cartReducer(base, removeCartItem("a"));
      expect(next.items.map((item) => item.id)).toEqual(["b"]);
    });
  });

  describe("removeCartItems", () => {
    it("removes multiple items and clears summary/error", () => {
      const base: CartState = {
        ...initialCartState,
        items: [createCartItem({ id: "a" }), createCartItem({ id: "b" }), createCartItem({ id: "c" })],
        summary: {
          subTotal: 1,
          discountTotal: 0,
          discounts: [],
          shippingFee: 0,
          totalAmount: 1,
          rewardPoints: 0,
        },
        error: "stale",
      };

      const next = cartReducer(base, removeCartItems(["a", "c"]));
      expect(next.items.map((item) => item.id)).toEqual(["b"]);
      expect(next.summary).toBeNull();
      expect(next.error).toBeNull();
    });
  });

  describe("clearCart", () => {
    it("empties items, summary, and error", () => {
      const base: CartState = {
        ...initialCartState,
        items: [createCartItem()],
        summary: {
          subTotal: 1,
          discountTotal: 0,
          discounts: [],
          shippingFee: 0,
          totalAmount: 1,
          rewardPoints: 0,
        },
        error: "stale",
      };

      const next = cartReducer(base, clearCart());
      expect(next.items).toEqual([]);
      expect(next.summary).toBeNull();
      expect(next.error).toBeNull();
    });
  });

  describe("drawer actions", () => {
    it("opens and closes cart drawer", () => {
      const opened = cartReducer(initialCartState, openCartDrawer());
      expect(opened.isDrawerOpen).toBe(true);

      const closed = cartReducer(opened, closeCartDrawer());
      expect(closed.isDrawerOpen).toBe(false);
    });
  });

  describe("fetchCart async states", () => {
    it("sets loading on pending", () => {
      const next = cartReducer(initialCartState, { type: fetchCart.pending.type });
      expect(next.loading).toBe(true);
      expect(next.error).toBeNull();
    });

    it("defaults selected to true on first fulfilled fetch", () => {
      const next = cartReducer(
        initialCartState,
        fetchCart.fulfilled([createCartItem({ id: "a" }), createCartItem({ id: "b", selected: false })], "req", undefined),
      );

      expect(next.loading).toBe(false);
      expect(next.items[0].selected).toBe(true);
      expect(next.items[1].selected).toBe(true);
    });

    it("preserves existing selection on subsequent fulfilled fetch", () => {
      const base = cartReducer(
        initialCartState,
        setCartItems([createCartItem({ id: "a", selected: false }), createCartItem({ id: "b", selected: true })]),
      );

      const next = cartReducer(
        base,
        fetchCart.fulfilled([createCartItem({ id: "a" }), createCartItem({ id: "b" }), createCartItem({ id: "c" })], "req", undefined),
      );

      expect(next.items[0].selected).toBe(false);
      expect(next.items[1].selected).toBe(true);
      expect(next.items[2].selected).toBe(false);
    });

    it("forces selected false for disableSelection items on fulfilled fetch", () => {
      const next = cartReducer(
        initialCartState,
        fetchCart.fulfilled([createCartItem({ id: "a", disableSelection: true, selected: true })], "req", undefined),
      );

      expect(next.items[0].selected).toBe(false);
    });

    it("sets error on rejected", () => {
      const next = cartReducer(initialCartState, {
        type: fetchCart.rejected.type,
        error: { message: "network error" },
      });

      expect(next.loading).toBe(false);
      expect(next.error).toBe("network error");
    });
  });

  describe("syncCartFromServer async states", () => {
    it("sets loading on pending", () => {
      const next = cartReducer(initialCartState, { type: syncCartFromServer.pending.type });
      expect(next.loading).toBe(true);
      expect(next.error).toBeNull();
    });

    it("applies fetched items on fulfilled", () => {
      const next = cartReducer(
        initialCartState,
        syncCartFromServer.fulfilled([createCartItem({ id: "a" })], "req", { skipAuthLogout: true }),
      );

      expect(next.loading).toBe(false);
      expect(next.items).toHaveLength(1);
      expect(next.items[0].selected).toBe(true);
    });

    it("sets error on rejected", () => {
      const next = cartReducer(initialCartState, {
        type: syncCartFromServer.rejected.type,
        meta: { aborted: false },
        error: { message: "sync failed" },
      });

      expect(next.loading).toBe(false);
      expect(next.error).toBe("sync failed");
    });
  });

  describe("logOut extraReducer", () => {
    it("resets cart state", () => {
      const base: CartState = {
        items: [createCartItem()],
        summary: {
          subTotal: 1,
          discountTotal: 0,
          discounts: [],
          shippingFee: 0,
          totalAmount: 1,
          rewardPoints: 0,
        },
        loading: true,
        writePendingCount: 2,
        error: "err",
        isDrawerOpen: true,
      };

      const next = cartReducer(base, logOut());
      expect(next.items).toEqual([]);
      expect(next.summary).toBeNull();
      expect(next.error).toBeNull();
      expect(next.loading).toBe(false);
      expect(next.writePendingCount).toBe(0);
      expect(next.isDrawerOpen).toBe(false);
    });
  });

  describe("selectors", () => {
    it("selectCartItems returns items", () => {
      const items = [createCartItem({ id: "a" })];
      const state = createTestRootState({ items });
      expect(selectCartItems(state)).toEqual(items);
    });

    it("selectCartTotalQuantity sums quantities", () => {
      const state = createTestRootState({
        items: [createCartItem({ id: "a", quantity: 2 }), createCartItem({ id: "b", quantity: 3 })],
      });
      expect(selectCartTotalQuantity(state)).toBe(5);
    });

    it("selectSelectedCartItems filters selected selectable items", () => {
      const state = createTestRootState({
        items: [
          createCartItem({ id: "a", selected: true }),
          createCartItem({ id: "b", selected: false }),
          createCartItem({ id: "c", selected: true, disableSelection: true }),
        ],
      });

      expect(selectSelectedCartItems(state).map((item) => item.id)).toEqual(["a"]);
    });

    it("selectCheckoutEligibleItems filters checkout-eligible items", () => {
      const state = createTestRootState({
        items: [
          createCartItem({ id: "eligible", selected: false, isValid: true }),
          createCartItem({ id: "out-of-stock", isValid: false, reason: "OUT_OF_STOCK" }),
          createCartItem({ id: "disabled", disableSelection: true }),
        ],
      });

      expect(selectCheckoutEligibleItems(state).map((item) => item.id)).toEqual(["eligible"]);
    });

    it("selectCartSummary and selectCartLoading read cart meta", () => {
      const summary = {
        subTotal: 100,
        discountTotal: 0,
        discounts: [],
        shippingFee: 0,
        totalAmount: 100,
        rewardPoints: 0,
      };
      const state = createTestRootState({ summary, loading: true });

      expect(selectCartSummary(state)).toEqual(summary);
      expect(selectCartLoading(state)).toBe(true);
    });
  });

  describe("store integration", () => {
    it("updates state through dispatched actions", () => {
      const store = createCartStore();

      store.dispatch(setCartItems([createCartItem({ id: "a", selected: true })]));
      store.dispatch(toggleCartItemSelection("a"));
      store.dispatch(
        setCartSummary({
          subTotal: 100,
          discountTotal: 0,
          discounts: [],
          shippingFee: 0,
          totalAmount: 100,
          rewardPoints: 0,
        }),
      );

      const state = store.getState().cart;
      expect(state.items[0].selected).toBe(false);
      expect(state.summary?.totalAmount).toBe(100);
    });
  });
});
