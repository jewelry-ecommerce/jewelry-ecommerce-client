"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useSWRConfig } from "swr";

import useLiveNow from "@/hooks/use-live-now.hook";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectIsAuthResolved, selectIsLogin } from "@/redux/slices/auth.slice";
import { selectCartItems, setCartItems } from "@/redux/slices/cart.slice";
import { store } from "@/redux/store";
import { safeTrackAddToCartFromQuantitySource } from "@/lib/gtm/track-add-to-cart";
import { persistCartLines } from "@/utils/api/cart/cart-mutation.util";
import {
  buildRepurchaseOptimisticCartItems,
  buildRepurchasePostItems,
  buildRepurchasePostLines,
} from "@/utils/api/cart/cart-repurchase.util";
import { getCartAddLimitError, getCartApiOptions } from "@/utils/api/cart/cart.util";
import { getOrderMeByOrderCode } from "@/utils/api/checkout/checkout.api";
import { useRetryOrderPayment } from "@/hooks/checkout/use-retry-order-payment.hook";
import { cancelClientOrderReturn } from "@/utils/api/order/order.api";
import type { OrderDetailResponse, OrderListItem, OrderStatusByOrderCodeResponse } from "@/utils/api/checkout/checkout.interface";
import { getPreOrderDetailByOrderCode } from "@/utils/api/pre-order/pre-order-detail.api";
import type { PreOrderDetailResponse } from "@/utils/api/pre-order/pre-order-detail.interface";
import { getPreOrderDetailLookupCode, isPreOrderOrder } from "@/utils/api/pre-order/pre-order-order.util";
import { PRE_ORDER_PAYMENT_ROUTE, savePreOrderPaymentDetail } from "@/utils/api/pre-order/pre-order-detail.util";
import { buildOrderReturnExchangeDetailHref } from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-routes.util";
import { getOrderDisplayState, isPaymentErrorOrder, OrderDisplayState } from "@/utils/api/order";
import { OrderStatus } from "@/utils/api/order/order.enum";
import { getErrorMessage } from "@/utils/helpers/axios";
import { LATEST_ORDER_STORAGE_KEY } from "@/hooks/checkout/checkout-storage.constants";

type OrderActionSource =
  | Pick<
      OrderListItem,
      | "id"
      | "orderCode"
      | "orderReturnCode"
      | "items"
      | "status"
      | "paymentStatus"
      | "paymentMethod"
      | "paymentLink"
      | "paymentLinkExpiresAt"
      | "paymentLinkStatus"
      | "shippingAddressSnapshot"
      | "fulfillmentType"
      | "preOrderStatus"
      | "preOrderCode"
    >
  | Pick<
      OrderDetailResponse,
      | "id"
      | "orderCode"
      | "orderReturnCode"
      | "items"
      | "status"
      | "paymentStatus"
      | "paymentMethod"
      | "paymentLink"
      | "paymentLinkExpiresAt"
      | "paymentLinkStatus"
      | "shippingAddressSnapshot"
      | "fulfillmentType"
      | "preOrderStatus"
      | "preOrderCode"
    >;

const isOrderDetailSource = (order: OrderActionSource): order is OrderDetailResponse => "statusHistory" in order && "shippingFee" in order;

const REPURCHASE_INVALID_TOAST = "Có sản phẩm trong đơn mua lại bị lỗi hoặc hết hàng";

const AUTH_PENDING_MESSAGE = "Vui lòng đợi trang tải xong rồi thử lại.";
const REPURCHASE_ERROR_MESSAGE = "Không thể thêm sản phẩm từ đơn hàng vào giỏ. Vui lòng thử lại.";

const isInvalidRepurchaseCartItem = (item: { isValid?: boolean; found?: boolean; stock?: number }) =>
  item.isValid === false || item.found === false || Number(item.stock ?? 0) <= 0;

type BaseOrderDisplaySource = Pick<
  OrderListItem,
  | "status"
  | "paymentStatus"
  | "paymentMethod"
  | "paymentFailedAt"
  | "paymentLink"
  | "paymentLinkExpiresAt"
  | "paymentLinkStatus"
  | "deliveredAt"
  | "completedAt"
  | "fulfillmentType"
  | "preOrderStatus"
  | "fulfillmentSummary"
  | "paymentHoldExpiresAt"
