import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import { logOut } from "@/redux/slices/auth.slice";
import { CartApi } from "@/utils/api";
import { abortPendingCartGet, createCartGetAbortSignal, isCartGetAborted, isStaleCartSync } from "@/utils/api/cart/cart-sync-abort.util";
import { isCartItemCheckoutEligible, mapCartApiResponseToViewItems, type CartRequestOptions } from "@/utils/api/cart/cart.util";
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CartCalculateTotalResponse } from "@/utils/api/cart/cart.interface";
import type { CartState, RootState } from "../types";

const resolveItemSelected = (item: CartViewItem, explicitSelected?: boolean) =>
  item.disableSelection ? false : (explicitSelected ?? item.selected ?? true);

const initialState: CartState = {
  items: [],
  summary: null,
  loading: false,
  writePendingCount: 0,
  error: null,
  isDrawerOpen: false,
};

export type SyncCartFromServerOptions = CartRequestOptions;

const fetchCartItemsFromApi = async (options?: SyncCartFromServerOptions): Promise<CartViewItem[]> => {
  try {
    const res = await CartApi.getCart(options);
    if (!res || !res.length) return [];
    return mapCartApiResponseToViewItems(res);
  } catch (error) {
    if (isCartGetAborted(error)) throw error;
    return [];
  }
};

const applyFetchedCartItems = (state: CartState, payload: CartViewItem[]) => {
  const selectedMap = new Map(state.items.map((item) => [item.id, item.selected]));
  const isFirstFetch = selectedMap.size === 0;
  state.items = payload.map((item) => ({
    ...item,
    selected: item.disableSelection
      ? false
      : selectedMap.has(item.id)
        ? (selectedMap.get(item.id) as boolean)
        : isFirstFetch
          ? true
          : (item.selected ?? false),
  }));
  state.error = null;
};

export const fetchCart = createAsyncThunk<CartViewItem[], SyncCartFromServerOptions | void>("cart/fetchCart", async (options) =>
  fetchCartItemsFromApi(options ?? undefined),
);

const resolveSyncGeneration = (options?: SyncCartFromServerOptions | void) =>
  options && typeof options === "object" ? options.syncGeneration : undefined;

