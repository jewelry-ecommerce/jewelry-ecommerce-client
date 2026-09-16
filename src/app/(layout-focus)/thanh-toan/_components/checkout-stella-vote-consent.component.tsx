"use client";

import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { makeStyles } from "tss-react/mui";
import AppLink from "@/components/app-link/app-link.component";
import CheckboxComponent from "@/components/checkbox/checkbox.component";
import { ATSH_PAGE_PATH } from "@/app/(layout-main)/atsh/_constants/atsh.constants";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import type { CheckoutFormValues } from "./checkout.constant";

const useStyles = makeStyles({ name: "CheckoutStellaVoteConsent" })((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    border: "1px solid var(--Purple-200, #C7D2FE)",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: "var(--Purple-50, #F5F3FF)",
  },
  title: {
    color: "var(--Neutral-950, #0A0A0A)",
    ...TYPOGRAPHY_STYLES.lg.bold,
  },
  description: {
    color: "var(--Neutral-500, #737373)",
    ...TYPOGRAPHY_STYLES.base.regular,
  },
  rulesLink: {
    color: "#197CBD",
    textDecoration: "underline",
    ...TYPOGRAPHY_STYLES.base.regular,
  },
}));

interface CheckoutStellaVoteConsentProps {
  disabled?: boolean;
}

const CheckoutStellaVoteConsent = ({ disabled = false }: CheckoutStellaVoteConsentProps) => {
  const { classes } = useStyles();
  const { control } = useFormContext<CheckoutFormValues>();

  return (
    <Stack className={classes.root}>
      <Typography className={classes.title}>BÌNH CHỌN NGAY CHO &quot;ANH TRAI&quot; BẠN YÊU THÍCH!</Typography>
      <Controller
        name="isAllowCheck"
        control={control}
        render={({ field }) => (
          <CheckboxComponent
            checked={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            disabled={disabled}
            title="Đăng ký nhận 200 VOTES (Dành cho 150 đơn STELLA Set đầu tiên)"
            sxLabel={{
              color: "var(--Neutral-950, #0A0A0A)",
              ...TYPOGRAPHY_STYLES.base.regular,
            }}
          />
        )}
      />
      <Box>
        <Typography className={classes.description}>
          Bằng việc nhấp vào đây, bạn xác nhận tham gia chương trình nhận 200 VOTES cho mỗi STELLA set và cam kết không đổi/hoàn đơn hàng đã
          thanh toán.
        </Typography>
        <AppLink target="_blank" href="/thong-tin-chuong-trinh-unlock-your-vote" className={classes.rulesLink}>
          Chi tiết thể lệ chương trình.
        </AppLink>
      </Box>
    </Stack>
  );
};

export default CheckoutStellaVoteConsent;
