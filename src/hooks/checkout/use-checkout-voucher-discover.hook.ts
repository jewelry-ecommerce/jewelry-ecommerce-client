import { useEffect, useMemo, useRef, useState } from "react";
import { serializePromotionVoucherCheckoutContext } from "@/app/(layout-focus)/thanh-toan/_components/checkout-voucher/checkout-voucher.mapper";
import { PromotionApi } from "@/utils/api";
import type { DiscoverPromotionVouchersRequest, PromotionVoucherSection } from "@/utils/api/promotion/promotion.interface";

const VOUCHER_DISCOVER_DEBOUNCE_MS = 400;

interface UseCheckoutVoucherDiscoverOptions {
  /**
   * `false` khi đang PUT pricing-context (hoặc chờ sync coupon).
   * Discover chỉ chạy sau khi pricing-context sẵn sàng / vừa xong.
   */
  isPricingContextReady?: boolean;
}

interface UseCheckoutVoucherDiscoverResult {
  sections: PromotionVoucherSection[];
  /** Chỉ true lần tải đầu khi chưa có danh sách — không chặn UI khi refresh. */
  isLoading: boolean;
  /** Đang cập nhật nền sau khi đổi voucher/context. */
  isRefreshing: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCheckoutVoucherDiscover(
  isOpen: boolean,
  checkoutContext?: DiscoverPromotionVouchersRequest["checkoutContext"],
  options?: UseCheckoutVoucherDiscoverOptions,
): UseCheckoutVoucherDiscoverResult {
  const isPricingContextReady = options?.isPricingContextReady ?? true;
  const [sections, setSections] = useState<PromotionVoucherSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);
  const requestIdRef = useRef(0);
  const sectionsRef = useRef(sections);
  const lastCheckoutSessionIdRef = useRef<string | null>(null);
  const lastFetchedContextKeyRef = useRef<string | null>(null);
  const lastFetchKeyRef = useRef(0);
  const wasPricingContextBlockedRef = useRef(false);

  sectionsRef.current = sections;

  const checkoutContextKey = useMemo(() => serializePromotionVoucherCheckoutContext(checkoutContext), [checkoutContext]);

  const checkoutSessionId = checkoutContext?.cart?.checkoutSessionId ?? null;

  useEffect(() => {
    const previousSessionId = lastCheckoutSessionIdRef.current;
    if (checkoutSessionId === previousSessionId) return;

    lastCheckoutSessionIdRef.current = checkoutSessionId;

    if (previousSessionId !== null) {
      setSections([]);
      setError(null);
      lastFetchedContextKeyRef.current = null;
      lastFetchKeyRef.current = 0;
    }
  }, [checkoutSessionId]);

  useEffect(() => {
    if (!isOpen) return;
    if (!checkoutSessionId) return;

    if (!isPricingContextReady) {
      wasPricingContextBlockedRef.current = true;
      if (sectionsRef.current.length > 0) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      return;
    }

    const pricingContextJustBecameReady = wasPricingContextBlockedRef.current;
    wasPricingContextBlockedRef.current = false;

    const hasCachedSections = sectionsRef.current.length > 0;
    const contextUnchanged = lastFetchedContextKeyRef.current === checkoutContextKey;
    const fetchKeyUnchanged = lastFetchKeyRef.current === fetchKey;

    if (hasCachedSections && contextUnchanged && fetchKeyUnchanged && !pricingContextJustBecameReady) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    const shouldDebounce = hasCachedSections && !contextUnchanged && !pricingContextJustBecameReady;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;

    const fetchVouchers = () => {
      const requestId = ++requestIdRef.current;
      const hadCachedSections = sectionsRef.current.length > 0;

      const run = async () => {
        if (!hadCachedSections) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }
        setError(null);

        try {
          const response = await PromotionApi.discoverPromotionVouchers(checkoutSessionId);

          if (requestId !== requestIdRef.current) return;

          setSections(response.sections ?? []);
          lastFetchedContextKeyRef.current = checkoutContextKey;
          lastFetchKeyRef.current = fetchKey;
        } catch {
          if (requestId !== requestIdRef.current) return;

          if (!hadCachedSections) {
            setError("Không thể tải danh sách voucher. Vui lòng thử lại.");
            setSections([]);
          }
        } finally {
          if (requestId !== requestIdRef.current) return;

          setIsLoading(false);
          setIsRefreshing(false);
        }
      };

      void run();
    };

    if (shouldDebounce) {
      setIsRefreshing(true);
      debounceTimer = setTimeout(fetchVouchers, VOUCHER_DISCOVER_DEBOUNCE_MS);
    } else {
      fetchVouchers();
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        setIsRefreshing(false);
      }
      requestIdRef.current += 1;
    };
  }, [isOpen, fetchKey, checkoutContextKey, checkoutSessionId, isPricingContextReady]);

  const refetch = () => setFetchKey((key) => key + 1);

  return { sections, isLoading, isRefreshing, error, refetch };
}
