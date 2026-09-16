"use client";

import React from "react";
import { Box, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { StackRowAlignCenterJustBetween } from "@/components/styled";
import { PaymentMethod, getPaymentMethodLabel } from "@/utils/api/order/order.enum";
import { IS_LOYALTY_UI_ENABLED } from "@/utils/constants/commerce-feature.constant";
import useStyles from "../order-exchange-summary/order-exchange-summary.styles";

const fmt = (n: number) => `${n.toLocaleString("vi-VN")}đ`;
const fmtPoints = (n: number) => n.toLocaleString("vi-VN");

const PAYMENT_METHOD_ICON: Partial<Record<PaymentMethod, string>> = {
  [PaymentMethod.MOMO_WALLET]: "/image/checkout/icon-momo.svg",
  [PaymentMethod.ZALO_PAY]: "/image/checkout/icon-zalo-pay.svg",
};

export interface OrderRefundSummaryProps {
  totalPriceToReturn: number;
  refundedLoyaltyPoints?: number;
  quotedReturnShippingFee?: number;
  paymentMethod?: PaymentMethod | string | null;
  isShippingFeeLoading?: boolean;
}

const OrderRefundSummary: React.FC<OrderRefundSummaryProps> = ({
  totalPriceToReturn,
  refundedLoyaltyPoints = 0,
  quotedReturnShippingFee = 0,
  paymentMethod,
  isShippingFeeLoading = false,
}) => {
  const { classes } = useStyles();
  const refundAmount = totalPriceToReturn;
  const totalOnRecovery = quotedReturnShippingFee;
  const totalRefundReceived = Math.max(0, refundAmount - quotedReturnShippingFee);
  const paymentLabel = getPaymentMethodLabel(paymentMethod ?? undefined);
  const paymentIcon = paymentMethod ? PAYMENT_METHOD_ICON[paymentMethod as PaymentMethod] : undefined;

  const renderShippingValue = (fee: number) => {
    if (isShippingFeeLoading) {
      return (
        <Stack direction="row" alignItems="center" gap={1}>
          <CircularProgress size={14} thickness={5} sx={{ color: "#71717A" }} />
          <Typography sx={{ fontWeight: 400, color: "#71717A", fontSize: "14px" }}>Đang tính…</Typography>
        </Stack>
      );
    }
    return <Typography className={classes.value}>{fmt(fee)}</Typography>;
  };

  return (
    <Box className={classes.root}>
      <Divider sx={{ mb: 4 }} />
      <Typography className={classes.sectionHeader}>Phí thu hồi và Thanh toán đa phương thức</Typography>

      <Stack gap="8px">
        <StackRowAlignCenterJustBetween gap="8px">
          <Typography className={classes.label}>Tiền thực thu đơn gốc</Typography>
          <Typography className={classes.value}>{fmt(totalPriceToReturn)}</Typography>
        </StackRowAlignCenterJustBetween>

        {IS_LOYALTY_UI_ENABLED ? (
          <StackRowAlignCenterJustBetween gap="8px">
            <Typography className={classes.label}>Điểm loyalty hoàn lại</Typography>
            <Stack direction="row" alignItems="center" gap={0.75}>
              <Image src="/image/icons/icon-point.svg" alt="" width={16} height={16} />
              <Typography className={classes.value}>{fmtPoints(refundedLoyaltyPoints)}</Typography>
            </Stack>
          </StackRowAlignCenterJustBetween>
        ) : null}

        <StackRowAlignCenterJustBetween gap="8px">
          <Typography className={classes.label}>Tiền hoàn lại</Typography>
          <Typography className={classes.value}>{fmt(refundAmount)}</Typography>
        </StackRowAlignCenterJustBetween>

        <StackRowAlignCenterJustBetween gap="8px">
          <Typography className={classes.label}>Phí vận chuyển thu hồi (dự kiến)</Typography>
          {renderShippingValue(quotedReturnShippingFee)}
        </StackRowAlignCenterJustBetween>

        <StackRowAlignCenterJustBetween gap="8px">
          <Typography className={classes.label}>Hoàn tiền vào</Typography>
          <Stack direction="row" alignItems="center" gap={1}>
            {paymentMethod === PaymentMethod.COD ? (
              <Typography className={classes.value}>Tài khoản ngân hàng</Typography>
            ) : (
              <>
                {paymentIcon ? <Image src={paymentIcon} alt="" width={20} height={20} /> : null}
                <Typography className={classes.value}>{paymentLabel}</Typography>
              </>
            )}
          </Stack>
        </StackRowAlignCenterJustBetween>

        <Divider sx={{ my: 1 }} />

        <StackRowAlignCenterJustBetween gap="8px">
          <Typography className={classes.totalLabel}>Tổng thanh toán khi thu hồi</Typography>
          <Typography className={classes.totalValue}>{isShippingFeeLoading ? "—" : fmt(totalOnRecovery)}</Typography>
        </StackRowAlignCenterJustBetween>

        <StackRowAlignCenterJustBetween gap="12px">
          <Typography className={classes.totalLabel}>Tổng tiền hoàn nhận được</Typography>
          <Typography className={classes.totalValue}>{isShippingFeeLoading ? "—" : fmt(totalRefundReceived)}</Typography>
        </StackRowAlignCenterJustBetween>

        <Typography className={classes.footnote}>
          Tổng thanh toán khi thu hồi (COD) chỉ bao gồm phí vận chuyển thu hồi. Số tiền hoàn sẽ chuyển về phương thức thanh toán ban đầu sau
          khi yêu cầu được duyệt.
        </Typography>
      </Stack>
    </Box>
  );
};

export default OrderRefundSummary;
