import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import badgeReducer from "./slices/badge.slice";
import cartReducer from "./slices/cart.slice";
import wishlistReducer from "./slices/wishlist.slice";

export type { RootState } from "./types";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    badge: badgeReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
