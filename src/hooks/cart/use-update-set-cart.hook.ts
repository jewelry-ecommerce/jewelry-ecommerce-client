// set term
import { useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import { beginCartWritePending, endCartWritePending, selectCartItems } from "@/redux/slices/cart.slice";
import { store } from "@/redux/store";
import type { CartSetViewItem } from "@/utils/api/cart/cart.interface";
import { persistCartLines } from "@/utils/api/cart/cart-mutation.util";
import { invalidatePendingCartSync } from "@/utils/api/cart/cart-sync-abort.util";
import { buildPostCartSetLine, getCartApiOptions, getCartVariationMergeLimitError, isCartSetViewItem } from "@/utils/api/cart/cart.util";
import { toast } from "react-toastify";

const useUpdateSetCart = () => {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector(selectIsLogin);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateSetCart = useCallback(
    async (item: CartSetViewItem, selections: Record<string, string>, maxQuantity?: number) => {
      if (isUpdating) return false;
      const setComponents = Object.entries(selections).map(([setItemId, variationId]) => ({ setItemId, variationId }));
      const matchingSet = selectCartItems(store.getState())
        .filter(isCartSetViewItem)
        .find(
          (cartItem) =>
            cartItem.id !== item.id &&
            cartItem.setId === item.setId &&
            cartItem.setComponents.length === setComponents.length &&
            setComponents.every(({ setItemId, variationId }) =>
              cartItem.setComponents.some((component) => component.setItemId === setItemId && component.variationId === variationId),
            ),
        );
      if (maxQuantity !== undefined) {
        const cartVariationMergeLimitError = getCartVariationMergeLimitError(maxQuantity, matchingSet?.quantity ?? 0, item.quantity);
        if (cartVariationMergeLimitError) {
          toast.warning(
            `Lựa chọn mới chỉ có thể mua tối đa ${maxQuantity} bộ sản phẩm. Vui lòng giảm số lượng trong giỏ hàng trước khi cập nhật.`,
          );
          return false;
        }
      }

      setIsUpdating(true);
      invalidatePendingCartSync();
      dispatch(beginCartWritePending());
      try {
        const result = await persistCartLines(
          dispatch,
          [
            ...(item.lineId ? [buildPostCartSetLine({ setId: item.setId, lineId: item.lineId, quantity: 0, setComponents: [] })] : []),
            ...(matchingSet?.lineId
              ? [buildPostCartSetLine({ setId: matchingSet.setId, lineId: matchingSet.lineId, quantity: 0, setComponents: [] })]
              : []),
            buildPostCartSetLine({
              setId: item.setId,
              quantity: item.quantity + (matchingSet?.quantity ?? 0),
              setComponents,
            }),
          ],
          getCartApiOptions(isLogin),
        );
        return result.success;
      } finally {
        dispatch(endCartWritePending());
        setIsUpdating(false);
      }
    },
    [dispatch, isLogin, isUpdating],
  );

  return { updateSetCart, isUpdating };
};

export default useUpdateSetCart;
