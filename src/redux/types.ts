import type { AuthUser } from "@/utils/api/auth/auth.interface";
import type { ProductBadgesByVariants } from "@/utils/api/badge/badge.interface";
import type { CartCalculateTotalResponse, CartViewItem } from "@/utils/api/cart/cart.interface";

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isLogin: boolean;
  isResolved: boolean;
  user: AuthUser | null;
}

export interface CartState {
  items: CartViewItem[];
  summary: CartCalculateTotalResponse | null;
  loading: boolean;
  /** Optimistic cart edits waiting for postCart + GET sync (blocks calculate-total). */
  writePendingCount: number;
  error: string | null;
  isDrawerOpen: boolean;
}

export interface WishlistState {
  productIds: string[];
}

export interface BadgeState {
  byProductId: Record<string, ProductBadgesByVariants>;
  loading: boolean;
}

export interface RootState {
  auth: AuthState;
  badge: BadgeState;
  cart: CartState;
  wishlist: WishlistState;
}
