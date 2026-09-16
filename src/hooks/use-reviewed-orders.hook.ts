"use client";

import { useMemo } from "react";
import useSWR from "swr";

import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthResolved, selectIsLogin } from "@/redux/slices/auth.slice";
import { getProductReviewMyOrders } from "@/utils/api/product/product.api";
import { IS_PRODUCT_REVIEW_UI_ENABLED } from "@/utils/constants/commerce-feature.constant";

export const PRODUCT_REVIEW_MY_ORDERS_SWR_KEY = "product-review-my-orders";

const PRODUCT_REVIEW_MY_ORDERS_PARAMS = {
  orderType: "DESC" as const,
  orderBy: "updatedAt",
  isPagination: false,
};

const useReviewedOrders = () => {
  const isAuthResolved = useAppSelector(selectIsAuthResolved);
  const isLogin = useAppSelector(selectIsLogin);
  const shouldFetch = IS_PRODUCT_REVIEW_UI_ENABLED && isAuthResolved && isLogin;

  const { data, isLoading, mutate } = useSWR(shouldFetch ? PRODUCT_REVIEW_MY_ORDERS_SWR_KEY : null, () =>
    getProductReviewMyOrders(PRODUCT_REVIEW_MY_ORDERS_PARAMS),
  );

  const reviewedOrderIds = useMemo(() => new Set((data?.list ?? []).map((item) => item.orderId)), [data?.list]);

  const hasReviewedOrder = (orderId?: string | null) => {
    if (!orderId || !shouldFetch || (isLoading && !data)) {
      return undefined;
    }

    return reviewedOrderIds.has(orderId);
  };

  return {
    reviewedOrderIds,
    hasReviewedOrder,
    isLoading,
    mutate,
  };
};

export default useReviewedOrders;
