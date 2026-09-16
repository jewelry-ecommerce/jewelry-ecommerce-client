"use client";

import React from "react";
import { Box, Skeleton, Stack } from "@mui/material";
import { StackAlignCenter, StackRow, StackRowAlignCenter, StackRowAlignStartJustBetween } from "@/components/styled";
import useStyles from "./order-return-detail-view.styles";

const OrderReturnDetailSkeleton = () => {
  const { classes } = useStyles();

  return (
    <StackRow className={classes.root}>
      <StackAlignCenter className={classes.content}>
        <Box className={classes.sectionWrapper}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "flex-start" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Stack spacing={1} sx={{ flex: 1, minWidth: 0, width: { xs: "100%", sm: "auto" } }}>
              <Skeleton variant="rounded" sx={{ width: "100%", maxWidth: 320, height: 28, borderRadius: "4px" }} />
              <Skeleton variant="rounded" sx={{ width: "100%", maxWidth: 220, height: 28, borderRadius: "4px" }} />
            </Stack>
            <Skeleton variant="rounded" sx={{ width: 132, height: 32, borderRadius: "4px", flexShrink: 0 }} />
          </Stack>

          <Stack spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <StackRowAlignStartJustBetween key={i} sx={{ width: "100%", gap: 2 }}>
                <Skeleton variant="rounded" sx={{ width: { xs: "42%", sm: "38%" }, height: 20, borderRadius: "4px" }} />
                <Skeleton variant="rounded" sx={{ width: { xs: "52%", sm: "48%" }, height: 20, borderRadius: "4px" }} />
              </StackRowAlignStartJustBetween>
            ))}
          </Stack>
        </Box>

        <Box className={classes.sectionWrapper}>
          <Skeleton variant="rounded" sx={{ width: 160, height: 24, mb: 2, borderRadius: "4px" }} />
          <Skeleton variant="rounded" sx={{ width: "100%", height: 72, mb: 2, borderRadius: "4px" }} />
          <Stack direction="row" gap={1} flexWrap="wrap">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" sx={{ width: 72, height: 72, borderRadius: "4px", flexShrink: 0 }} />
            ))}
          </Stack>
        </Box>

        <Box className={classes.sectionWrapper}>
          <Skeleton variant="rounded" sx={{ width: "100%", maxWidth: 400, height: 26, mb: 2, borderRadius: "4px" }} />
          {[0, 1, 2].map((i) => (
            <StackRowAlignCenter
              key={i}
              sx={{
                alignItems: "flex-start",
                gap: 2,
                mb: i < 2 ? 2 : 0,
              }}
            >
              <Stack alignItems="center" sx={{ pt: 0.5, flexShrink: 0 }}>
                <Skeleton variant="circular" width={10} height={10} />
                {i < 2 ? <Skeleton variant="rounded" sx={{ width: 2, height: 44, mt: 0.5, borderRadius: 0, bgcolor: "#E5E7EB" }} /> : null}
              </Stack>
              <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Skeleton variant="rounded" sx={{ width: 52, height: 16, borderRadius: "4px" }} />
                  <Skeleton variant="rounded" sx={{ width: 96, height: 16, borderRadius: "4px" }} />
                </Stack>
                <Skeleton variant="rounded" sx={{ width: "75%", height: 22, borderRadius: "4px" }} />
                <Skeleton variant="rounded" sx={{ width: "100%", height: 18, borderRadius: "4px" }} />
              </Stack>
            </StackRowAlignCenter>
          ))}
        </Box>

        <Box className={classes.sectionWrapper}>
          <Skeleton variant="rounded" sx={{ width: "72%", maxWidth: 360, height: 24, mb: 2, borderRadius: "4px" }} />
          {[0, 1].map((i) => (
            <StackRowAlignCenter
              key={i}
              sx={{
                gap: 2,
                py: 2,
                borderBottom: "1px solid #EEEEEE",
                alignItems: "flex-start",
              }}
            >
              <Skeleton
                variant="rounded"
                sx={{
                  width: { xs: 72, sm: 96 },
                  height: { xs: 72, sm: 96 },
                  borderRadius: "4px",
                  flexShrink: 0,
                }}
              />
              <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton variant="rounded" sx={{ width: "85%", height: 20, borderRadius: "4px" }} />
                <Skeleton variant="rounded" sx={{ width: "55%", height: 18, borderRadius: "4px" }} />
              </Stack>
            </StackRowAlignCenter>
          ))}
        </Box>

        <Box className={classes.sectionWrapper}>
          <Skeleton variant="rounded" sx={{ width: "100%", height: { xs: 120, sm: 140 }, borderRadius: "4px" }} />
        </Box>
      </StackAlignCenter>
    </StackRow>
  );
};

export default OrderReturnDetailSkeleton;
