import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import type { AppDispatch } from "@/redux/store";
import { selectIsAuthResolved, selectIsLogin } from "@/redux/slices/auth.slice";
import { syncCartFromServer } from "@/redux/slices/cart.slice";
import { CartApi } from "@/utils/api";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import { getCartApiOptions } from "@/utils/api/cart/cart.util";
import { getGuestCartId } from "@/utils/api/cart/guest-cart-id.util";
import { useCallback, useEffect, useRef } from "react";

type UseCartSyncOptions = {
  enabled?: boolean;
};

/**
 * Đồng bộ giỏ hàng Redux với BE (guest + auth qua cookie/session).
 */
export const useCartSync = ({ enabled = true }: UseCartSyncOptions = {}) => {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector(selectIsLogin);
  const isAuthResolved = useAppSelector(selectIsAuthResolved);
  const lastAuthModeRef = useRef<"guest" | "authenticated" | null>(null);
  const hasAuthResolvedRef = useRef(false);

  const syncCart = useCallback(() => performCartMergeAndSync(dispatch, isLogin), [dispatch, isLogin]);

  const refreshCartFromServer = useCallback(async () => {
    await performCartMergeAndSync(dispatch, isLogin);
  }, [dispatch, isLogin]);

  useEffect(() => {
    if (!enabled || !isAuthResolved) return;

    const nextMode = isLogin ? "authenticated" : "guest";
    const prevMode = lastAuthModeRef.current;
    const authJustResolved = !hasAuthResolvedRef.current;
    hasAuthResolvedRef.current = true;

    const isAuthModeChange = prevMode !== null && prevMode !== nextMode;
    if (!authJustResolved && !isAuthModeChange) return;

    lastAuthModeRef.current = nextMode;
    void syncCart();
  }, [enabled, isAuthResolved, isLogin, syncCart]);

  return { syncCart, refreshCartFromServer };
};

export const performCartMergeAndSync = async (dispatch: AppDispatch, isLogin: boolean) => {
  const options = getCartApiOptions(isLogin);

  if (isLogin && getGuestCartId()) {
    try {
      await CartApi.mergeCart(options);
    } catch {
      // merge fail: still GET sync so UI is not blocked
    }
  }

  await dispatch(syncCartFromServer(getCartApiOptions(isLogin)));
};

/** @deprecated Use performCartMergeAndSync */
export const performCartSync = performCartMergeAndSync;

export const mergeCartItemFromApiResponse = (
  currentItems: CartViewItem[],
  incomingItem: CartViewItem,
): { action: "add" | "update"; item: CartViewItem } => {
  const currentItem = currentItems.find((item) => String(item.id) === String(incomingItem.id));

  if (currentItem) {
    return {
      action: "update",
      item: {
        ...incomingItem,
        quantity: incomingItem.quantity,
        selected: currentItem.selected ?? incomingItem.selected,
      },
    };
  }

  return {
    action: "add",
    item: { ...incomingItem, selected: incomingItem.selected ?? true },
  };
};
