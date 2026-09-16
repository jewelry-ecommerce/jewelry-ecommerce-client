import { safeTrackRemoveFromCartFromViewItem } from "@/lib/gtm/track-remove-from-cart";
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import {
  beginCartWritePending,
  clearCart,
  endCartWritePending,
  removeCartItem,
  selectAllCartItems,
  selectCartItems,
  setCartItems,
  toggleCartItemSelection,
} from "@/redux/slices/cart.slice";
import { persistCartLines } from "@/utils/api/cart/cart-mutation.util";
import { invalidatePendingCartSync } from "@/utils/api/cart/cart-sync-abort.util";
import { buildPostCartLine, buildPostCartSetLine, getCartApiOptions, isCartSetViewItem } from "@/utils/api/cart/cart.util";
import { isCartGetAborted } from "@/utils/api/cart/cart-sync-abort.util";
import { getErrorMessage } from "@/utils/helpers/axios";
import { toast } from "react-toastify";

const REMOVE_CART_ERROR_MESSAGE = "Không thể xoá sản phẩm khỏi giỏ hàng. Vui lòng thử lại.";

const showRemoveCartError = (error?: unknown) => {
  if (isCartGetAborted(error)) return;

  const message = getErrorMessage(error);
  if (!message) return;

  toast.error(message === "Đã xảy ra lỗi không xác định!" ? REMOVE_CART_ERROR_MESSAGE : message, {
    toastId: "remove-cart-item-error",
  });
};

export type UseCartItemsActions = {
  selectedCount: number;
  selectedItems: CartViewItem[];
  handleToggleItemSelect: (id: string) => void;
  handleSelectAll: (checked: boolean) => void;
  handleRemoveSelected: (id?: string) => void;
};

export const useCartItems = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const isLogin = useAppSelector(selectIsLogin);

  const selectedCount = items.filter((item) => item.selected && !item.disableSelection).length;
  const selectedItems = items.filter((item) => item.selected && !item.disableSelection);

  const handleToggleItemSelect = useCallback(
    (id: string) => {
      dispatch(toggleCartItemSelection(id));
    },
    [dispatch],
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      dispatch(selectAllCartItems(checked));
    },
    [dispatch],
  );

  const handleRemoveSelected = useCallback(
    async (id?: string) => {
      const cartApiOptions = getCartApiOptions(isLogin);
      const snapshot = items;

      if (id) {
        const line = items.find((item) => String(item.id) === String(id));
        if (!line) return;

        const quantityRemoved = Math.max(0, Math.floor(Number(line.quantity) || 0));
        if (quantityRemoved > 0) {
          if (!isCartSetViewItem(line)) safeTrackRemoveFromCartFromViewItem(line, quantityRemoved);
        }

        invalidatePendingCartSync();
        dispatch(beginCartWritePending());
        dispatch(removeCartItem(id));

        try {
          const result = await persistCartLines(
            dispatch,
            [
              isCartSetViewItem(line)
                ? buildPostCartSetLine({ setId: line.setId, lineId: line.lineId, quantity: 0, setComponents: [] })
                : buildPostCartLine({ variationId: String(id), quantity: 0 }),
            ],
            cartApiOptions,
          );

          if (!result.success) {
            dispatch(setCartItems(snapshot));
            showRemoveCartError(result.reason);
          }
        } finally {
          dispatch(endCartWritePending());
        }
        return;
      }

      const linesToRemove = items.filter((item) => item.selected && !item.disableSelection);
      if (linesToRemove.length === 0) return;

      const removedIds = linesToRemove.map((item) => item.id);
      const isAllSelected = removedIds.length > 0 && removedIds.length === items.length;

      linesToRemove.forEach((line) => {
        const quantityRemoved = Math.max(0, Math.floor(Number(line.quantity) || 0));
        if (quantityRemoved > 0) {
          if (!isCartSetViewItem(line)) safeTrackRemoveFromCartFromViewItem(line, quantityRemoved);
        }
      });

      const linesToPost = (isAllSelected ? items : linesToRemove).map((line) =>
        isCartSetViewItem(line)
          ? buildPostCartSetLine({ setId: line.setId, lineId: line.lineId, quantity: 0, setComponents: [] })
          : buildPostCartLine({ variationId: String(line.id), quantity: 0 }),
      );

      invalidatePendingCartSync();
      dispatch(beginCartWritePending());

      if (isAllSelected) {
        dispatch(clearCart());
      } else {
        removedIds.forEach((removedId) => dispatch(removeCartItem(removedId)));
      }

      try {
        const result = await persistCartLines(dispatch, linesToPost, cartApiOptions);

        if (!result.success) {
          dispatch(setCartItems(snapshot));
          showRemoveCartError(result.reason);
        }
      } finally {
        dispatch(endCartWritePending());
      }
    },
    [dispatch, isLogin, items],
  );

  return {
    selectedCount,
    selectedItems,
    handleToggleItemSelect,
    handleSelectAll,
    handleRemoveSelected,
  };
};
