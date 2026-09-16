"use client";
import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { StackAlignCenter, StackRowAlignCenter } from "@/components/styled";
import useStyles from "./status-view.styles";
import useOrderActions, { persistLatestOrderSnapshot } from "@/hooks/use-order-actions.hook";
import { buildChangePaymentMethodUrl } from "../_utils/payment-status-url.util";
import { useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import { getOrderMeByOrderCode, resolveGuestOrderAccess } from "@/utils/api/checkout/checkout.api";
import { resolvePreOrderAccess } from "@/utils/api/pre-order/pre-order-detail.api";
import {
  buildPreOrderGuestAccessHref,
  isPreOrderAccessToken,
  preOrderDetailToViewOrder,
  resolveStoredPreOrderAccessToken,
} from "@/utils/api/pre-order/pre-order-detail.util";
import { ERROR_MESSAGES } from "./status.constant";
import { useCountdown } from "./hooks/use-countdown.hook";
import { guestOrderDetailToViewOrder } from "@/utils/order/guest-order-detail.util";
import { buildGuestOrderAccessHref, readStoredGuestOrderAccessToken } from "@/utils/order/guest-order-access.util";
import { buildOrderDetailNavigation } from "@/utils/order/order-detail-context.util";

interface FailedStatusProps {
  orderCode?: string;
  isTimeout?: boolean;
  isPaymentTimeout?: boolean;
  orderExpiresAt?: string | null;
  orderRemainingSeconds?: number | null;
  errorCode?: string | null;
}

const FailedStatus = ({ orderCode, isTimeout, isPaymentTimeout, orderExpiresAt, orderRemainingSeconds, errorCode }: FailedStatusProps) => {
  const { classes } = useStyles();
  const router = useRouter();
  const isLogin = useAppSelector(selectIsLogin);
  const [isRetrying, setIsRetrying] = useState(false);
  const { handleOrderAction, isProcessing } = useOrderActions();

  const errorDetail = errorCode ? ERROR_MESSAGES[errorCode] : null;
  const isRetryable = !isTimeout;
  const shouldShowHoldMessage = !isTimeout;

  const { formattedTime } = useCountdown({
    initialSeconds: orderRemainingSeconds,
    expiryAt: orderExpiresAt,
    enabled: shouldShowHoldMessage,
  });

  const handleReorder = async () => {
    if (!orderCode || isRetrying || isProcessing.repurchase) return;
    setIsRetrying(true);
    try {
      // Ưu tiên token trong latest_order (retail goa_ / pre-order gpa_); không lấy gpa_ stale đè retail.
      const guestAccessToken = readStoredGuestOrderAccessToken() || resolveStoredPreOrderAccessToken();
      const orderDetail = isLogin
        ? await getOrderMeByOrderCode(orderCode)
        : guestAccessToken
          ? isPreOrderAccessToken(guestAccessToken)
            ? preOrderDetailToViewOrder(await resolvePreOrderAccess(guestAccessToken))
            : guestOrderDetailToViewOrder(await resolveGuestOrderAccess(guestAccessToken))
          : null;
      if (!orderDetail) throw new Error("MISSING_ORDER_ACCESS");
      await handleOrderAction("REPURCHASE", orderDetail);
    } catch (error) {
      toast.error("Không thể lấy thông tin đơn hàng để đặt lại");
      router.push("/gio-hang");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleViewOrder = () => {
    if (orderCode) {
      const guestAccessToken = readStoredGuestOrderAccessToken() || resolveStoredPreOrderAccessToken();
      router.push(
        isLogin
          ? buildOrderDetailNavigation({ orderCode })
          : guestAccessToken
            ? isPreOrderAccessToken(guestAccessToken)
              ? buildPreOrderGuestAccessHref(guestAccessToken)
              : buildGuestOrderAccessHref(guestAccessToken)
            : "/tra-cuu-don-hang",
      );
    }
  };

  const handleRetryPayment = () => {
    if (!orderCode) return;
    // Không đưa orderCode lên URL — trang xác nhận đọc từ sessionStorage.
    persistLatestOrderSnapshot({ orderCode });
    router.push(buildChangePaymentMethodUrl());
  };

  const renderTitle = () => {
    if (errorDetail?.title) return errorDetail.title;
    return isTimeout ? "ĐẶT HÀNG KHÔNG THÀNH CÔNG" : "THANH TOÁN CHƯA HOÀN TẤT";
  };

  const renderMessage = () => {
    if (errorDetail) {
      return (
        <React.Fragment>
          {errorDetail.content.map((text, idx) => (
            <Typography key={idx} className={classes.messageContent}>
              {text}
            </Typography>
          ))}
          {shouldShowHoldMessage && (
            <Typography className={classes.messageContent}>
              Hệ thống sẽ tiếp tục giữ đơn hàng trong{" "}
              <Box component="span" className={classes.textBoldRed}>
                {formattedTime}
              </Box>{" "}
              để bạn hoàn tất lại.
            </Typography>
          )}
        </React.Fragment>
      );
    }

    if (isPaymentTimeout) {
      return (
        <Typography className={classes.messageContent}>
          Phiên thanh toán đã hết hạn. Hệ thống sẽ tiếp tục giữ đơn hàng trong{" "}
          <Box component="span" className={classes.textBoldRed}>
            {formattedTime}
          </Box>{" "}
          để bạn hoàn tất lại.
        </Typography>
      );
    }

    if (isTimeout) {
      return (
        <Typography className={classes.messageContent}>
          Rất tiếc, giao dịch này đã bị hủy do quá thời gian chờ thanh toán. Hãy đặt lại đơn hàng mới nhé!
        </Typography>
      );
    }

    return (
      <React.Fragment>
        <Typography className={classes.messageContent}>Đặt hàng không thành công do khách hàng chủ động hủy giao dịch.</Typography>
        {shouldShowHoldMessage && (
          <Typography className={classes.messageContent}>
            Hệ thống sẽ tiếp tục giữ đơn hàng trong{" "}
            <Box component="span" className={classes.textBoldRed}>
              {formattedTime}
            </Box>{" "}
            để bạn hoàn tất lại.
          </Typography>
        )}
      </React.Fragment>
    );
  };

  return (
    <StackAlignCenter className={classes.card}>
      <StackAlignCenter className={classes.content}>
        <StackAlignCenter className={classes.header}>
          <Box className={classes.illustration}>
            <Image
              src={isTimeout ? "/image/checkout/payment-failed.svg" : "/image/checkout/payment-pending.svg"}
              alt="Status Icon"
              width={300}
              height={169}
            />
          </Box>
          <Typography className={classes.title}>{renderTitle()}</Typography>
        </StackAlignCenter>

        <StackRowAlignCenter className={classes.orderIdLabelWrapper}>
          <Typography className={classes.orderIdLabel}>Mã đơn hàng:</Typography>
          <Typography className={classes.orderIdValue}>#{orderCode}</Typography>
        </StackRowAlignCenter>

        <StackAlignCenter sx={{ gap: "8px" }}>{renderMessage()}</StackAlignCenter>
      </StackAlignCenter>

      <StackAlignCenter className={classes.buttonContainer}>
        <Box className={classes.rowButtons}>
          <Button variant="outlined" className={classes.buttonSecondary} onClick={handleViewOrder}>
            Xem Chi Tiết Đơn Hàng
          </Button>
          <Button
            variant="contained"
            className={classes.buttonBlack}
            disabled={isRetrying || isProcessing.repurchase}
            onClick={isRetryable ? handleRetryPayment : handleReorder}
          >
            {isRetryable
              ? isRetrying
                ? "ĐANG XỬ LÝ..."
                : "Thanh Toán Lại"
              : isRetrying || isProcessing.repurchase
                ? "ĐANG XỬ LÝ..."
                : "Đặt Lại Đơn Hàng"}
          </Button>
        </Box>
      </StackAlignCenter>
    </StackAlignCenter>
  );
};

export default FailedStatus;
