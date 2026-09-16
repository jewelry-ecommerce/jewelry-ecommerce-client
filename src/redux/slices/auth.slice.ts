import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser } from "@/utils/api/auth/auth.interface";
import { clearGuestCartId } from "@/utils/api/cart/guest-cart-id.util";
import type { AuthState, RootState } from "../types";

export const logOut = createAction("auth/logOut");

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isLogin: false,
  isResolved: false,
  user: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken?: string | null; refreshToken?: string | null; user: AuthUser }>) => {
      const { accessToken, refreshToken, user } = action.payload;
      state.accessToken = accessToken ?? null;
      state.refreshToken = refreshToken ?? null;
      state.user = user;
      state.isLogin = true;
      state.isResolved = true;
    },
    setGuestState: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isLogin = false;
      state.isResolved = true;
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isResolved = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logOut, (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isLogin = false;
      state.isResolved = true;
      state.user = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_info");
      }
      clearGuestCartId();
    });
  },
});

export const { setCredentials, setGuestState, setUser } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentToken = (state: RootState) => state.auth.accessToken;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsLogin = (state: RootState) => state.auth.isLogin;
export const selectIsAuthResolved = (state: RootState) => state.auth.isResolved;
