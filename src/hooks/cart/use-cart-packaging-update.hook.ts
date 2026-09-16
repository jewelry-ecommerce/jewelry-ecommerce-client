import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import { beginCartWritePending, endCartWritePending, selectCartItems, setCartItems, updateCartItem } from "@/redux/slices/cart.slice";
import type { CartItemData } from "@/utils/api/cart/cart.interface";
import { persistCartLines } from "@/utils/api/cart/cart-mutation.util";
import { invalidatePendingCartSync } from "@/utils/api/cart/cart-sync-abort.util";
import { buildCartItemWithPackagingSelection, buildPostCartLine, getCartApiOptions } from "@/utils/api/cart/cart.util";
import { getErrorMessage } from "@/utils/helpers/axios";
import { useCallback } from "react";
import { toast } from "react-toastify";

const useCartPackagingUpdate = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const isLogin = useAppSelector(selectIsLogin);

  const handlePackagingSelectionChange = useCallback(
    async (id: CartItemData["id"], relationId: string, selected: boolean) => {
      const cartApiOptions = getCartApiOptions(isLogin);
      const currentItem = items.find((item) => String(item.id) === String(id));
      if (!currentItem) return;

      const nextItem = buildCartItemWithPackagingSelection(currentItem, relationId, selected);
      if (!nextItem) return;

      const snapshot = items;
      invalidatePendingCartSync();
      dispatch(beginCartWritePending());
      dispatch(updateCartItem(nextItem));

      try {
        const result = await persistCartLines(
          dispatch,
          [
            buildPostCartLine({
              variationId: String(nextItem.id),
              quantity: nextItem.quantity,
              selectedPackagingRelationIds: nextItem.selectedPackagingRelationIds,
            }),
          ],
          cartApiOptions,
        );

        if (!result.success) {
          dispatch(setCartItems(snapshot));
          const message = getErrorMessage(result.reason);
          toast.error(
            !message || message === "Đã xảy ra lỗi không xác định!" ? "Không thể cập nhật tuỳ chọn đóng gói. Vui lòng thử lại." : message,
          );
        }
      } finally {
        dispatch(endCartWritePending());
      }
    },
    [dispatch, isLogin, items],
  );

  return { handlePackagingSelectionChange };
};

export default useCartPackagingUpdate;
