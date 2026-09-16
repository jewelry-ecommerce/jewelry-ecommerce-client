import { type AddToCartQuantityTrackSource, safeTrackAddToCartFromQuantitySource } from "@/lib/gtm/track-add-to-cart";
import { safeTrackRemoveFromCartFromQuantitySource } from "@/lib/gtm/track-remove-from-cart";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import {
  beginCartWritePending,
  endCartWritePending,
  removeCartItem,
  selectCartItems,
  setCartItems,
  updateCartItem,
} from "@/redux/slices/cart.slice";
import { store } from "@/redux/store";
import type { CartItemData, CartSetComponentPayload, CartViewItem } from "@/utils/api/cart/cart.interface";
import { persistCartLines } from "@/utils/api/cart/cart-mutation.util";
import { invalidatePendingCartSync } from "@/utils/api/cart/cart-sync-abort.util";
import { buildPostCartLine, buildPostCartSetLine, getCartApiOptions, isCartSetViewItem } from "@/utils/api/cart/cart.util";
import { getErrorMessage } from "@/utils/helpers/axios";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";

type IdentifiedSetComponentPayload = CartSetComponentPayload & { setItemId: string };

const SET_COMPONENT_IDENTITY_ERROR_MESSAGE = "Không thể cập nhật bộ sản phẩm vì thiếu thông tin lựa chọn. Vui lòng tải lại giỏ hàng.";

const buildSetComponentPayload = (components: CartViewItem[]): IdentifiedSetComponentPayload[] | null => {
  if (!components.length) return null;

  const payload: IdentifiedSetComponentPayload[] = [];
  for (const component of components) {
    const setItemId = component.setItemId?.trim() ?? "";
    const variationId = component.variationId?.trim() ?? "";
    if (!setItemId || !variationId) return null;
    payload.push({ setItemId, variationId });
  }
  return payload;
};

const useCartItemQuantity = () => {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector(selectIsLogin);

  const debounceMap = useRef<Record<string, NodeJS.Timeout>>({});
  /** How many beginCartWritePending calls this hook still owes an end for. */
  const pendingWriteCountRef = useRef(0);

  useEffect(() => {
    return () => {
      Object.values(debounceMap.current).forEach((timeoutId) => clearTimeout(timeoutId));
      debounceMap.current = {};
      while (pendingWriteCountRef.current > 0) {
        pendingWriteCountRef.current -= 1;
        dispatch(endCartWritePending());
      }
    };
  }, [dispatch]);

  const beginWrite = useCallback(() => {
    pendingWriteCountRef.current += 1;
    dispatch(beginCartWritePending());
  }, [dispatch]);

  const endWrite = useCallback(() => {
    if (pendingWriteCountRef.current <= 0) return;
    pendingWriteCountRef.current -= 1;
    dispatch(endCartWritePending());
  }, [dispatch]);

  const handleQuantityChange = useCallback(
    async (id: CartItemData["id"], nextQuantity: number) => {
      const cartApiOptions = getCartApiOptions(isLogin);
      const cartItems = selectCartItems(store.getState());
      const currentItem = cartItems.find((line) => String(line.id) === String(id));
      if (!currentItem) return;

      const snapshot = cartItems;
      const isSet = isCartSetViewItem(currentItem);
      const selected = currentItem.selected ?? false;
      const previousQuantity = currentItem.quantity;
      const trackedItem: AddToCartQuantityTrackSource = {
        id: String(currentItem.id),
        name: currentItem.name,
        unitPrice: currentItem.unitPrice,
        variationId: currentItem.variationId,
      };

      if (nextQuantity < 1) {
        const hadDebouncedWrite = Boolean(debounceMap.current[String(id)]);
        if (hadDebouncedWrite) {
          clearTimeout(debounceMap.current[String(id)]);
          delete debounceMap.current[String(id)];
          endWrite();
        }

        invalidatePendingCartSync();
        beginWrite();
        dispatch(removeCartItem(id));

        try {
          const result = await persistCartLines(
            dispatch,
            [
              isSet
                ? buildPostCartSetLine({
                    setId: currentItem.setId,
                    lineId: currentItem.lineId,
                    quantity: 0,
                    setComponents: [],
                  })
                : buildPostCartLine({ variationId: String(id), quantity: 0 }),
            ],
            cartApiOptions,
          );

          if (!result.success) {
            dispatch(setCartItems(snapshot));
            toast.error("Không thể xoá sản phẩm khỏi giỏ hàng. Vui lòng thử lại.", {
              toastId: "remove-cart-item-error",
            });
            return;
          }

          if (!isSet && previousQuantity > 0) {
            safeTrackRemoveFromCartFromQuantitySource(trackedItem, previousQuantity);
          }
        } finally {
          endWrite();
        }
        return;
      }

      const setComponents = isSet ? buildSetComponentPayload(currentItem.setComponents) : null;
      if (isSet && !setComponents) {
        toast.error(SET_COMPONENT_IDENTITY_ERROR_MESSAGE, {
          toastId: `update-set-quantity-identity-error-${id}`,
        });
        return;
      }

      const min = currentItem.minQuantity ?? 1;
      const max = currentItem.maxQuantity;
      let normalizedQuantity = Math.max(min, nextQuantity);
      if (max !== undefined) {
        normalizedQuantity = Math.min(max, normalizedQuantity);
      }

      const quantityUpdateLine =
        isSet && setComponents
          ? buildPostCartSetLine({
              setId: currentItem.setId,
              lineId: currentItem.lineId,
              quantity: normalizedQuantity,
              setComponents,
            })
          : buildPostCartLine({ variationId: String(id), quantity: normalizedQuantity });

      invalidatePendingCartSync();

      const hadDebouncedWrite = Boolean(debounceMap.current[String(id)]);
      if (hadDebouncedWrite) {
        clearTimeout(debounceMap.current[String(id)]);
      } else {
        beginWrite();
      }

      dispatch(updateCartItem({ id, quantity: normalizedQuantity, selected, oldVariationId: id }));

      const quantityAdded = normalizedQuantity - previousQuantity;
      const quantityRemoved = previousQuantity - normalizedQuantity;

      debounceMap.current[String(id)] = setTimeout(async () => {
        delete debounceMap.current[String(id)];
        try {
          const result = await persistCartLines(dispatch, [quantityUpdateLine], cartApiOptions);

          if (!result.success) {
            dispatch(setCartItems(snapshot));
            const message = getErrorMessage(result.reason);
            toast.error(
              !message || message === "Đã xảy ra lỗi không xác định!" ? "Không thể cập nhật số lượng sản phẩm. Vui lòng thử lại." : message,
              { toastId: `update-cart-quantity-error-${id}` },
            );
            return;
          }

          if (!isSet && quantityAdded > 0) {
            safeTrackAddToCartFromQuantitySource(trackedItem, quantityAdded);
          } else if (quantityRemoved > 0) {
            safeTrackRemoveFromCartFromQuantitySource(trackedItem, quantityRemoved);
          }
        } finally {
          endWrite();
        }
      }, 700);
    },
    [beginWrite, dispatch, endWrite, isLogin],
  );

  return { handleQuantityChange };
};

export default useCartItemQuantity;
