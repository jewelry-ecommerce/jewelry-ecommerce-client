// set term
import { useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import { beginCartWritePending, endCartWritePending, openCartDrawer, selectCartItems } from "@/redux/slices/cart.slice";
import { persistCartLines } from "@/utils/api/cart/cart-mutation.util";
import { invalidatePendingCartSync } from "@/utils/api/cart/cart-sync-abort.util";
import { buildPostCartSetLine, getCartAddLimitError, getCartApiOptions, isCartSetViewItem } from "@/utils/api/cart/cart.util";
import { toast } from "react-toastify";

type SetComponentSelection = { itemId: string; variationId: string };

const useAddSetToCart = () => {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector(selectIsLogin);
  const cartItems = useAppSelector(selectCartItems);
  const [isAdding, setIsAdding] = useState(false);

  const addSetToCart = useCallback(
    async (setId: string, selections: SetComponentSelection[], maxQuantity?: number) => {
      if (isAdding || selections.length === 0) return false;

      const existingSet = cartItems.find(
        (item) =>
          isCartSetViewItem(item) &&
          item.setId === setId &&
          item.setComponents.length === selections.length &&
          selections.every(({ itemId, variationId }) =>
            item.setComponents.some((component) => component.setItemId === itemId && component.variationId === variationId),
          ),
      );
      const cartAddLimitError = maxQuantity === undefined ? null : getCartAddLimitError(existingSet, 1, { maxQuantity });
      if (cartAddLimitError) {
        toast.warning(`Bộ sản phẩm này chỉ có thể mua tối đa ${maxQuantity} bộ. Không thể thêm số lượng đã chọn.`);
        return false;
      }

      const absoluteQuantity = (existingSet?.quantity ?? 0) + 1;
      setIsAdding(true);
      invalidatePendingCartSync();
      dispatch(beginCartWritePending());
      try {
        const result = await persistCartLines(
          dispatch,
          [
            buildPostCartSetLine({
              setId,
              quantity: absoluteQuantity,
              setComponents: selections.map(({ itemId, variationId }) => ({ setItemId: itemId, variationId })),
            }),
          ],
          getCartApiOptions(isLogin),
        );
        if (!result.success) {
          if (result.message) toast.error(result.message);
          return false;
        }

        dispatch(openCartDrawer());
        return true;
      } finally {
        dispatch(endCartWritePending());
        setIsAdding(false);
      }
    },
    [cartItems, dispatch, isAdding, isLogin],
  );

  return { addSetToCart, isAdding };
};

export default useAddSetToCart;
