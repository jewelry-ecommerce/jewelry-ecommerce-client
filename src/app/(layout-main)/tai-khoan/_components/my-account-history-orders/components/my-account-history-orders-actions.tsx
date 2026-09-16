import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { StackRowJustEnd } from "@/components/styled/stack.style";
import useSWR from "swr";
import OrderActionDialogs from "@/components/order/order-action-dialogs/order-action-dialogs.component";
import { useOrderReturnCancelConfirm } from "@/app/(layout-main)/don-hang/chi-tiet/_hooks/use-order-return-cancel-confirm.hook";
import { useOrderCancelConfirm } from "@/hooks/use-order-cancel-confirm.hook";
import useOrderActions, { useOrderDisplay } from "@/hooks/use-order-actions.hook";
import { useOrderReturnRequestNavigation } from "@/hooks/order/use-order-return-request-navigation.hook";
import useReviewedOrders from "@/hooks/use-reviewed-orders.hook";
import { getOrderStatusByOrderCode } from "@/utils/api/checkout/checkout.api";
import { OrderListItem } from "@/utils/api/checkout/checkout.interface";
import { OrderStatus, PaymentMethod, PaymentStatus, type OrderCancellationReason } from "@/utils/api/order/order.enum";
import { isPaymentErrorOrder, ORDER_DISPLAY_ACTION_LABELS, OrderDisplayActionType } from "@/utils/api/order";
import { getPreOrderDetailLookupCode, isPreOrderOrder } from "@/utils/api/pre-order/pre-order-order.util";
import { PRE_ORDER_EXPECTED_STOCK_LABEL } from "@/utils/constants/pre-order-badge.constant";

const PAYMENT_STATUS_LOOKUP_WINDOW_MS = 30 * 60 * 1000;

const LIST_ACTION_VARIANT: Record<OrderDisplayActionType, "contained" | "outlined"> = {
  PAYMENT: "contained",
  CANCEL: "outlined",
  COMPLETE: "contained",
  WRITE_REVIEW: "contained",
  VIEW_REVIEW: "outlined",
  REPURCHASE: "outlined",
  RETURN: "outlined",
  VIEW_RETURN_EXCHANGE: "contained",
  WAITING_RETURN_EXCHANGE: "outlined",
};

interface MyAccountHistoryOrdersActionsProps {
  order: OrderListItem;
  classes: Record<string, string>;
}

