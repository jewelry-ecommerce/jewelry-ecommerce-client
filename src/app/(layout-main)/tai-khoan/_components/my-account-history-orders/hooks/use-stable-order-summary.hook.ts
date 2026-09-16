"use client";

import { useEffect, useRef, useState } from "react";

import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/slices/auth.slice";
import type { OrderListSummary } from "@/utils/api/checkout/checkout.interface";

import { areOrderSummariesEqual } from "../_utils/order-summary.util";

/**
 * Giữ summary badge ổn định lần đầu load; chỉ cập nhật khi response mới khác DB (tránh giật tab bar).
 * Reset khi đổi user hoặc search để không giữ badge của tài khoản / bộ lọc trước.
 */
export function useStableOrderSummary(liveSummary: OrderListSummary | undefined, search: string) {
  const userId = useAppSelector(selectCurrentUser)?.id;
  const [stableSummary, setStableSummary] = useState<OrderListSummary | undefined>();
  const searchRef = useRef(search.trim());
  const userIdRef = useRef(userId);

  useEffect(() => {
    const normalizedSearch = search.trim();
    const didSearchChange = searchRef.current !== normalizedSearch;
    const didUserChange = userIdRef.current !== userId;

    if (!didSearchChange && !didUserChange) return;

    searchRef.current = normalizedSearch;
    userIdRef.current = userId;
    setStableSummary(undefined);
  }, [search, userId]);

  useEffect(() => {
    if (!liveSummary) return;

    setStableSummary((previous) => {
      if (!previous) return liveSummary;
      if (areOrderSummariesEqual(previous, liveSummary)) return previous;
      return liveSummary;
    });
  }, [liveSummary]);

  return stableSummary;
}
