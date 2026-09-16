"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { StackRowAlignCenter } from "@/components/styled";
import { ButtonComponent } from "@/components/button/button.component";
import { StatusBadge } from "@/components/status-badge/status-badge.component";
import type { OrderReturnStatusInfo } from "@/utils/api/order/order.enum";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import useStyles from "./order-return-detail-header.styles";

export interface OrderReturnDetailHeaderProps {
  returnCode: string;
  orderCode: string;
  statusInfo: OrderReturnStatusInfo;
  canWithdraw: boolean;
  withdrawing?: boolean;
  onWithdraw?: () => void;
}

const OrderReturnDetailHeader = ({ returnCode, statusInfo, canWithdraw, withdrawing, onWithdraw }: OrderReturnDetailHeaderProps) => {
  const { classes } = useStyles();

  return (
    <Box className={classes.header}>
      <StackRowAlignCenter className={classes.headerMain}>
        <Box>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.bold, color: "#27251F" }}>Yêu cầu đổi hàng/hoàn tiền</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.bold, color: "#27251F" }}>#{returnCode}</Typography>
        </Box>

        <StackRowAlignCenter sx={{ gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          <StatusBadge label={statusInfo.label} color={statusInfo.color} backgroundColor={statusInfo.bg} />
        </StackRowAlignCenter>
      </StackRowAlignCenter>
      {canWithdraw && onWithdraw && (
        <StackRowAlignCenter className={classes.withdrawActions}>
          <ButtonComponent
            variant="outlined"
            onClick={onWithdraw}
            disabled={withdrawing}
            content={withdrawing ? "Đang hủy..." : "Hủy yêu cầu"}
            sx={{
              borderRadius: "0px",
              ...TYPOGRAPHY_STYLES.base.bold,
            }}
          />
        </StackRowAlignCenter>
      )}
    </Box>
  );
};

export default OrderReturnDetailHeader;