export const syncCartFromServer = createAsyncThunk<CartViewItem[], SyncCartFromServerOptions | void>(
  "cart/syncCartFromServer",
  async (options, { signal: rtkSignal }) => {
    const syncGeneration = resolveSyncGeneration(options);
    const requestSignal = options?.signal ?? createCartGetAbortSignal();

    rtkSignal.addEventListener(
      "abort",
      () => {
        abortPendingCartGet();
      },
      { once: true },
    );

    const items = await fetchCartItemsFromApi({
      ...(options ?? {}),
      signal: requestSignal,
    });

    if (syncGeneration !== undefined && isStaleCartSync(syncGeneration)) {
      throw new DOMException("Aborted", "AbortError");
    }

    return items;
  },
);

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartViewItem[]>) => {
      state.items = action.payload.map((item) => ({
        ...item,
        selected: resolveItemSelected(item),
      }));
      state.error = null;
    },
    setCartSummary: (state, action: PayloadAction<CartCalculateTotalResponse | null>) => {
      state.summary = action.payload;
    },
    addCartItem: (state, action: PayloadAction<CartViewItem>) => {
      const incoming = action.payload;
      const idx = state.items.findIndex((item) => String(item.id) === String(incoming.id));

      if (idx === -1) {
        state.items.push({
          ...incoming,
          selected: resolveItemSelected(incoming),
        });
        return;
      }

      const existing = state.items[idx];
      state.items[idx] = {
        ...existing,
        ...incoming,
        quantity: existing.quantity + incoming.quantity,
        selected: incoming.selected ?? existing.selected,
      };
    },
    toggleCartItemSelection: (state, action: PayloadAction<string | number>) => {
      const idx = state.items.findIndex((item) => String(item.id) === String(action.payload));
      if (idx === -1 || state.items[idx].disableSelection) return;
      state.items[idx].selected = !state.items[idx].selected;
    },
    selectAllCartItems: (state, action: PayloadAction<boolean>) => {
      state.items = state.items.map((item) => ({
        ...item,
        selected: item.disableSelection ? false : action.payload,
      }));
    },
    updateCartItem: (
      state,
      action: PayloadAction<{ id: string; quantity: number; selected?: boolean; oldVariationId?: string } | CartViewItem>,
    ) => {
      if ((action.payload as any).oldVariationId !== undefined) {
        const payload = action.payload as CartViewItem & { oldVariationId?: string };
        const { oldVariationId, ...nextItem } = payload;
        const oldId = payload.oldVariationId ?? payload.id;
        const idx = state.items.findIndex((item) => String(item.id) === String(oldId));
        if (idx !== -1) {
          state.items[idx] = {
            ...state.items[idx],
            ...nextItem,
            selected: nextItem.selected ?? state.items[idx].selected,
          };
        }
      } else {
        const updateItem = action.payload as CartViewItem;
        const idx = state.items.findIndex((item) => String(item.id) === String(updateItem.id));
        if (idx !== -1) {
          state.items[idx] = {
            ...state.items[idx],
            ...updateItem,
            selected: updateItem.selected ?? state.items[idx].selected,
          };
        }
      }
    },
    removeCartItem: (state, action: PayloadAction<string | number>) => {
      state.items = state.items.filter((item) => String(item.id) !== String(action.payload));
    },
    removeCartItems: (state, action: PayloadAction<Array<string | number>>) => {
      const removeSet = new Set(action.payload.map((id) => String(id)));
      state.items = state.items.filter((item) => !removeSet.has(String(item.id)));
      state.summary = null;
      state.error = null;
    },
    clearCart: (state) => {
      state.items = [];
      state.summary = null;
      state.error = null;
    },
    openCartDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeCartDrawer: (state) => {
      state.isDrawerOpen = false;
    },
    beginCartWritePending: (state) => {
      state.writePendingCount += 1;
    },
    endCartWritePending: (state) => {
      state.writePendingCount = Math.max(0, state.writePendingCount - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        applyFetchedCartItems(state, action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch cart";
      })
      .addCase(syncCartFromServer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncCartFromServer.fulfilled, (state, action) => {
        const syncGeneration = resolveSyncGeneration(action.meta?.arg);
        if (syncGeneration !== undefined && isStaleCartSync(syncGeneration)) return;

        state.loading = false;
        applyFetchedCartItems(state, action.payload);
      })
      .addCase(syncCartFromServer.rejected, (state, action) => {
        state.loading = false;
        if (action.meta.aborted || isCartGetAborted(action.error)) return;
        state.error = action.error.message || "Failed to fetch cart";
      })
      .addCase(logOut, (state) => {
        state.items = [];
        state.summary = null;
        state.error = null;
        state.loading = false;
        state.writePendingCount = 0;
        state.isDrawerOpen = false;
      });
  },
});

export const {
  setCartItems,
  setCartSummary,
  addCartItem,
  toggleCartItemSelection,
  selectAllCartItems,
  updateCartItem,
  removeCartItem,
  removeCartItems,
  clearCart,
  openCartDrawer,
  closeCartDrawer,
  beginCartWritePending,
  endCartWritePending,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartSummary = (state: RootState) => state.cart.summary;
export const selectCartTotalQuantity = (state: RootState) => state.cart.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartWritePending = (state: RootState) => state.cart.writePendingCount > 0;
export const selectCartError = (state: RootState) => state.cart.error;
export const selectSelectedCartItems = createSelector([selectCartItems], (items) =>
  items.filter((item) => item.selected && !item.disableSelection),
);
export const selectCheckoutEligibleItems = createSelector([selectCartItems], (items) => items.filter(isCartItemCheckoutEligible));
