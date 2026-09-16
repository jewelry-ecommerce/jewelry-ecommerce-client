import React, { useState, useEffect } from "react";
import { CircularProgress, Box } from "@mui/material";
import { StackRowAlignJustCenter } from "@/components/styled";

import SuccessStatus from "./success-status.component";
import FailedStatus from "./failed-status.component";
import PendingStatus from "./pending-status.component";
import PayooCreateLinkError from "./payoo-create-link-error.component";
import useStyles from "./status-view.styles";
import { useCheckoutStatus } from "./hooks/use-status.hook";
import { usePurchaseTracking } from "./hooks/use-purchase-tracking.hook";
import { UIStatus } from "./status.constant";
import { resolvePaymentHoldCountdownParams } from "../_utils/payment-hold-timing.util";

const SyncingIndicator = () => (
  <Box
    sx={{
      position: "fixed",
      bottom: 24,
      right: 24,
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      backgroundColor: "#FFFFFF",
      padding: "10px 16px",
      borderRadius: "50px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      zIndex: 1000,
      border: "1px solid #E4E4E7",
    }}
  >
    <CircularProgress size={16} thickness={5} color="inherit" />
  </Box>
);

const StatusView = () => {
  const { classes } = useStyles();
  const { isLoading, hasAccess, orderStatus, statusInfo, finalOrderCode, localOrder, statusParam, isPreOrder } = useCheckoutStatus();

  usePurchaseTracking({
    uiStatus: statusInfo.uiStatus,
    orderCode: finalOrderCode || orderStatus?.orderCode || "",
    orderStatus,
  });

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showBlockingLoader = !isMounted || !hasAccess || (isLoading && !orderStatus);

  if (showBlockingLoader) {
    return (
      <StackRowAlignJustCenter sx={{ height: "60vh" }}>
        <CircularProgress color="inherit" size={32} />
      </StackRowAlignJustCenter>
    );
  }

  const renderStatusView = () => {
    const commonProps = {
      orderCode: finalOrderCode || orderStatus?.orderCode || "",
    };

    if (statusParam === "payoo-create-link-error") {
      return <PayooCreateLinkError orderCode={commonProps.orderCode} />;
    }

    // Countdown chỉ từ BE: pending → paymentLinkExpiresAt; incomplete → orderExpiresAt.
    const sessionCountdown = resolvePaymentHoldCountdownParams(orderStatus, { mode: "payment-session" });
    const orderHoldCountdown = resolvePaymentHoldCountdownParams(orderStatus, { mode: "order-hold" });

    switch (statusInfo.uiStatus) {
      case UIStatus.SUCCESS:
        return (
          <SuccessStatus
            {...commonProps}
            isPreOrder={isPreOrder}
            orderPhone={localOrder.phone}
            guestOrderAccessToken={localOrder.guestOrderAccessToken}
            guestOrderAccessExpiresAt={localOrder.guestOrderAccessExpiresAt}
          />
        );

      case UIStatus.FAILED:
      case UIStatus.FAILED_PAYMENT:
        return (
          <FailedStatus
            {...commonProps}
            isTimeout={statusInfo.isOrderTimeout}
            isPaymentTimeout={statusInfo.isPaymentTimeout}
            orderExpiresAt={statusInfo.isOrderTimeout ? undefined : orderHoldCountdown.expiryAt}
            orderRemainingSeconds={statusInfo.isOrderTimeout ? undefined : orderHoldCountdown.initialSeconds}
            errorCode={statusInfo.errorCode}
          />
        );

      case UIStatus.PENDING:
      default:
        return (
          <PendingStatus
            {...commonProps}
            expiryTime={sessionCountdown.expiryAt}
            holdRemainingSeconds={sessionCountdown.initialSeconds}
            paymentUrl={orderStatus?.paymentLink || localOrder.paymentUrl}
            guestOrderAccessToken={localOrder.guestOrderAccessToken}
          />
        );
    }
  };

  return (
    <Box className={classes.root}>
      {isLoading && statusParam && <SyncingIndicator />}
      <Box className={classes.container}>{renderStatusView()}</Box>
    </Box>
  );
};

export default StatusView;
