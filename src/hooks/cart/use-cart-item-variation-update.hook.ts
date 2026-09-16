import { useAppDispatch } from "@/redux/hooks";
import {
  removeCartItem,
  selectCartItems,
  setCartItems,
  updateCartItem,
  beginCartWritePending,
  endCartWritePending,
} from "@/redux/slices/cart.slice";
import type { AppDispatch } from "@/redux/store";
import { store } from "@/redux/store";
import type { CartProductVariation, CartViewItem } from "@/utils/api/cart/cart.interface";
import { persistCartLines } from "@/utils/api/cart/cart-mutation.util";
import { invalidatePendingCartSync, isCartGetAborted } from "@/utils/api/cart/cart-sync-abort.util";
import { buildPostCartLine, getCartApiOptions, getCartVariationMergeLimitError } from "@/utils/api/cart/cart.util";
import { ProductAvailabilityCode } from "@/utils/api/product/product.enum";
import { getErrorMessage } from "@/utils/helpers/axios";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";

export type UpdateCartItemVariationParams = {
  oldVariationId: string;
  nextVariationId?: string;
  detailVariation?: CartProductVariation;
  optimisticReplacementItem?: CartViewItem;
  targetStock?: number;
};

export type UpdateCartItemVariationResult =
  { success: true } | { success: false; reason: "not-found" | "unchanged" | "limit" | "api" | "error"; error?: unknown };

const applyVariationToCart = (
  dispatch: AppDispatch,
  cartItems: CartViewItem[],
  oldVariationId: string,
  nextItem: CartViewItem,
  selected: boolean,
  quantity: number,
) => {
  const existingItem = cartItems.find((item) => String(item.id) === String(nextItem.id));

  if (existingItem && String(existingItem.id) !== String(oldVariationId)) {
    const mergedQuantity = existingItem.quantity + quantity;
    const mergedSelected = Boolean(existingItem.selected || selected);

    dispatch(
      updateCartItem({
        id: String(existingItem.id),
        quantity: mergedQuantity,
        selected: mergedSelected,
      }),
    );
    dispatch(removeCartItem(oldVariationId));
    return;
  }

  dispatch(updateCartItem({ ...nextItem, selected, oldVariationId }));
};

function resolveVariationUpdateMaxQuantity({
  currentItem,
  optimisticReplacementItem,
  detailVariation,
}: {
  currentItem: CartViewItem;
  optimisticReplacementItem?: CartViewItem;
  detailVariation?: CartProductVariation;
}): number | undefined {
  const isPreOrder =
    optimisticReplacementItem?.availabilityCode === ProductAvailabilityCode.PRE_ORDER ||
    currentItem.availabilityCode === ProductAvailabilityCode.PRE_ORDER;

  // Pre-order: giữ maxQuantity từ cart, không ghi đè bằng stock=0 của variant mới.
  if (isPreOrder) {
    return optimisticReplacementItem?.maxQuantity ?? currentItem.maxQuantity;
  }

  return detailVariation?.stock ?? optimisticReplacementItem?.maxQuantity ?? currentItem.maxQuantity;
}

const buildNextVariationItem = ({
  currentItem,
  resolvedNextVariationId,
  optimisticReplacementItem,
  detailVariation,
}: {
  currentItem: CartViewItem;
  resolvedNextVariationId: string;
  optimisticReplacementItem?: CartViewItem;
  detailVariation?: CartProductVariation;
}): CartViewItem => {
  const maxQuantity = resolveVariationUpdateMaxQuantity({
    currentItem,
    optimisticReplacementItem,
    detailVariation,
  });

  if (optimisticReplacementItem) {
    return {
      ...optimisticReplacementItem,
      id: resolvedNextVariationId,
      quantity: currentItem.quantity,
      selected: currentItem.selected ?? true,
      ...(maxQuantity !== undefined ? { maxQuantity } : {}),
    };
  }

  return {
    ...currentItem,
    id: resolvedNextVariationId,
    variationId: resolvedNextVariationId,
    ...(detailVariation
      ? {
          name: detailVariation.name ?? currentItem.name,
          ...(maxQuantity !== undefined ? { maxQuantity } : {}),
        }
      : {}),
  };
};

const useCartItemVariationUpdate = () => {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector(selectIsLogin);

  const updateCartItemVariation = useCallback(
    async ({
      oldVariationId,
      nextVariationId,
      detailVariation,
      optimisticReplacementItem,
      targetStock,
    }: UpdateCartItemVariationParams): Promise<UpdateCartItemVariationResult> => {
      const cartItems = selectCartItems(store.getState());
      const snapshot = cartItems;
      const currentItem = cartItems.find((item) => String(item.id) === oldVariationId);
      if (!currentItem) {
        return { success: false, reason: "not-found" };
      }

      const resolvedNextVariationId = String(nextVariationId ?? detailVariation?.id ?? "");
      if (!resolvedNextVariationId || resolvedNextVariationId === oldVariationId) {
        return { success: false, reason: "unchanged" };
      }

      const quantity = currentItem.quantity;
      const selected = currentItem.selected ?? true;
      const targetExistingItem = cartItems.find((item) => String(item.id) === resolvedNextVariationId);
      const availabilityCode =
        optimisticReplacementItem?.availabilityCode ?? targetExistingItem?.availabilityCode ?? currentItem.availabilityCode;
      const resolvedMaxQuantity = optimisticReplacementItem?.maxQuantity ?? targetExistingItem?.maxQuantity ?? currentItem.maxQuantity;
      const resolvedTargetStock = targetStock ?? Number(detailVariation?.stock ?? currentItem.maxQuantity ?? 0);
      const cartVariationMergeLimitError = getCartVariationMergeLimitError(
        resolvedTargetStock,
        targetExistingItem?.quantity ?? 0,
        quantity,
        { availabilityCode, maxQuantity: resolvedMaxQuantity },
      );

      if (cartVariationMergeLimitError) {
        toast.warning(cartVariationMergeLimitError.toastMessage);
        return { success: false, reason: "limit" };
      }

      const mergedAbsoluteQty = (targetExistingItem?.quantity ?? 0) + quantity;
      const nextItem = buildNextVariationItem({
        currentItem,
        resolvedNextVariationId,
        optimisticReplacementItem,
        detailVariation,
      });

      applyVariationToCart(dispatch, cartItems, oldVariationId, nextItem, selected, quantity);
      invalidatePendingCartSync();
      dispatch(beginCartWritePending());

      try {
        const result = await persistCartLines(
          dispatch,
          [
            buildPostCartLine({ variationId: oldVariationId, quantity: 0 }),
            buildPostCartLine({
              variationId: resolvedNextVariationId,
              quantity: mergedAbsoluteQty,
              selectedPackagingRelationIds: currentItem.selectedPackagingRelationIds,
            }),
          ],
          getCartApiOptions(isLogin),
        );

        if (!result.success) {
          dispatch(setCartItems(snapshot));
          return { success: false, reason: "api" };
        }

        return { success: true };
      } catch (error) {
        if (isCartGetAborted(error)) {
          return { success: true };
        }

        dispatch(setCartItems(snapshot));
        console.error("Failed to update item variation on API", error);
        const message = getErrorMessage(error);
        toast.error(
          !message || message === "Đã xảy ra lỗi không xác định!"
            ? "Không thể cập nhật sản phẩm trong giỏ hàng. Vui lòng thử lại."
            : message,
        );
        return { success: false, reason: "error", error };
      } finally {
        dispatch(endCartWritePending());
      }
    },
    [dispatch, isLogin],
  );

  return { updateCartItemVariation };
};

export default useCartItemVariationUpdate;
