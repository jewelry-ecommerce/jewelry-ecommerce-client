import { ProductApi } from "@/utils/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../types";

type WishlistState = {
  productIds: string[];
};

const initialState: WishlistState = {
  productIds: [],
};

const uniqueIds = (ids: string[]) => Array.from(new Set(ids.map(String)));

export const addWishlistProducts = createAsyncThunk<string[], string[]>("wishlist/addWishlistProducts", async (productIds) => {
  await ProductApi.postCustomerWishlist(productIds);
  return productIds.map(String);
});

export const removeWishlistProducts = createAsyncThunk<string[], string[]>("wishlist/removeWishlistProducts", async (productIds) => {
  await ProductApi.deleteCustomerWishlist(productIds);
  return productIds.map(String);
});

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlistProductIds: (state, action: PayloadAction<string[]>) => {
      state.productIds = uniqueIds(action.payload);
    },
    clearWishlistProductIds: (state) => {
      state.productIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addWishlistProducts.fulfilled, (state, action) => {
        state.productIds = uniqueIds([...state.productIds, ...action.payload]);
      })
      .addCase(removeWishlistProducts.fulfilled, (state, action) => {
        const removeIds = new Set(action.payload.map(String));
        state.productIds = state.productIds.filter((id) => !removeIds.has(String(id)));
      });
  },
});

export const { setWishlistProductIds, clearWishlistProductIds } = wishlistSlice.actions;

export default wishlistSlice.reducer;

export const selectWishlistProductIds = (state: RootState) => state.wishlist.productIds;
