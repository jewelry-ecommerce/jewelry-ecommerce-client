"use client";

import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import useStyles from "../order-info/order-info.styles";
import { StackRowAlignCenter, StackRowAlignStartJustBetween } from "@/components/styled";

export interface OrderReturnInfoRow {
  label: string;
  value: string;
}

export interface OrderReturnDetailInfoSectionProps {
  rows: OrderReturnInfoRow[];
}

const OrderReturnDetailInfoSection = ({ rows }: OrderReturnDetailInfoSectionProps) => {
  const { classes } = useStyles();

  return (
    <Box className={classes.root} sx={{ mb: 0 }}>
      <Stack className={classes.infoList}>
        {rows.map((row) => (
          <StackRowAlignStartJustBetween key={row.label}>
            <Typography className={classes.label}>{row.label}</Typography>
            <Typography className={classes.value}>{row.value}</Typography>
          </StackRowAlignStartJustBetween>
        ))}
      </Stack>
    </Box>
  );
};

export default OrderReturnDetailInfoSection;