const MyAccountHistoryOrdersActions: React.FC<MyAccountHistoryOrdersActionsProps> = ({ order, classes }) => {
  const updatedAtMs = order.updatedAt ? new Date(order.updatedAt).getTime() : NaN;
  const isRecentlyUpdated = Number.isFinite(updatedAtMs) && Date.now() - updatedAtMs <= PAYMENT_STATUS_LOOKUP_WINDOW_MS;
  const shouldFetchRealtimePaymentStatus =
    order.status === OrderStatus.PENDING &&
    order.paymentMethod !== PaymentMethod.COD &&
    order.paymentStatus !== PaymentStatus.PAID &&
    (isPaymentErrorOrder(order) || Boolean(order.paymentLink) || Boolean(order.paymentLinkExpiresAt) || isRecentlyUpdated);

  const { data: orderPaymentStatus } = useSWR(
    shouldFetchRealtimePaymentStatus ? `order-payment-status/${order.orderCode}` : null,
    () => getOrderStatusByOrderCode(order.orderCode),
    { refreshInterval: 0 },
  );

  const { hasReviewedOrder } = useReviewedOrders();
  const { resolvedOrder, displayState } = useOrderDisplay(order, orderPaymentStatus, hasReviewedOrder(order.id));
  const { actionTypes, returnNotice, paymentCountdownLabel, isPaymentActionDisabled } = displayState;
  const isPreOrder = isPreOrderOrder(order);
  const fulfillmentSummary = order.fulfillmentSummary;
  const showFulfillmentBanner = isPreOrder && !paymentCountdownLabel && Boolean(fulfillmentSummary?.label && fulfillmentSummary?.value);

  const { cancelConfirmOpen, openCancelConfirm, closeCancelConfirm, confirmCancel, isCancelling } = useOrderReturnCancelConfirm();
  const { cancelOrderConfirmOpen, openCancelOrderConfirm, closeCancelOrderConfirm, confirmCancelOrder, isCancellingOrder } =
    useOrderCancelConfirm();
  const { returnExchangeModalOpen, openReturnExchangeModal, closeReturnExchangeModal, handleSelectReturnOption } =
    useOrderReturnRequestNavigation(order.orderCode);

  const {
    handleOrderAction,
    loadingAction,
    payooLoadingOpen,
    closePayooLoading,
    reviewOrder,
    isCreateReviewDialogOpen,
    isViewReviewDialogOpen,
    closeReviewDialog,
  } = useOrderActions({
    onRequestReturn: openReturnExchangeModal,
    onRequestCancelReturnExchange: (o) => {
      const returnCode = o.orderReturnCode?.trim();
      if (!returnCode) return;
      openCancelConfirm({ returnCode, orderCode: o.orderCode });
    },
    onRequestCancelOrder: (o) => {
      const orderId = o.id?.trim();
      const orderCode = getPreOrderDetailLookupCode(o);
      if (!orderId || !orderCode) return;
      openCancelOrderConfirm({ orderId, orderCode, isPreOrder });
    },
  });

  const actions: React.ReactNode[] = [];
  const infos: React.ReactNode[] = [];

  if (paymentCountdownLabel) {
    infos.push(
      <Box key="payment-countdown" className={`${classes.timerBox} ${classes.timerBoxBleed}`}>
        <Typography className={classes.timerText}>
          Thanh toán trong{" "}
          <Box component="span" className={classes.timerValue}>
            {paymentCountdownLabel}
          </Box>
        </Typography>
      </Box>,
    );
  } else if (showFulfillmentBanner) {
    infos.push(
      <Box key="fulfillment-eta" className={`${classes.timerBox} ${classes.timerBoxBleed}`}>
        <Typography className={classes.timerText}>
          {PRE_ORDER_EXPECTED_STOCK_LABEL}{" "}
          <Box component="span" className={classes.timerValue}>
            {fulfillmentSummary!.value}
          </Box>
        </Typography>
      </Box>,
    );
  }

  if (returnNotice) {
    infos.push(
      <Box key="return-days" className={`${classes.returnNoticeBox} ${classes.returnNoticeBoxBleed}`}>
        <Typography className={classes.returnNoticeText}>{returnNotice}</Typography>
      </Box>,
    );
  }

  actionTypes.forEach((actionType) => {
    // Figma AC1 list card: badge + ETA/countdown only; actions live on detail.
    if (isPreOrder) return;

    const variant = LIST_ACTION_VARIANT[actionType];
    actions.push(
      <Button
        key={actionType}
        variant={variant}
        className={variant === "contained" ? classes.btnContained : classes.btnOutline}
        disabled={
          loadingAction === actionType ||
          (actionType === "PAYMENT" && Boolean(isPaymentActionDisabled)) ||
          (actionType === "WAITING_RETURN_EXCHANGE" && isCancelling) ||
          (actionType === "CANCEL" && isCancellingOrder)
        }
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void handleOrderAction(actionType, resolvedOrder);
        }}
      >
        {ORDER_DISPLAY_ACTION_LABELS[actionType]}
      </Button>,
    );
  });

  const hasVisibleContent = (infos?.length ?? 0) > 0 || (actions?.length ?? 0) > 0;

  return (
    <React.Fragment>
      {hasVisibleContent ? (
        <StackRowJustEnd className={classes.actionBox}>
          <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
            {infos}
            {actions.length > 0 ? (
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "16px", flexWrap: "wrap" }}>{actions}</Box>
            ) : null}
          </Box>
        </StackRowJustEnd>
      ) : null}

      <OrderActionDialogs
        reviewOrder={reviewOrder}
        isCreateReviewDialogOpen={isCreateReviewDialogOpen}
        isViewReviewDialogOpen={isViewReviewDialogOpen}
        onCloseReviewDialog={closeReviewDialog}
        returnExchangeModalOpen={returnExchangeModalOpen}
        onCloseReturnExchangeModal={closeReturnExchangeModal}
        onSelectReturnOption={handleSelectReturnOption}
        cancelReturnConfirmOpen={cancelConfirmOpen}
        onCloseCancelReturnConfirm={closeCancelConfirm}
        onConfirmCancelReturn={() => void confirmCancel()}
        isCancellingReturn={isCancelling}
        cancelOrderConfirmOpen={cancelOrderConfirmOpen}
        onCloseCancelOrderConfirm={closeCancelOrderConfirm}
        onConfirmCancelOrder={(reason: OrderCancellationReason) => void confirmCancelOrder(reason)}
        isCancellingOrder={isCancellingOrder}
        cancelOrderVariant={isPreOrder ? "pre-order" : "default"}
        payooLoadingOpen={payooLoadingOpen}
        onClosePayooLoading={closePayooLoading}
      />
    </React.Fragment>
  );
};

export default MyAccountHistoryOrdersActions;
