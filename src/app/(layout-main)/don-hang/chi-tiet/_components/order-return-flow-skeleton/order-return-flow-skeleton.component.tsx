"use client";

import React from "react";
import { Box, Skeleton, Stack } from "@mui/material";
import { StackAlignCenter, StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled";
import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";
import useStepperStyles from "../order-exchange/order-exchange-stepper/order-exchange-stepper.styles";
import useStyles from "./order-return-flow-skeleton.styles";

export interface OrderReturnFlowSkeletonProps {
  /** Số bước stepper (đổi hàng: 3, hoàn tiền: 2) */
  stepCount: 2 | 3;
}

/** Giữ đúng layout DOM/CSS như `OrderExchangeStepper` (đường nối + chấm + nhãn). */
const OrderReturnFlowSkeletonStepper = ({ stepCount }: { stepCount: 2 | 3 }) => {
  const { classes, cx } = useStepperStyles();
  const maxStep = Math.max(stepCount - 1, 1);
  const labelWidths = stepCount === 2 ? [132, 148] : [128, 132, 124];

  return (
    <Box className={classes.root}>
      <StackRowAlignCenter className={classes.lineWrapper}>
        <Box
          className={classes.lineActive}
          sx={{
            width: `calc(${(0 / maxStep) * 100}% - ${(0 / maxStep) * 80}px)`,
          }}
        />
        <StackRowAlignCenterJustBetween className={classes.stepsContainer}>
          {Array.from({ length: stepCount }).map((_, index) => (
            <StackAlignCenter key={index} className={classes.stepItem}>
              <Box className={cx(classes.circle, index === 0 && classes.circleActive)} />
              <Skeleton
                variant="rounded"
                sx={{
                  mt: PADDING_GAP_LAYOUT,
                  height: 14,
                  width: labelWidths[index] ?? 120,
                  maxWidth: "min(42vw, 160px)",
                  borderRadius: "4px",
                }}
              />
            </StackAlignCenter>
          ))}
        </StackRowAlignCenterJustBetween>
      </StackRowAlignCenter>
    </Box>
  );
};

const OrderReturnFlowSkeleton: React.FC<OrderReturnFlowSkeletonProps> = ({ stepCount }) => {
  const { classes } = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.container}>
        <Box className={classes.header}>
          <Skeleton
            variant="rounded"
            width="100%"
            sx={{
              maxWidth: 360,
              height: { xs: 32, sm: 36 },
              borderRadius: "4px",
            }}
          />

          <OrderReturnFlowSkeletonStepper stepCount={stepCount} />
        </Box>

        <Skeleton
          variant="rounded"
          width="65%"
          height={22}
          sx={{
            borderRadius: "4px",
            mt: { xs: "24px", sm: "40px" },
            alignSelf: "flex-start",
          }}
        />

        <Box>
          <Stack direction="row" alignItems="center" gap={1.5} className={classes.selectAllRow}>
            <Skeleton variant="rounded" width={20} height={20} sx={{ borderRadius: "4px", flexShrink: 0 }} />
            <Skeleton variant="rounded" width={200} height={22} sx={{ borderRadius: "4px" }} />
          </Stack>

          {[0, 1, 2].map((key) => (
            <Box key={key} className={classes.itemRow}>
              <Skeleton
                variant="rounded"
                className={classes.itemThumb}
                sx={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                }}
              />
              <Stack className={classes.itemBody}>
                <Skeleton variant="rounded" width="85%" height={20} sx={{ borderRadius: "4px" }} />
                <Skeleton variant="rounded" width="55%" height={18} sx={{ borderRadius: "4px" }} />
                <Skeleton variant="rounded" width={36} height={18} sx={{ borderRadius: "4px" }} />
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5, width: "100%" }}>
                  <Skeleton variant="rounded" width={120} height={36} sx={{ borderRadius: "4px" }} />
                  <Skeleton variant="rounded" width={100} height={22} sx={{ borderRadius: "4px" }} />
                </Stack>
              </Stack>
            </Box>
          ))}
        </Box>
      </Box>

      <Box className={classes.stickyFooter}>
        <Box className={classes.footerInner}>
          <Skeleton variant="rounded" height={48} sx={{ width: "100%", borderRadius: 0 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default OrderReturnFlowSkeleton;
