"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectIsAuthResolved, selectIsLogin } from "@/redux/slices/auth.slice";
import { addCartItem, openCartDrawer, selectCartItems, setCartItems, updateCartItem } from "@/redux/slices/cart.slice";
import { safeTrackAddToCartFromApiItem } from "@/lib/gtm/track-add-to-cart";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import { persistCartLines } from "@/utils/api/cart/cart-mutation.util";
import { buildPostCartLine, getCartAddLimitError, getCartApiOptions } from "@/utils/api/cart/cart.util";
import { getErrorMessage } from "@/utils/helpers/axios";
import { invalidatePendingCartSync } from "@/utils/api/cart/cart-sync-abort.util";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";

const ADD_TO_CART_ERROR_MESSAGE = "Thêm vào giỏ hàng thất bại. Vui lòng thử lại.";
const AUTH_PENDING_MESSAGE = "Vui lòng đợi trang tải xong rồi thử lại.";
const DEFAULT_ADD_TO_CART_DEBOUNCE_MS = 500;

const resolvePostCartPackagingIds = (optimisticItem?: CartViewItem) => {
  const ids = optimisticItem?.selectedPackagingRelationIds?.filter(Boolean) ?? [];
  return ids.length > 0 ? ids : undefined;
};

type CartItem = CartViewItem;

export type AddToCartSuccessParams = {
  incomingItem: CartItem;
  existingItem?: CartItem;
};

export type UseAddToCartOptions = {
  openCartDrawerOnSuccess?: boolean;
  onSuccess?: (params: AddToCartSuccessParams) => void;
  /** Default 500ms. Set 0 to POST ngay (dùng trong test). */
  debounceMs?: number;
};

export type AddToCartResult = { success: true; item: CartViewItem } | { success: false; reason: "auth-pending" | "limit" | "api" };

