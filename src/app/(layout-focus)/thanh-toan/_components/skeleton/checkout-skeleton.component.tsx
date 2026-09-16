"use client";
import React from "react";
import { Box, Skeleton, Stack, Portal } from "@mui/material";
import useStyles from "../checkout.styles";
import { StackRowAlignCenterJustEnd } from "@/components/styled";

const SectionSkeleton = ({ titleWidth = "30%", height = 200 }: { titleWidth?: string; height?: number }) => (
  <Stack spacing={2} sx={{ width: "100%" }}>
    <Skeleton variant="text" width={titleWidth} height={32} />
    <Skeleton variant="rectangular" width="100%" height={height} sx={{ borderRadius: "8px" }} />
  </Stack>
);

const SummaryRowSkeleton = () => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
    <Skeleton variant="text" width="40%" height={24} />
    <Skeleton variant="text" width="20%" height={24} />
  </Box>
);

const CheckoutSkeleton = () => {
  const { classes, cx } = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.mobileHeader}>
        <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: "8px" }} />
      </Box>

      <Box className={classes.leftColumn}>
        <SectionSkeleton titleWidth="20%" height={100} />

        <SectionSkeleton titleWidth="35%" height={ActiveIsAddressSaved() ? 120 : 350} />

        <SectionSkeleton titleWidth="25%" height={80} />

        <Box className={classes.mobileOnly}>
          <SectionSkeleton titleWidth="20%" height={60} /> {/* Voucher */}
          <Box className={classes.summaryCard}>
            <SummaryRowSkeleton />
            <SummaryRowSkeleton />
            <SummaryRowSkeleton />
            <Skeleton variant="rectangular" width="100%" height={48} sx={{ mt: 2 }} /> {/* Points */}
          </Box>
        </Box>

        <SectionSkeleton titleWidth="30%" height={180} />

        <Box className={classes.desktopOnly}>
          <Skeleton variant="rectangular" width="100%" height={56} sx={{ mt: 2 }} />
        </Box>
      </Box>

      <Box className={cx(classes.rightColumn, classes.desktopOnly)}>
        <Box className={classes.summaryCard}>
          <Stack spacing={2} sx={{ mb: 2 }}>
            <Skeleton variant="text" width="40%" height={24} />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Skeleton variant="rectangular" width={64} height={64} />
              <Stack spacing={1} flex={1}>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="40%" />
              </Stack>
            </Box>
          </Stack>

          <Skeleton variant="rectangular" width="100%" height={50} />

          <Box sx={{ py: 2, borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
            <SummaryRowSkeleton />
            <SummaryRowSkeleton />
            <SummaryRowSkeleton />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Skeleton variant="text" width="30%" height={32} />
            <Skeleton variant="text" width="30%" height={32} />
          </Box>
        </Box>
      </Box>

      <Portal>
        <StackRowAlignCenterJustEnd className={classes.mobileStickyFooter}>
          <Stack className={classes.mobileStickyLeft} sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="60%" height={20} />
          </Stack>
          <Skeleton variant="rectangular" width="160px" height={48} />
        </StackRowAlignCenterJustEnd>
      </Portal>
    </Box>
  );
};

function ActiveIsAddressSaved() {
  return false;
}

export default CheckoutSkeleton;