> &
  Partial<
    Pick<
      OrderDetailResponse,
      | "paymentMethod"
      | "paymentFailedAt"
      | "paymentLink"
      | "paymentLinkExpiresAt"
      | "paymentLinkStatus"
      | "deliveredAt"
      | "completedAt"
      | "fulfillmentType"
      | "preOrderStatus"
      | "fulfillmentSummary"
      | "paymentHoldExpiresAt"
      | "orderExpiresAt"
      | "orderRemainingSeconds"
      | "paymentRetryCount"
      | "maxPaymentRetries"
      | "displayState"
    >
  >;

type RealtimePaymentStatus = Pick<
  OrderStatusByOrderCodeResponse,
  | "orderStatus"
  | "paymentStatus"
  | "paymentLink"
  | "paymentLinkExpiresAt"
  | "paymentLinkStatus"
  | "orderExpiresAt"
  | "orderRemainingSeconds"
  | "paymentRetryCount"
  | "maxPaymentRetries"
  | "displayState"
>;

type ResolvedOrder<TOrder extends BaseOrderDisplaySource> = TOrder & {
  status: TOrder["status"];
  paymentStatus: TOrder["paymentStatus"];
  paymentLink: TOrder["paymentLink"];
  paymentLinkExpiresAt: TOrder["paymentLinkExpiresAt"];
  paymentLinkStatus: TOrder["paymentLinkStatus"];
  paymentFailedAt: TOrder["paymentFailedAt"];
  orderExpiresAt?: OrderStatusByOrderCodeResponse["orderExpiresAt"];
  orderRemainingSeconds?: OrderStatusByOrderCodeResponse["orderRemainingSeconds"];
  paymentRetryCount?: OrderStatusByOrderCodeResponse["paymentRetryCount"];
  maxPaymentRetries?: OrderStatusByOrderCodeResponse["maxPaymentRetries"];
  displayState?: OrderStatusByOrderCodeResponse["displayState"];
};

type UseOrderActionsOptions = {
  onSuccess?: () => void | Promise<void>;
  /** Query string giữ ngữ cảnh (tracking, v.v.) khi mở chi tiết yêu cầu đổi/trả. */
  returnDetailSearchQuery?: string;
  onRequestReturn?: (order: OrderActionSource) => void;
  onRequestCancelReturnExchange?: (order: OrderActionSource) => void;
  onRequestCancelOrder?: (order: OrderActionSource) => void;
};

const AUTO_REDIRECT_QUERY_KEY = "redirect";

export type LatestOrderSnapshot = {
  orderCode?: string;
  phone?: string;
  paymentUrl?: string;
  sessionId?: string;
  paymentMethod?: string;
  status?: string;
  guestOrderAccessToken?: string;
  guestOrderAccessExpiresAt?: string;
  timestamp?: number;
};

export const readLatestOrderSnapshot = (): LatestOrderSnapshot | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(LATEST_ORDER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LatestOrderSnapshot;
  } catch {
    return null;
  }
};

export const persistLatestOrderSnapshot = (partialSnapshot: Partial<LatestOrderSnapshot>) => {
  if (typeof window === "undefined") return;

  try {
    const existingSnapshot = readLatestOrderSnapshot() || {};
    sessionStorage.setItem(
      LATEST_ORDER_STORAGE_KEY,
      JSON.stringify({
        ...existingSnapshot,
        ...partialSnapshot,
      }),
    );
  } catch (e) {
    console.log(e);
  }
};

export const buildPendingPaymentUrl = (orderCode: string, autoRedirect: boolean = false) => {
  if (orderCode.trim()) {
    persistLatestOrderSnapshot({ orderCode: orderCode.trim() });
  }

  const searchParams = new URLSearchParams({
    status: "pending",
  });

  if (autoRedirect) {
    searchParams.set(AUTO_REDIRECT_QUERY_KEY, "1");
  }

  return `/trang-thai-thanh-toan?${searchParams.toString()}`;
};

export const isPendingPaymentAutoRedirect = (redirectValue?: string | null) => redirectValue === "1";

