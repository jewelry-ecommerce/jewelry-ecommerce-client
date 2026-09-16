"use client";

import { useStickyBelowHeaderTop } from "@/app/(layout-main)/san-pham/_components/hooks";
import { Box, type SxProps, type Theme } from "@mui/material";
import React from "react";

interface StickyBelowHeaderBarProps {
  children: React.ReactNode;
  zIndex?: number;
  sx?: SxProps<Theme>;
}

/** Thanh công cụ sticky ngay dưới header — chỉ dính khi scroll tới vị trí `top`. */
function StickyBelowHeaderBar({ children, zIndex = 90, sx }: StickyBelowHeaderBarProps) {
  const stickyTop = useStickyBelowHeaderTop();

  return (
    <Box
      sx={{
        position: "sticky",
        top: stickyTop,
        zIndex,
        width: "100%",
        backgroundColor: "#FFFFFF",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export default StickyBelowHeaderBar;
