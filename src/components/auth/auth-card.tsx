"use client";

import { Box, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

type AuthCardProps = {
  children: ReactNode;
  sx?: SxProps<Theme>;
};

/** Khung card trắng viền xám — dùng chung login / quên MK / OTP. */
export function AuthCard({ children, sx }: AuthCardProps) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 512,
        mx: "auto",
        bgcolor: "#fff",
        border: "1px solid #E5E5E5",
        borderRadius: 0,
        p: { xs: "16px", md: "16px 24px 24px 24px" },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
