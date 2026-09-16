"use client";
import React from "react";
import { Box, Skeleton, Stack } from "@mui/material";
import useStyles from "./order-detail-view.styles";
import { StackAlignCenter, StackRow, StackRowAlignStartJustBetween } from "@/components/styled";
import CheckoutSummarySection from "@/app/(layout-focus)/thanh-toan/_components/checkout-summary/checkout-summary.component";

const InfoRowSkeleton = () => (
  <Stack direction="row" spacing={3} sx={{ width: "100%", mb: 1.5 }}>
    <Skeleton variant="text" width="30%" height={24} />
    <Skeleton variant="text" width="50%" height={24} />
  </Stack>
);

const TimelineItemSkeleton = ({ isLast = false }: { isLast?: boolean }) => (
  <Box sx={{ display: "flex", gap: "16px", minHeight: "80px" }}>
    <StackAlignCenter sx={{ width: "24px" }}>
      <Skeleton variant="circular" width={12} height={12} />
      {!isLast && <Skeleton variant="rectangular" width={2} sx={{ flex: 1, my: 0.5 }} />}
    </StackAlignCenter>
    <Stack spacing={1} flex={1}>
      <Stack direction="row" spacing={2}>
        <Skeleton variant="text" width="40px" />
        <Skeleton variant="text" width="80px" />
      </Stack>
      <Skeleton variant="text" width="30%" height={24} />
      <Skeleton variant="text" width="60%" />
    </Stack>
  </Box>
);

const ProductItemSkeleton = () => (
  <StackRow gap={2} sx={{ py: 2, borderBottom: "1px solid #F4F4F5" }}>
    <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: "8px" }} />
    <Stack spacing={1} flex={1} justifyContent="center">
      <Skeleton variant="text" width="60%" height={24} />
      <Skeleton variant="text" width="30%" />
      <Skeleton variant="text" width="20%" />
    </Stack>
  </StackRow>
);

const OrderDetailSkeleton = () => {
  const { classes } = useStyles();

  return (
    <StackRow className={classes.root}>
      <StackAlignCenter className={classes.content}>
        <Box className={classes.sectionWrapper} sx={{ p: 3, backgroundColor: "#FFF" }}>
          <StackRowAlignStartJustBetween sx={{ mb: 4 }}>
            <Stack spacing={1}>
              <Skeleton variant="text" width={160} height={32} />
              <Skeleton variant="text" width={120} height={32} />
            </Stack>
            <Skeleton variant="rectangular" width={100} height={32} />
          </StackRowAlignStartJustBetween>

          <Stack spacing={1.75}>
            <InfoRowSkeleton />
            <InfoRowSkeleton />
            <InfoRowSkeleton />
            <InfoRowSkeleton />
            <InfoRowSkeleton />
          </Stack>
        </Box>

        <Box className={classes.sectionWrapper} sx={{ p: 3, backgroundColor: "#FFF" }}>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 3 }} />
          <TimelineItemSkeleton />
          <TimelineItemSkeleton isLast />
        </Box>

        <Box className={classes.sectionWrapper} sx={{ p: 3, backgroundColor: "#FFF" }}>
          <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
          <ProductItemSkeleton />
        </Box>

        <Box className={classes.sectionWrapper}>
          <CheckoutSummarySection
            subtotal=""
            shippingFee=""
            totalDiscount=""
            discounts={[]}
            pointsAvailable={0}
            pointsValue=""
            pointsUsed={0}
            total=""
            earnedPointsText=""
            isLoading={true}
            showTitle={false}
          />
        </Box>
      </StackAlignCenter>
    </StackRow>
  );
};

export default OrderDetailSkeleton;
