import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as BadgeApi from "@/utils/api/badge/badge.api";
import type { ProductBadgesByVariants, StorefrontProductInput } from "@/utils/api/badge/badge.interface";
import { chunkStorefrontBadgeProducts } from "@/utils/api/badge/badge.util";
import type { RootState } from "../types";

type BadgeState = {
  byProductId: Record<string, ProductBadgesByVariants>;
  loading: boolean;
};

const initialState: BadgeState = {
  byProductId: {},
  loading: false,
};

export const fetchStorefrontBadgesBatch = createAsyncThunk(
  "badge/fetchStorefrontBadgesBatch",
  async (products: StorefrontProductInput[]) => {
    if (products.length === 0) return {} as Record<string, ProductBadgesByVariants>;

    const chunks = chunkStorefrontBadgeProducts(products);
    const merged: Record<string, ProductBadgesByVariants> = {};

    for (const chunk of chunks) {
      const page = await BadgeApi.postListStorefrontProductsBadges({ products: chunk });
      Object.assign(merged, page);
    }

    return merged;
  },
);

const badgeSlice = createSlice({
  name: "badge",
  initialState,
  reducers: {
    clearProductBadges: (state) => {
      state.byProductId = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStorefrontBadgesBatch.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStorefrontBadgesBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.byProductId = { ...state.byProductId, ...action.payload };
      })
      .addCase(fetchStorefrontBadgesBatch.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearProductBadges } = badgeSlice.actions;
export default badgeSlice.reducer;

export const selectProductBadgesMap = (state: RootState) => state.badge.byProductId;
export const selectProductBadgesLoading = (state: RootState) => state.badge.loading;

export const selectProductBadgePayload = (state: RootState, productId: string) => state.badge.byProductId[productId];
