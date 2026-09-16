"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Box } from "@mui/material";
import useStyles from "./order-detail-view.styles";
import OrderInfoSection, { OrderInfoSectionProps } from "../order-info/order-info.component";
import OrderTimelineSection, { OrderTimelineSectionProps } from "../order-timeline/order-timeline.component";
import OrderProductListSection, { OrderProductListProps } from "../order-product-list/order-product-list.component";
import OrderActionDialogs from "../order-action-dialogs/order-action-dialogs.component";
import CheckoutSummarySection from "@/app/(layout-focus)/thanh-toan/_components/checkout-summary/checkout-summary.component";
import { StackAlignCenter, StackRow } from "@/components/styled";

import { OrderDetailResponse, OrderStatusByOrderCodeResponse } from "@/utils/api/checkout/checkout.interface";
import type { OrderCancellationReason } from "@/utils/api/order/order.enum";
import useOrderActions from "@/hooks/use-order-actions.hook";
import { useOrderReturnCancelConfirm } from "@/app/(layout-main)/don-hang/chi-tiet/_hooks/use-order-return-cancel-confirm.hook";
import { useOrderCancelConfirm } from "@/hooks/use-order-cancel-confirm.hook";
import { useOrderReturnRequestNavigation } from "@/hooks/order/use-order-return-request-navigation.hook";
import { getPreOrderDetailLookupCode, isPreOrderOrder } from "@/utils/api/pre-order/pre-order-order.util";

export interface OrderDetailViewProps {
  order: OrderDetailResponse;
  realtimePaymentStatus?: OrderStatusByOrderCodeResponse;
  infoDetails: OrderInfoSectionProps["details"];
  timeline: OrderTimelineSectionProps;
  productList: OrderProductListProps;
  summary: React.ComponentProps<typeof CheckoutSummarySection>;
  readOnly?: boolean;
}

const OrderDetailView = ({
  order,
  realtimePaymentStatus,
  infoDetails,
  timeline,
  productList,
  summary,
  readOnly = false,
}: OrderDetailViewProps) => {
  const { classes } = useStyles();
  const searchParams = useSearchParams();
  const orderCode = order.orderCode;
  const returnDetailSearchQuery = searchParams.toString();
  const isPreOrder = isPreOrderOrder(order);
  // Guest retail / pre-order đều cần Thanh toán lại + Hủy khi đơn còn Pending.
  const isActionsReadOnly = readOnly;

  const { cancelConfirmOpen, openCancelConfirm, closeCancelConfirm, confirmCancel, isCancelling } = useOrderReturnCancelConfirm();
  const { cancelOrderConfirmOpen, openCancelOrderConfirm, closeCancelOrderConfirm, confirmCancelOrder, isCancellingOrder } =
    useOrderCancelConfirm();
  const { returnExchangeModalOpen, openReturnExchangeModal, closeReturnExchangeModal, handleSelectReturnOption } =
    useOrderReturnRequestNavigation(orderCode, returnDetailSearchQuery);

  const {
    handleOrderAction,
    payooLoadingOpen,
    closePayooLoading,
    reviewOrder,
    isCreateReviewDialogOpen,
    isViewReviewDialogOpen,
    closeReviewDialog,
  } = useOrderActions({
    returnDetailSearchQuery,
    onRequestReturn: openReturnExchangeModal,
    onRequestCancelReturnExchange: (o) => {
      const returnCode = o.orderReturnCode?.trim();
      if (!returnCode) return;
      openCancelConfirm({ returnCode, orderCode: o.orderCode });
    },
    onRequestCancelOrder: (o) => {
      const orderCode = getPreOrderDetailLookupCode(o);
      if (!orderCode) return;
      // Guest detail may omit `id`; cancel API keys off orderCode.
      const orderId = o.id?.trim() || orderCode;
      openCancelOrderConfirm({ orderId, orderCode, isPreOrder });
    },
  });

  return (
    <StackRow className={classes.root}>
      <StackAlignCenter className={classes.content}>
        <Box className={classes.sectionWrapper}>
          <OrderInfoSection
            order={order}
            realtimePaymentStatus={realtimePaymentStatus}
            details={infoDetails}
            readOnly={isActionsReadOnly}
            onAction={(actionType) => void handleOrderAction(actionType, order)}
          />
        </Box>

        {!isPreOrder ? (
          <Box className={classes.sectionWrapper}>
            <OrderTimelineSection {...timeline} />
          </Box>
        ) : null}

        <Box className={classes.sectionWrapper}>
          <OrderProductListSection {...productList} />
        </Box>

        <Box className={classes.sectionWrapper}>
          <CheckoutSummarySection {...summary} isLoggedIn={false} showTitle={false} />
        </Box>
      </StackAlignCenter>

      {!isActionsReadOnly ? (
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
      ) : null}
    </StackRow>
  );
};

export default OrderDetailView;
