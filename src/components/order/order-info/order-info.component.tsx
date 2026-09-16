"use client";

import React, { useEffect, useRef } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { toast } from "react-toastify";
import useStyles from "./order-info.styles";
import { StackRow, StackRowJustEnd } from "@/components/styled/stack.style";
import { OrderActionComponent } from "./order-action.component";
import { useOrderDisplay } from "@/hooks/use-order-actions.hook";
import useReviewedOrders from "@/hooks/use-reviewed-orders.hook";

import { OrderDetailResponse, OrderStatusByOrderCodeResponse } from "@/utils/api/checkout/checkout.interface";
import { ORDER_DISPLAY_ACTION_LABELS, OrderDisplayActionType } from "@/utils/api/order";
import {
  isPreOrderOrder,
  getPreOrderListDisplayCode,
  PRE_ORDER_CANCEL_ACTION_LABEL,
  PRE_ORDER_PAYMENT_ACTION_LABEL,
  PRE_ORDER_PAYMENT_EXPIRED_MESSAGE,
} from "@/utils/api/pre-order/pre-order-order.util";
import { StatusBadge } from "@/components/status-badge/status-badge.component";
import { PRE_ORDER_EXPECTED_STOCK_LABEL } from "@/utils/constants/pre-order-badge.constant";

export interface OrderInfoItem {
  label: string;
  value: string | React.ReactNode;
}

export interface OrderInfoSectionProps {
  order: OrderDetailResponse;
  realtimePaymentStatus?: OrderStatusByOrderCodeResponse;
  details: OrderInfoItem[];
  onAction?: (actionType: string) => void;
  readOnly?: boolean;
}

function getActionLabel(actionType: OrderDisplayActionType, isPreOrder: boolean): string {
  if (!isPreOrder) return ORDER_DISPLAY_ACTION_LABELS[actionType];
  if (actionType === "PAYMENT") return PRE_ORDER_PAYMENT_ACTION_LABEL;
  if (actionType === "CANCEL") return PRE_ORDER_CANCEL_ACTION_LABEL;
  return ORDER_DISPLAY_ACTION_LABELS[actionType];
}

const OrderInfoSection = ({ order, realtimePaymentStatus, details, onAction, readOnly = false }: OrderInfoSectionProps) => {
  const { classes } = useStyles();
  const { hasReviewedOrder } = useReviewedOrders();
  const { displayState } = useOrderDisplay(order, realtimePaymentStatus, hasReviewedOrder(order.id));
  const { statusInfo, returnNotice, paymentNotice, paymentCountdownLabel, actionTypes, isPaymentActionDisabled, isPaymentHoldExpired } =
    displayState;
  const isPreOrder = isPreOrderOrder(order);
  const paymentExpiredHandledRef = useRef(false);

  // Chỉ toast 1 lần — không reload: full reload + trạng thái vẫn AwaitingPayment/expired → vòng lặp vô hạn.
  useEffect(() => {
    if (!isPreOrder || !isPaymentHoldExpired || paymentExpiredHandledRef.current) return;

    const storageKey = order.orderCode?.trim() ? `preorder-payment-expired-toast:${order.orderCode.trim()}` : null;
    if (storageKey) {
      try {
        if (sessionStorage.getItem(storageKey)) {
          paymentExpiredHandledRef.current = true;
          return;
        }
        sessionStorage.setItem(storageKey, "1");
      } catch {
        // ignore storage errors (private mode, etc.)
      }
    }

    paymentExpiredHandledRef.current = true;
    toast.error(PRE_ORDER_PAYMENT_EXPIRED_MESSAGE);
  }, [isPreOrder, isPaymentHoldExpired, order.orderCode]);

  const actionVariantMap: Record<OrderDisplayActionType, "primary" | "secondary"> = {
    PAYMENT: "primary",
    CANCEL: "secondary",
    COMPLETE: "primary",
    WRITE_REVIEW: "primary",
    VIEW_REVIEW: "secondary",
    REPURCHASE: "secondary",
    RETURN: "secondary",
    VIEW_RETURN_EXCHANGE: "primary",
    WAITING_RETURN_EXCHANGE: "secondary",
  };

  const actions = (readOnly ? [] : actionTypes).map((actionType) => ({
    label: getActionLabel(actionType, isPreOrder),
    variant: actionVariantMap[actionType],
    disabled: actionType === "PAYMENT" && Boolean(isPaymentActionDisabled),
    onClick: () => onAction?.(actionType),
  }));

  const fulfillmentSummary = order.fulfillmentSummary;
  const showFulfillmentBanner = isPreOrder && !paymentCountdownLabel && Boolean(fulfillmentSummary?.label && fulfillmentSummary?.value);

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Stack className={classes.headerContent}>
          <Stack>
            <Typography className={classes.title}>{isPreOrder ? "Thông tin đơn đặt trước" : "Thông tin đơn hàng"}</Typography>
            <Typography className={classes.title}>
              #{isPreOrder ? getPreOrderListDisplayCode(order) || order.orderCode : order.orderCode}
            </Typography>
          </Stack>
          <StatusBadge label={statusInfo.label} color={statusInfo.color} backgroundColor={statusInfo.bg} className={classes.statusBadge} />
        </Stack>
        <OrderActionComponent actions={actions} />
      </Box>

      {paymentCountdownLabel ? (
        <StackRowJustEnd className={classes.paymentNotice}>
          <Typography className={classes.paymentNoticeText}>
            {paymentNotice || "Thanh toán trong"}{" "}
            <Box component="span" className={classes.paymentNoticeValue}>
              {paymentCountdownLabel}
            </Box>
          </Typography>
        </StackRowJustEnd>
      ) : null}

      {!paymentCountdownLabel && paymentNotice ? (
        <StackRowJustEnd className={classes.paymentNotice}>
          <Typography className={classes.paymentNoticeText}>{paymentNotice}</Typography>
        </StackRowJustEnd>
      ) : null}

      {showFulfillmentBanner ? (
        <StackRowJustEnd className={classes.paymentNotice}>
          <Typography className={classes.paymentNoticeText}>
            {PRE_ORDER_EXPECTED_STOCK_LABEL}{" "}
            <Box component="span" className={classes.fulfillmentSummaryValue}>
              {fulfillmentSummary!.value}
            </Box>
          </Typography>
        </StackRowJustEnd>
      ) : null}

      {returnNotice ? (
        <StackRowJustEnd className={classes.returnNotice}>
          <Typography className={classes.returnNoticeText}>{returnNotice}</Typography>
        </StackRowJustEnd>
      ) : null}

      <Stack className={classes.infoList}>
        {details.map((item, index) => (
          <StackRow key={index} className={classes.infoRow}>
            <Typography className={classes.label}>{item.label}</Typography>
            <Typography className={classes.value}>{item.value}</Typography>
          </StackRow>
        ))}
      </Stack>
    </Box>
  );
};

export default OrderInfoSection;
