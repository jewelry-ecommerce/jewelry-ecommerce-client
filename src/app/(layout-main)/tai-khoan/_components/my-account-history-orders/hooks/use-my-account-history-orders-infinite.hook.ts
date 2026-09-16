"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import useSWRInfinite from "swr/infinite";

import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/slices/auth.slice";
import { getOrdersMe } from "@/utils/api/checkout/checkout.api";
import type { OrderListItem, OrderListResponse, OrderListSummary } from "@/utils/api/checkout/checkout.interface";
import { isPreOrderVisibleInHistoryTab } from "@/utils/api/pre-order/pre-order-order.util";

import type { OrderHistoryTabConfig } from "../_constants/order-history-tabs.constant";

export const ORDER_HISTORY_PAGE_SIZE = 10;
/** Trong TTL giữ cache; hết TTL vào lại tab → GET 1 lần. */
export const ORDER_HISTORY_CACHE_TTL_MS = 30_000;

const lastFetchedAt = new Map<string, number>();

type UseMyAccountHistoryOrdersInfiniteParams = {
  search: string;
  tab: OrderHistoryTabConfig;
};

export function useMyAccountHistoryOrdersInfinite({ search, tab }: UseMyAccountHistoryOrdersInfiniteParams) {
  const userId = useAppSelector(selectCurrentUser)?.id;
  const searchQuery = search.trim() || undefined;
  const cacheKey = `${userId ?? ""}:${tab.id}:${searchQuery ?? ""}`;
  const lastAt = lastFetchedAt.get(cacheKey);
  const isFresh = lastAt != null && Date.now() - lastAt < ORDER_HISTORY_CACHE_TTL_MS;
  const prevSearchRef = useRef(searchQuery);

  const listKeyPrefix = useMemo(
    () => ({
      tabId: tab.id,
      orderType: "DESC" as const,
      orderBy: "updatedAt",
      search: searchQuery,
      status: tab.filterStatus,
      fulfillmentType: tab.fulfillmentType,
    }),
    [tab.id, tab.filterStatus, tab.fulfillmentType, searchQuery],
  );

  const { data, error, size, setSize, isLoading, isValidating, mutate } = useSWRInfinite(
    (pageIndex, previousPageData: OrderListResponse | null) => {
      if (!userId) return null;
      if (previousPageData) {
        if (previousPageData.list.length < ORDER_HISTORY_PAGE_SIZE) return null;
        if (pageIndex * ORDER_HISTORY_PAGE_SIZE >= previousPageData.total) return null;
      }
      return ["orders-me-infinite", userId, listKeyPrefix, pageIndex + 1] as const;
    },
    async ([, , params, page]) => {
      const result = await getOrdersMe({
        orderType: params.orderType,
        orderBy: params.orderBy,
        search: params.search,
        status: params.status,
        fulfillmentType: params.fulfillmentType,
        page,
        take: ORDER_HISTORY_PAGE_SIZE,
      });
      lastFetchedAt.set(`${userId ?? ""}:${params.tabId}:${params.search ?? ""}`, Date.now());
      return result;
    },
    {
      revalidateFirstPage: false,
      revalidateIfStale: false,
      // Lần đầu: mount fetch. Vào lại sau TTL: mutate ở effect (tránh double).
      revalidateOnMount: lastAt == null,
      shouldRetryOnError: false,
    },
  );

  if (prevSearchRef.current !== searchQuery) {
    prevSearchRef.current = searchQuery;
    if (size > 1) setSize(1);
  }

  useEffect(() => {
    if (!userId || isFresh || lastAt == null) return;
    void mutate();
  }, [cacheKey, userId, isFresh, lastAt, mutate]);

  const orders = useMemo(() => {
    const merged: OrderListItem[] = [];
    const seen = new Set<string>();
    const isPreOrderTab = tab.fulfillmentType === "PRE_ORDER";

    for (const page of data ?? []) {
      for (const order of page.list) {
        if (seen.has(order.id)) continue;
        if (isPreOrderTab && !isPreOrderVisibleInHistoryTab(order.preOrderStatus)) continue;
        seen.add(order.id);
        merged.push(order);
      }
    }

    return merged;
  }, [data, tab.fulfillmentType]);

  const summary: OrderListSummary | undefined = data?.[0]?.summary;
  const total = data?.[0]?.total ?? 0;
  const loadedPageCount = data?.length ?? 0;
  const lastPage = data?.[loadedPageCount - 1];
  const isLoadingMore = size > loadedPageCount;
  const hasMore = Boolean(
    !error && lastPage && lastPage.list.length >= ORDER_HISTORY_PAGE_SIZE && loadedPageCount * ORDER_HISTORY_PAGE_SIZE < total,
  );

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setSize((current) => current + 1);
  }, [hasMore, isLoadingMore, setSize]);

  return {
    orders,
    summary,
    hasMore,
    isInitialLoading: !data && (isLoading || isValidating),
    isLoadingMore,
    loadMore,
    mutate,
    error,
  };
}