export const clearPendingPaymentAutoRedirect = (currentHref: string) => {
  if (typeof window === "undefined") return;

  const nextUrl = new URL(currentHref);
  nextUrl.searchParams.delete(AUTO_REDIRECT_QUERY_KEY);
  window.history.replaceState(window.history.state, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
};

export function useOrderDisplay<TOrder extends BaseOrderDisplaySource>(
  order: TOrder,
  realtimePaymentStatus?: RealtimePaymentStatus,
  hasReviewedOrder?: boolean,
): { resolvedOrder: ResolvedOrder<TOrder>; displayState: OrderDisplayState };
export function useOrderDisplay<TOrder extends BaseOrderDisplaySource>(
  order: TOrder | null | undefined,
  realtimePaymentStatus?: RealtimePaymentStatus,
  hasReviewedOrder?: boolean,
): { resolvedOrder: ResolvedOrder<TOrder> | null; displayState: OrderDisplayState | null };
export function useOrderDisplay<TOrder extends BaseOrderDisplaySource>(
  order: TOrder | null | undefined,
  realtimePaymentStatus?: RealtimePaymentStatus,
  hasReviewedOrder?: boolean,
): { resolvedOrder: ResolvedOrder<TOrder> | null; displayState: OrderDisplayState | null } {
  const paymentFailedAtFallbackRef = useRef<string | null>(order?.paymentFailedAt ?? null);

  const resolvedOrder = useMemo<ResolvedOrder<TOrder> | null>(() => {
    if (!order) return null;

    const shouldApplyRealtimeOrderStatus = order.status === OrderStatus.PENDING && Boolean(realtimePaymentStatus?.orderStatus);
    const status = shouldApplyRealtimeOrderStatus ? realtimePaymentStatus!.orderStatus : order.status;
    const paymentStatus = realtimePaymentStatus?.paymentStatus ?? order.paymentStatus;
    const paymentFailedAtFallback = paymentFailedAtFallbackRef.current ?? (paymentFailedAtFallbackRef.current = new Date().toISOString());

    return {
      ...order,
      status,
      paymentStatus,
      paymentLink: realtimePaymentStatus?.paymentLink ?? order.paymentLink,
      paymentLinkExpiresAt: realtimePaymentStatus?.paymentLinkExpiresAt ?? order.paymentLinkExpiresAt,
      paymentLinkStatus: realtimePaymentStatus?.paymentLinkStatus ?? order.paymentLinkStatus,
      // Không wipe field từ order/guest-access khi chưa có realtime poll.
      orderExpiresAt: realtimePaymentStatus?.orderExpiresAt ?? order.orderExpiresAt ?? undefined,
      orderRemainingSeconds: realtimePaymentStatus?.orderRemainingSeconds ?? order.orderRemainingSeconds ?? undefined,
      paymentRetryCount: realtimePaymentStatus?.paymentRetryCount ?? order.paymentRetryCount ?? undefined,
      maxPaymentRetries: realtimePaymentStatus?.maxPaymentRetries ?? order.maxPaymentRetries ?? undefined,
      displayState: realtimePaymentStatus?.displayState ?? order.displayState ?? undefined,
      paymentFailedAt:
        order.paymentFailedAt ?? (isPaymentErrorOrder({ status, paymentStatus }) ? paymentFailedAtFallback : order.paymentFailedAt),
    };
  }, [order, realtimePaymentStatus]);

  const now = useLiveNow(
    Boolean(resolvedOrder?.paymentLinkExpiresAt) ||
      Boolean(resolvedOrder?.orderExpiresAt) ||
      Boolean(resolvedOrder?.paymentHoldExpiresAt) ||
      typeof resolvedOrder?.orderRemainingSeconds === "number" ||
      Boolean(resolvedOrder && isPaymentErrorOrder(resolvedOrder)),
  );
  const displayState = resolvedOrder ? getOrderDisplayState(resolvedOrder, now, hasReviewedOrder) : null;

  return {
    resolvedOrder,
    displayState,
  };
}

const useOrderActions = ({
  onSuccess,
  returnDetailSearchQuery,
  onRequestReturn,
  onRequestCancelReturnExchange,
  onRequestCancelOrder,
}: UseOrderActionsOptions = {}) => {
  const router = useRouter();
  const { retryPaymentSession, payooLoadingOpen, closePayooLoading } = useRetryOrderPayment();
  const { mutate: mutateSwr } = useSWRConfig();
  const dispatch = useAppDispatch();
  const isAuthResolved = useAppSelector(selectIsAuthResolved);
  const isLogin = useAppSelector(selectIsLogin);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [reviewOrder, setReviewOrder] = useState<OrderDetailResponse | null>(null);
  const [reviewDialogMode, setReviewDialogMode] = useState<"create" | "view" | null>(null);

  const handlePayment = useCallback(
    async (order: OrderActionSource) => {
      const lookupCode = getPreOrderDetailLookupCode(order);
      if (!lookupCode) {
        toast.error("Không tìm thấy mã đơn hàng.");
        return;
      }

      // Pre-order lần 2: đẩy data chi tiết sang trang riêng (không gọi checkout/initiate).
      if (isPreOrderOrder(order)) {
        setLoadingAction("PAYMENT");
        try {
          const detail: PreOrderDetailResponse = isOrderDetailSource(order)
            ? {
                ...(order as OrderDetailResponse),
                orderCode: lookupCode,
                fulfillmentType: "PRE_ORDER",
              }
            : await getPreOrderDetailByOrderCode(lookupCode);

          if (!detail?.orderCode?.trim() && !detail?.preOrderCode?.trim()) {
            toast.error("Không tải được thông tin đơn đặt trước. Vui lòng thử lại.");
            return;
          }

          const detailCode = detail.orderCode?.trim() || detail.preOrderCode?.trim() || lookupCode;

          // Ghi đè snapshot đơn trước (kể cả Payoo còn paymentUrl) bằng đơn pre-order đang thanh toán.
          // Không đụng guestOrderAccessToken — sau /pay sẽ ghi goa_ (hoặc giữ token hiện có).
          persistLatestOrderSnapshot({
            orderCode: detailCode,
            phone: detail.shippingAddressSnapshot?.receiverPhone || "",
            paymentUrl: "",
            paymentMethod: "",
            status: "",
            sessionId: "",
            timestamp: Date.now(),
          });
          savePreOrderPaymentDetail({ ...detail, orderCode: detailCode });
          router.push(PRE_ORDER_PAYMENT_ROUTE);
          await onSuccess?.();
        } catch (error) {
          toast.error(getErrorMessage(error) || "Không thể mở trang thanh toán. Vui lòng thử lại.");
        } finally {
          setLoadingAction(null);
        }
        return;
      }

      if (!order.orderCode?.trim()) {
        toast.error("Không tìm thấy mã đơn hàng.");
        return;
      }

      if (!order.paymentMethod?.trim()) {
        toast.error("Không xác định được phương thức thanh toán.");
        return;
      }

      setLoadingAction("PAYMENT");

      try {
        await retryPaymentSession({
          orderCode: order.orderCode,
          paymentMethod: order.paymentMethod,
          receiverPhone: order.shippingAddressSnapshot?.receiverPhone || "",
        });
        await onSuccess?.();
      } catch {
        // Toast / redirect handled in useRetryOrderPayment
      } finally {
        setLoadingAction(null);
      }
    },
    [onSuccess, retryPaymentSession, router],
  );

  const handleRepurchase = useCallback(
    async (order: OrderActionSource) => {
      setLoadingAction("REPURCHASE");

      const redirectToCart = () => router.push("/gio-hang");
      let cartSnapshot = selectCartItems(store.getState());

      try {
        if (!isAuthResolved) {
          toast.warning(AUTH_PENDING_MESSAGE);
          return;
        }

        const orderLines = buildRepurchasePostItems(order.items);

        if (orderLines.length === 0) {
          toast.error(REPURCHASE_INVALID_TOAST);
          redirectToCart();
          return;
        }

        const cartItems = selectCartItems(store.getState());
        const optimisticItems = buildRepurchaseOptimisticCartItems(order.items, cartItems);

        for (const line of orderLines) {
          const existingItem = cartItems.find((item) => String(item.id) === String(line.variationId));
          const optimisticItem = optimisticItems.find((item) => String(item.id) === String(line.variationId));
          const cartAddLimitError = getCartAddLimitError(existingItem, line.quantity, optimisticItem);

          if (cartAddLimitError) {
            toast.warning(cartAddLimitError.toastMessage);
            return;
          }
        }

        cartSnapshot = cartItems;
        const optimisticMap = new Map(optimisticItems.map((item) => [String(item.id), item]));
        const nextCart = cartItems.map((item) => optimisticMap.get(String(item.id)) ?? item);

        for (const item of optimisticItems) {
          if (!cartItems.some((cartItem) => String(cartItem.id) === String(item.id))) {
            nextCart.push(item);
          }
        }

        dispatch(setCartItems(nextCart));

        const postLines = buildRepurchasePostLines(order.items, cartSnapshot);
        const result = await persistCartLines(dispatch, postLines, getCartApiOptions(isLogin));

        if (!result.success || !result.postResponse.items?.length) {
          dispatch(setCartItems(cartSnapshot));
          toast.error(REPURCHASE_INVALID_TOAST);
          redirectToCart();
          return;
        }

        const postedVariationIds = new Set(orderLines.map((line) => String(line.variationId)));
        const hasInvalidItem = result.postResponse.items
          .filter((item) => postedVariationIds.has(String(item.variationId ?? item.id)))
          .some(isInvalidRepurchaseCartItem);
        const syncedCartItems = selectCartItems(store.getState());

        for (const line of orderLines) {
          const incomingItem = syncedCartItems.find((item) => String(item.id) === String(line.variationId));
          if (!incomingItem) continue;

          safeTrackAddToCartFromQuantitySource(
            {
              id: String(line.variationId),
              variationId: line.variationId,
              name: incomingItem.name,
              unitPrice: incomingItem.unitPrice,
            },
            line.quantity,
          );
        }

        await onSuccess?.();

        if (hasInvalidItem) {
          toast.error(REPURCHASE_INVALID_TOAST);
        }

        redirectToCart();
      } catch (error) {
        dispatch(setCartItems(cartSnapshot));
        toast.error(getErrorMessage(error) || REPURCHASE_ERROR_MESSAGE);
        redirectToCart();
      } finally {
        setLoadingAction(null);
      }
    },
    [dispatch, isAuthResolved, isLogin, onSuccess, router],
  );

  const openReviewDialog = useCallback(async (mode: "create" | "view", order: OrderActionSource) => {
    setLoadingAction(mode === "create" ? "WRITE_REVIEW" : "VIEW_REVIEW");

    try {
      const detailedOrder = isOrderDetailSource(order) ? order : await getOrderMeByOrderCode(order.orderCode);

      setReviewOrder(detailedOrder);
      setReviewDialogMode(mode);
    } catch {
      toast.error(
        mode === "create"
          ? "Không thể mở form đánh giá sản phẩm. Vui lòng thử lại sau."
          : "Không thể mở danh sách đánh giá sản phẩm. Vui lòng thử lại sau.",
      );
    } finally {
      setLoadingAction(null);
    }
  }, []);

  const handleWriteReview = useCallback(
    async (order: OrderActionSource) => {
      await openReviewDialog("create", order);
    },
    [openReviewDialog],
  );

  const handleViewReview = useCallback(
    async (order: OrderActionSource) => {
      await openReviewDialog("view", order);
    },
    [openReviewDialog],
  );

  const handleViewReturnExchange = useCallback(
    (order: OrderActionSource) => {
      router.push(buildOrderReturnExchangeDetailHref(order.orderCode, returnDetailSearchQuery, order.orderReturnCode));
    },
    [returnDetailSearchQuery, router],
  );

  const handleCancelReturnExchange = useCallback(
    async (order: OrderActionSource) => {
      const returnCode = order.orderReturnCode?.trim();
      if (!returnCode) {
        toast.error("Không tìm thấy mã yêu cầu đổi / trả.");
        return;
      }

      if (onRequestCancelReturnExchange) {
        onRequestCancelReturnExchange(order);
        return;
      }

      setLoadingAction("WAITING_RETURN_EXCHANGE");
      try {
        await cancelClientOrderReturn(returnCode);
        toast.success("Đã hủy yêu cầu đổi / trả");

        await mutateSwr(
          (key) => {
            if (typeof key === "string") return key.startsWith(`order/${order.orderCode}`);
            if (!Array.isArray(key)) return false;
            if (key[0] === "orders-me" || key[0] === "orders-me-infinite") return true;
            if (key[0] === "order-return-detail") {
              const code = key[1];
              return code === returnCode || code === order.orderCode;
            }
            return false;
          },
          undefined,
          { revalidate: true },
        );

        await onSuccess?.();
      } catch (err) {
        toast.error(getErrorMessage(err) || "Không thể hủy yêu cầu. Vui lòng thử lại.");
      } finally {
        setLoadingAction(null);
      }
    },
    [mutateSwr, onRequestCancelReturnExchange, onSuccess],
  );

  const handleCancelOrder = useCallback(
    async (order: OrderActionSource) => {
      // Guest detail không có `id` — chỉ cần orderCode; callback sẽ fallback id ← orderCode.
      if (onRequestCancelOrder) {
        const orderCode = getPreOrderDetailLookupCode(order);
        if (!order.id?.trim() && !orderCode) {
          toast.error("Không tìm thấy thông tin đơn hàng.");
          return;
        }
        onRequestCancelOrder(order);
        return;
      }

      const orderId = order.id?.trim();
      if (!orderId) {
        toast.error("Không tìm thấy thông tin đơn hàng.");
        return;
      }

      toast.warning("Vui lòng chọn lý do hủy đơn hàng.");
    },
    [onRequestCancelOrder],
  );

  const handleReturn = useCallback(
    (order: OrderActionSource) => {
      if (onRequestReturn) {
        onRequestReturn(order);
        return;
      }

      toast.info("Chức năng trả hàng đang được hoàn thiện");
    },
    [onRequestReturn],
  );

  const handleUnsupportedAction = useCallback((actionType: string) => {
    if (actionType === "COMPLETE") {
      toast.info("Chức năng hoàn tất đơn đang được hoàn thiện");
      return;
    }

    toast.info(`Chức năng ${actionType.toLowerCase()} đang được hoàn thiện`);
  }, []);

  const handleOrderAction = useCallback(
    async (actionType: string, order: OrderActionSource) => {
      if (loadingAction) return;

      switch (actionType) {
        case "PAYMENT":
          await handlePayment(order);
          return;
        case "WRITE_REVIEW":
          await handleWriteReview(order);
          return;
        case "VIEW_REVIEW":
          await handleViewReview(order);
          return;
        case "REPURCHASE":
          await handleRepurchase(order);
          return;
        case "VIEW_RETURN_EXCHANGE":
          handleViewReturnExchange(order);
          return;
        case "WAITING_RETURN_EXCHANGE":
          await handleCancelReturnExchange(order);
          return;
        case "CANCEL":
          await handleCancelOrder(order);
          return;
        case "RETURN":
          handleReturn(order);
          return;
        default:
          handleUnsupportedAction(actionType);
      }
    },
    [
      handleCancelOrder,
      handleCancelReturnExchange,
      handlePayment,
      handleRepurchase,
      handleReturn,
      handleUnsupportedAction,
      handleViewReturnExchange,
      handleViewReview,
      handleWriteReview,
      loadingAction,
    ],
  );

  const isProcessing = useMemo(
    () => ({
      payment: loadingAction === "PAYMENT",
      repurchase: loadingAction === "REPURCHASE",
      any: loadingAction !== null,
    }),
    [loadingAction],
  );

  return {
    handleOrderAction,
    loadingAction,
    isProcessing,
    payooLoadingOpen,
    closePayooLoading,
    reviewOrder,
    reviewDialogMode,
    isCreateReviewDialogOpen: reviewDialogMode === "create" && Boolean(reviewOrder),
    isViewReviewDialogOpen: reviewDialogMode === "view" && Boolean(reviewOrder),
    closeReviewDialog: () => {
      setReviewDialogMode(null);
      setReviewOrder(null);
    },
  };
};

export default useOrderActions;