const useAddToCart = ({
  openCartDrawerOnSuccess = false,
  onSuccess,
  debounceMs = DEFAULT_ADD_TO_CART_DEBOUNCE_MS,
}: UseAddToCartOptions = {}) => {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector(selectIsLogin);
  const isAuthResolved = useAppSelector(selectIsAuthResolved);
  const cartItems = useAppSelector(selectCartItems);
  const snapshotByVariation = useRef<Record<string, CartViewItem[]>>({});
  const pendingItemByVariation = useRef<Record<string, CartViewItem>>({});
  const waitersByVariation = useRef<Record<string, Array<(result: AddToCartResult) => void>>>({});
  const debouncedPersistByVariation = useRef<Record<string, ReturnType<typeof debounce>>>({});
  const cartItemsRef = useRef(cartItems);

  cartItemsRef.current = cartItems;

  const flushPersist = useCallback(
    async (variationKey: string) => {
      const snapshot = snapshotByVariation.current[variationKey];
      const waiters = waitersByVariation.current[variationKey] ?? [];
      const pendingItem = pendingItemByVariation.current[variationKey];
      delete snapshotByVariation.current[variationKey];
      delete pendingItemByVariation.current[variationKey];
      delete waitersByVariation.current[variationKey];

      if (!snapshot) return;

      const existingItem = snapshot.find((item) => String(item.id) === variationKey);
      const latestItem = pendingItem ?? cartItemsRef.current.find((item) => String(item.id) === variationKey);
      const latestQuantity = latestItem?.quantity ?? 0;
      const packagingIds = latestItem?.selectedPackagingRelationIds ?? resolvePostCartPackagingIds(latestItem);

      try {
        const result = await persistCartLines(
          dispatch,
          [
            buildPostCartLine({
              variationId: variationKey,
              quantity: latestQuantity,
              selectedPackagingRelationIds: packagingIds,
            }),
          ],
          getCartApiOptions(isLogin),
        );

        if (!result.success) {
          dispatch(setCartItems(snapshot));
          toast.error(ADD_TO_CART_ERROR_MESSAGE);
          const failure = { success: false as const, reason: "api" as const };
          waiters.forEach((resolve) => resolve(failure));
          return;
        }

        const incomingItem = latestItem ?? existingItem;
        if (!incomingItem) {
          const failure = { success: false as const, reason: "api" as const };
          waiters.forEach((resolve) => resolve(failure));
          return;
        }

        const quantityAdded = latestQuantity - (existingItem?.quantity ?? 0);
        safeTrackAddToCartFromApiItem(
          {
            variationId: variationKey,
            quantity: latestQuantity,
            product: { name: incomingItem.name, slug: incomingItem.productSlug },
          } as never,
          quantityAdded > 0 ? quantityAdded : 1,
        );
        onSuccess?.({ incomingItem, existingItem });

        const success = { success: true as const, item: incomingItem };
        waiters.forEach((resolve) => resolve(success));
      } catch (error) {
        dispatch(setCartItems(snapshot));
        const message = getErrorMessage(error);
        toast.error(!message || message === "Đã xảy ra lỗi không xác định!" ? ADD_TO_CART_ERROR_MESSAGE : message);
        const failure = { success: false as const, reason: "api" as const };
        waiters.forEach((resolve) => resolve(failure));
      }
    },
    [dispatch, isLogin, onSuccess],
  );

  useEffect(() => {
    const debouncedFns = debouncedPersistByVariation.current;
    return () => {
      Object.values(debouncedFns).forEach((fn) => fn.cancel());
      debouncedPersistByVariation.current = {};
      snapshotByVariation.current = {};
      waitersByVariation.current = {};
    };
  }, []);

  const schedulePersist = useCallback(
    (variationKey: string, snapshot: CartViewItem[], nextItem: CartViewItem) => {
      if (!snapshotByVariation.current[variationKey]) {
        snapshotByVariation.current[variationKey] = snapshot;
      }
      pendingItemByVariation.current[variationKey] = nextItem;

      if (debounceMs > 0 && !debouncedPersistByVariation.current[variationKey]) {
        debouncedPersistByVariation.current[variationKey] = debounce(() => {
          void flushPersist(variationKey);
        }, debounceMs);
      }

      return new Promise<AddToCartResult>((resolve) => {
        (waitersByVariation.current[variationKey] ??= []).push(resolve);

        if (debounceMs <= 0) {
          void flushPersist(variationKey);
          return;
        }

        debouncedPersistByVariation.current[variationKey]?.();
      });
    },
    [debounceMs, flushPersist],
  );

  const handleAddToCart = useCallback(
    (variationId: string, quantity = 1, optimisticItem?: CartItem): AddToCartResult | Promise<AddToCartResult> => {
      const variationKey = String(variationId);
      const existingItem = cartItems.find((item) => String(item.id) === variationKey);
      const pendingItem = pendingItemByVariation.current[variationKey];
      const baseItem = pendingItem ?? existingItem;
      const cartAddLimitError = getCartAddLimitError(baseItem, quantity, optimisticItem);

      if (cartAddLimitError) {
        toast.warning(cartAddLimitError.toastMessage);
        return { success: false as const, reason: "limit" as const };
      }

      if (!isAuthResolved) {
        toast.warning(AUTH_PENDING_MESSAGE);
        return { success: false as const, reason: "auth-pending" as const };
      }

      invalidatePendingCartSync();

      const absoluteQuantity = (baseItem?.quantity ?? 0) + quantity;
      const selectedPackagingRelationIds = resolvePostCartPackagingIds(optimisticItem);

      const nextCartItem: CartViewItem = {
        ...(baseItem ??
          optimisticItem ?? {
            id: variationId,
            productSlug: "",
            name: "",
            image: { src: "", alt: "" },
            quantity: absoluteQuantity,
            unitPrice: 0,
            price: { current: "" },
          }),
        id: variationId,
        quantity: absoluteQuantity,
        selected: existingItem?.selected ?? optimisticItem?.selected ?? true,
        ...(selectedPackagingRelationIds ? { selectedPackagingRelationIds } : {}),
      };

      if (baseItem) {
        dispatch(updateCartItem({ ...nextCartItem, quantity: absoluteQuantity }));
      } else {
        dispatch(addCartItem(nextCartItem));
      }

      if (openCartDrawerOnSuccess) {
        dispatch(openCartDrawer());
      }

      return schedulePersist(variationKey, cartItems, nextCartItem);
    },
    [cartItems, dispatch, isAuthResolved, openCartDrawerOnSuccess, schedulePersist],
  );

  return { handleAddToCart };
};

export default useAddToCart;
