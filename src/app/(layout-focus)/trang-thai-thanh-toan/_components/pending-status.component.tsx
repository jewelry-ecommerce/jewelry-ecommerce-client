"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

import { StackAlignCenter, StackRowAlignCenter, StackRowAlignJustCenter } from "@/components/styled";
import { Copy01 } from "@untitledui/icons";
import useStyles from "./status-view.styles";
import {
  clearPendingPaymentAutoRedirect,
  isPendingPaymentAutoRedirect,
  persistLatestOrderSnapshot,
  readLatestOrderSnapshot,
} from "@/hooks/use-order-actions.hook";
import CheckoutStatusModal, {
  CheckoutStatusModalType,
} from "../../thanh-toan/_components/checkout-status-modal/checkout-status-modal.component";
import { preloadPayooLoadingImage, redirectToPayooPayment } from "../../thanh-toan/_components/checkout.helpers";
import { useCountdown } from "./hooks/use-countdown.hook";
import { buildGuestOrderAccessHref } from "@/utils/order/guest-order-access.util";
import { buildPreOrderGuestAccessHref, isPreOrderAccessToken } from "@/utils/api/pre-order/pre-order-detail.util";
import { buildOrderDetailNavigation } from "@/utils/order/order-detail-context.util";
import { buildChangePaymentMethodUrl } from "../_utils/payment-status-url.util";
import { useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";

interface PendingStatusProps {
  orderCode?: string;
  expiryTime?: string;
  holdRemainingSeconds?: number | null;
  paymentUrl?: string;
  guestOrderAccessToken?: string;
}

const PendingStatus = ({
  orderCode,
  expiryTime,
  holdRemainingSeconds,
  paymentUrl: initialPaymentUrl,
  guestOrderAccessToken,
}: PendingStatusProps) => {
  const { classes } = useStyles();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLogin = useAppSelector(selectIsLogin);

  const [paymentUrl, setPaymentUrl] = useState(() => initialPaymentUrl || readLatestOrderSnapshot()?.paymentUrl || "");
  const [isRetrying, setIsRetrying] = useState(false);
  const [statusModal, setStatusModal] = useState<{ open: boolean; type: CheckoutStatusModalType }>({
    open: false,
    type: "payoo_loading",
  });

  const isRedirectingToPayoo = isPendingPaymentAutoRedirect(searchParams.get("redirect")) && Boolean(paymentUrl);

  const { formattedTime } = useCountdown({
    expiryAt: expiryTime,
    initialSeconds: holdRemainingSeconds,
  });

  useEffect(() => {
    preloadPayooLoadingImage();
  }, []);

  useEffect(() => {
    if (initialPaymentUrl) {
      setPaymentUrl(initialPaymentUrl);
    }
  }, [initialPaymentUrl]);

  useEffect(() => {
    if (!paymentUrl || !isPendingPaymentAutoRedirect(searchParams.get("redirect"))) {
      return;
    }

    clearPendingPaymentAutoRedirect(window.location.href);
    setStatusModal({ open: true, type: "payoo_loading" });
    redirectToPayooPayment(paymentUrl);
  }, [paymentUrl, searchParams]);

  useEffect(() => {
    persistLatestOrderSnapshot({
      orderCode,
      paymentUrl,
      timestamp: Date.now(),
    });
  }, [orderCode, paymentUrl]);

  const handleContinuePayment = () => {
    if (paymentUrl) {
      setIsRetrying(true);
      setStatusModal({ open: true, type: "payoo_loading" });
      redirectToPayooPayment(paymentUrl);
      return;
    }
  };

  if (isRedirectingToPayoo) {
    return (
      <React.Fragment>
        <StackRowAlignJustCenter className={classes.container}>
          <StackAlignCenter className={classes.redirectCard}>
            <CircularProgress color="inherit" size={28} />
          </StackAlignCenter>
        </StackRowAlignJustCenter>

        <CheckoutStatusModal open onClose={() => setStatusModal((prev) => ({ ...prev, open: false }))} type="payoo_loading" />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <StackRowAlignJustCenter className={classes.container}>
        <StackAlignCenter className={classes.card}>
          <StackAlignCenter className={classes.content}>
            <StackAlignCenter className={classes.header}>
              <Box className={classes.illustration}>
                <Image src="/image/checkout/payment-pending.svg" alt="Pending" width={300} height={169} />
              </Box>

              <Typography className={classes.title}>ĐƠN HÀNG ĐANG CHỜ THANH TOÁN</Typography>
            </StackAlignCenter>

            <StackRowAlignCenter className={classes.orderIdLabelWrapper}>
              <Typography className={classes.orderIdLabel}>Mã đơn hàng:</Typography>
              <Typography className={classes.orderIdValue}>#{orderCode}</Typography>
            </StackRowAlignCenter>

            <Typography className={classes.messageContent}>
              Hệ thống sẽ tiếp tục giữ đơn hàng trong{" "}
              <Box component="span" className={classes.textBoldRed}>
                {formattedTime}
              </Box>{" "}
              để bạn hoàn tất thanh toán. Vui lòng nhấn{" "}
              <Typography component="span" sx={{ fontWeight: 700, color: "#0A0A0A" }}>
                &quot;Tiếp tục thanh toán&quot;
              </Typography>{" "}
              để giao dịch được thực hiện.
            </Typography>
          </StackAlignCenter>

          <StackAlignCenter className={classes.buttonContainer}>
            <Box className={classes.rowButtons}>
              <Button
                variant="outlined"
                className={classes.buttonSecondary}
                onClick={() => {
                  // Không đưa orderCode lên URL — trang xác nhận đọc từ sessionStorage.
                  if (orderCode) persistLatestOrderSnapshot({ orderCode });
                  router.push(buildChangePaymentMethodUrl());
                }}
              >
                Đổi Phương Thức Thanh Toán
              </Button>
              <Button variant="contained" className={classes.buttonBlack} disabled={isRetrying} onClick={handleContinuePayment}>
                {isRetrying ? <CircularProgress color="inherit" size={24} /> : "Tiếp Tục Thanh Toán"}
              </Button>
            </Box>
            <Button
              variant="text"
              className={classes.orderDetailLink}
              onClick={() => {
                if (!orderCode) {
                  router.push("/tra-cuu-don-hang");
                  return;
                }
                if (isLogin) {
                  router.push(buildOrderDetailNavigation({ orderCode }));
                  return;
                }
                router.push(
                  guestOrderAccessToken
                    ? isPreOrderAccessToken(guestOrderAccessToken)
                      ? buildPreOrderGuestAccessHref(guestOrderAccessToken)
                      : buildGuestOrderAccessHref(guestOrderAccessToken)
                    : "/tra-cuu-don-hang",
                );
              }}
            >
              Xem chi tiết đơn hàng
            </Button>
          </StackAlignCenter>

          <StackAlignCenter className={classes.contactInfo}>
            <Typography className={classes.copyLabel}>
              Hoặc sao chép đường dẫn dưới đây để tiếp tục thanh toán trên thiết bị khác:
            </Typography>
            <Box className={classes.copyBoxWrapper}>
              <Typography className={classes.copyText}>{paymentUrl || "---"}</Typography>
              <StackRowAlignJustCenter
                className={classes.copyIcon}
                onClick={() => {
                  if (!paymentUrl) return;
                  navigator.clipboard.writeText(paymentUrl);
                  toast.success("Đã sao chép đường dẫn thanh toán");
                }}
              >
                <Copy01 size={20} />
              </StackRowAlignJustCenter>
            </Box>
          </StackAlignCenter>
        </StackAlignCenter>
      </StackRowAlignJustCenter>

      <CheckoutStatusModal
        open={statusModal.open}
        onClose={() => setStatusModal((prev) => ({ ...prev, open: false }))}
        type={statusModal.type}
      />
    </React.Fragment>
  );
};

export default PendingStatus;
