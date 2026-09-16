import { useEffect, useMemo, useState } from "react";
import { CartApi } from "@/utils/api";
import { CartCalculateTotalItem, CartCalculateTotalResponse, CartSetViewItem, CartViewItem } from "@/utils/api/cart/cart.interface";
import { getCartApiOptions, isCartItemCheckoutEligible, isCartSetViewItem } from "@/utils/api/cart/cart.util";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import { selectCartItems, selectCartLoading, selectCartWritePending, setCartSummary } from "@/redux/slices/cart.slice";

export type UseCartSummaryParams = {
  enabled?: boolean;
  debounceMs?: number;
  shouldUpdateRedux?: boolean;
};

const defaultSummary: CartCalculateTotalResponse = {
  subTotal: 0,
  discountTotal: 0,
  discounts: [],
  shippingFee: 0,
  totalAmount: 0,
  rewardPoints: 0,
};

const getSelectedPackagingRelationIds = (item: CartViewItem) => item.selectedPackagingRelationIds?.filter(Boolean) ?? [];

const mapProductToCalculateItem = (item: CartViewItem): CartCalculateTotalItem => {
  const selectedPackagingRelationIds = getSelectedPackagingRelationIds(item);
  return {
    variationId: String(item.id),
    quantity: item.quantity,
    ...(selectedPackagingRelationIds.length ? { selectedPackagingRelationIds } : {}),
  };
};

// set term
const mapSetToCalculateItem = (item: CartSetViewItem): CartCalculateTotalItem => {
  const selectedPackagingRelationIds = getSelectedPackagingRelationIds(item);
  return {
    setId: item.setId,
    quantity: item.quantity,
    setComponents: item.setComponents.map((component) => ({
      setItemId: component.setItemId,
      variationId: String(component.variationId ?? component.id),
    })),
    ...(selectedPackagingRelationIds.length ? { selectedPackagingRelationIds } : {}),
  };
};

const createCalculateItemKey = (item: CartCalculateTotalItem) =>
  "setId" in item
    ? `set:${item.setId}:${item.quantity}:${item.setComponents.map((component) => `${component.setItemId ?? ""}:${component.variationId}`).join(",")}`
    : `product:${item.variationId}:${item.quantity}:${(item.selectedPackagingRelationIds ?? []).join(",")}`;

const useCartSummary = ({ enabled = true, debounceMs = 500, shouldUpdateRedux = true }: UseCartSummaryParams = {}) => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const isLogin = useAppSelector(selectIsLogin);
  const cartLoading = useAppSelector(selectCartLoading);
  const isWritePending = useAppSelector(selectCartWritePending);
  const [summary, setSummary] = useState<CartCalculateTotalResponse | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  /** selectedItemsKey that the current `summary` (or failed attempt) belongs to */
  const [resolvedItemsKey, setResolvedItemsKey] = useState<string | null>(null);

  useEffect(() => {
    if (shouldUpdateRedux && summary) {
      dispatch(setCartSummary(summary));
    }
  }, [summary, shouldUpdateRedux, dispatch]);

  const selectedCheckoutEligibleItems = useMemo(() => items.filter((item) => item.selected && isCartItemCheckoutEligible(item)), [items]);

  const selectedItems = useMemo(
    () =>
      selectedCheckoutEligibleItems.map((item) =>
        isCartSetViewItem(item) ? mapSetToCalculateItem(item) : mapProductToCalculateItem(item),
      ),
    [selectedCheckoutEligibleItems],
  );

  const selectedItemsKey = useMemo(() => selectedItems.map(createCalculateItemKey).join("|"), [selectedItems]);

  // Caller should pass enabled after first cart sync. Then wait for GET/write flush: post → get → calculate.
  const canCalculate = enabled && !cartLoading && !isWritePending;

  // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedItems captured with selectedItemsKey
  useEffect(() => {
    if (!canCalculate || selectedItems.length === 0) {
      if (!enabled || selectedItems.length === 0) {
        setSummary(null);
        setResolvedItemsKey(null);
        setError(null);
      }
      setIsFetching(false);
      return;
    }

    let cancelled = false;
    const cartApiOptions = getCartApiOptions(isLogin);
    const itemsForRequest = selectedItems;
    const keyForRequest = selectedItemsKey;
    const timer = window.setTimeout(async () => {
      setIsFetching(true);
      setError(null);
      try {
        const response = await CartApi.calculateCartTotal(
          {
            items: itemsForRequest,
          },
          cartApiOptions,
        );
        if (!cancelled) {
          setSummary(response);
          setResolvedItemsKey(keyForRequest);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setSummary(null);
          setResolvedItemsKey(keyForRequest);
        }
      } finally {
        if (!cancelled) {
          setIsFetching(false);
        }
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [selectedItemsKey, canCalculate, debounceMs, isLogin]);

  const needsSummary = canCalculate && selectedItems.length > 0;
  const isCartBusy = cartLoading || isWritePending;
  const isLoading =
    (enabled && isCartBusy && selectedItems.length > 0) || (needsSummary && (resolvedItemsKey !== selectedItemsKey || isFetching));

  return {
    summary: summary ?? defaultSummary,
    isLoading,
    error,
  };
};

export default useCartSummary;
