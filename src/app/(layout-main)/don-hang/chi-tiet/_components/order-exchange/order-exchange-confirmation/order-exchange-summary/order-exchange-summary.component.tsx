"use client";

import React from "react";
import { Box, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { StackRowAlignCenterJustBetween } from "@/components/styled";
import { IS_LOYALTY_UI_ENABLED } from "@/utils/constants/commerce-feature.constant";
import useStyles from "./order-exchange-summary.styles";

const fmt = (n: number) => `${n.toLocaleString("vi-VN")}đ`;
const fmtPoints = (n: number) => n.toLocaleString("vi-VN");

export interface OrderExchangeSummaryProps {
  totalPriceToReturn: number;
  priceDifference: number;
  refundedLoyaltyPoints?: number;
  /** Phí ship thu hồi (dự kiến). */
  quotedReturnShippingFee?: number;
  /** Phí ship giao đơn đổi (dự kiến). */
  quotedExchangeShippingFee?: number;
  /** @deprecated dùng quotedReturnShippingFee / quotedExchangeShippingFee */
  quotedShippingFee?: number;
  /** Đang gọi API tính phí */
  isShippingFeeLoading?: boolean;
}

const OrderExchangeSummary: React.FC<OrderExchangeSummaryProps> = ({
  totalPriceToReturn,
  priceDifference,
  refundedLoyaltyPoints = 0,
  quotedReturnShippingFee,
  quotedExchangeShippingFee,
  quotedShippingFee,
  isShippingFeeLoading = false,
}) => {
  const { classes } = useStyles();

  const returnShippingFee = quotedReturnShippingFee ?? quotedShippingFee ?? 0;
  const exchangeShippingFee = quotedExchangeShippingFee ?? quotedShippingFee ?? 0;

  const codDifference = Math.max(priceDifference, 0);
  const totalOnRecovery = returnShippingFee;
  const totalOnExchangeDelivery = codDifference + exchangeShippingFee;

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
          <Typography className={classes.label}>Tiền bù chênh lệch (COD thu thêm)</Typography>
          <Typography className={classes.value}>{fmt(codDifference)}</Typography>
        </StackRowAlignCenterJustBetween>

        <StackRowAlignCenterJustBetween gap="8px">
          <Typography className={classes.label}>Phí vận chuyển thu hồi (dự kiến)</Typography>
          {renderShippingValue(returnShippingFee)}
        </StackRowAlignCenterJustBetween>

        {/* <StackRowAlignCenterJustBetween gap="8px">
          <Typography className={classes.label}>Phí vận chuyển giao đơn đổi (dự kiến)</Typography>
          {renderShippingValue(exchangeShippingFee)}
        </StackRowAlignCenterJustBetween> */}

        <Divider sx={{ my: 1 }} />

        <StackRowAlignCenterJustBetween gap="8px">
          <Typography className={classes.totalLabel}>Tổng thanh toán khi thu hồi</Typography>
          <Typography className={classes.totalValue}>{isShippingFeeLoading ? "—" : fmt(totalOnRecovery)}</Typography>
        </StackRowAlignCenterJustBetween>

        {/* <StackRowAlignCenterJustBetween gap="12px">
          <Typography className={classes.totalLabel}>Tổng thanh toán khi giao đơn đổi mới</Typography>
          <Typography className={classes.totalValue}>{isShippingFeeLoading ? "—" : fmt(totalOnExchangeDelivery)}</Typography>
        </StackRowAlignCenterJustBetween> */}

        <Typography className={classes.footnote}>
          Tổng thu thêm khi thu hồi (COD) chỉ bao gồm phí vận chuyển thu hồi, phần chênh lệch về giá giữa sản phẩm đổi/trả sẽ được thu khi
          giao đơn mới (nếu có).
        </Typography>
      </Stack>
    </Box>
  );
};

export default OrderExchangeSummary;
