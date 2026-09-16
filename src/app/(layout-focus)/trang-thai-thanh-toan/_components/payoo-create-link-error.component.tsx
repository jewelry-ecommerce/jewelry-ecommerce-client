"use client";
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { StackAlignCenter, StackRowAlignCenter, StackRowAlignJustCenter } from "@/components/styled";
import useStyles from "./status-view.styles";
import { persistLatestOrderSnapshot } from "@/hooks/use-order-actions.hook";
import { buildChangePaymentMethodUrl } from "../_utils/payment-status-url.util";

interface PayooCreateLinkErrorProps {
  orderCode?: string;
}

const PayooCreateLinkError = ({ orderCode }: PayooCreateLinkErrorProps) => {
  const { classes } = useStyles();
  const router = useRouter();

  return (
    <StackRowAlignJustCenter className={classes.container}>
      <StackAlignCenter className={classes.card}>
        <StackAlignCenter className={classes.content}>
          <Box className={classes.illustration}>
            <Image src="/image/checkout/payment-pending.svg" alt="Pending" width={300} height={169} />
          </Box>

          <Typography className={classes.title}>KHÔNG THỂ KHỞI TẠO LIÊN KẾT THANH TOÁN</Typography>

          <StackRowAlignCenter className={classes.orderIdLabelWrapper}>
            <Typography className={classes.orderIdLabel}>Mã đơn hàng:</Typography>
            <Typography className={classes.orderIdValue}>#{orderCode}</Typography>
          </StackRowAlignCenter>

          <Typography className={classes.messageContent}>
            Hiện chưa thể tạo liên kết thanh toán Payoo. Vui lòng chọn{" "}
            <Typography component="span" sx={{ fontWeight: 700, color: "#0A0A0A" }}>
              &quot;Thanh Toán Lại&quot;
            </Typography>{" "}
            để tiếp tục thanh toán.
          </Typography>
        </StackAlignCenter>

        <StackAlignCenter className={classes.buttonContainer}>
          <Button
            variant="contained"
            className={classes.buttonBlack}
            onClick={() => {
              // Không đưa orderCode lên URL — trang xác nhận đọc từ sessionStorage.
              if (orderCode) persistLatestOrderSnapshot({ orderCode });
              router.push(buildChangePaymentMethodUrl());
            }}
          >
            Thanh Toán Lại
          </Button>
        </StackAlignCenter>
      </StackAlignCenter>
    </StackRowAlignJustCenter>
  );
};

export default PayooCreateLinkError;
