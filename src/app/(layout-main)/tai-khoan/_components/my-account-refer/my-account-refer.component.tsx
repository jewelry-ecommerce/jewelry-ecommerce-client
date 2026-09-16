"use client";

import React from "react";
import { Box, Typography, useTheme, useMediaQuery, Stack } from "@mui/material";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { REFER_SHARE_CODE_DESCRIPTION } from "@/utils/constants/refer.constant";
import { toast } from "react-toastify";
import { StackRowAlignStartJustBetween } from "@/components/styled";
import { AuthUser } from "@/utils/api/auth/auth.interface";

interface MyAccountPreferProps {
  user: AuthUser | undefined;
}

const MyAccountPrefer = ({ user }: MyAccountPreferProps) => {
  // hook
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(810));

  // function
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Đã sao chép mã thành công");
  };

  return (
    <Stack id="gioi-thieu-ban-be" sx={{ gap: "24px" }}>
      {!isMobile && (
        <Typography
          sx={{
            ...TYPOGRAPHY_STYLES.xl.bold,
            color: "#27251F",
            textTransform: "uppercase",
          }}
        >
          Giới thiệu bạn bè
        </Typography>
      )}

      <Box sx={{ p: 2, backgroundColor: "#FAFAFA", mb: 2, width: "fit-content" }}>
        <StackRowAlignStartJustBetween gap={3}>
          <Stack sx={{ gap: 0.5 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: "#27251F", textTransform: "uppercase" }}>{user?.firstName}</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#737373" }}>{REFER_SHARE_CODE_DESCRIPTION}</Typography>
          </Stack>
          <Box
            onClick={() => handleCopy("123456")}
            component="button"
            sx={{
              ...TYPOGRAPHY_STYLES.base.bold,
              padding: "6px 12px",
              border: "1px solid #0A0A0A",
              cursor: "pointer",
              color: "#0A0A0A",
              whiteSpace: "nowrap",
              backgroundColor: "transparent",
            }}
          >
            Sao Chép Mã
          </Box>
        </StackRowAlignStartJustBetween>
      </Box>
    </Stack>
  );
};

export default MyAccountPrefer;
