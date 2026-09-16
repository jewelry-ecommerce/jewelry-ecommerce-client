"use client";

import { Header } from "@/components";
import { StackAlignJustCenter } from "@/components/styled";
import { Stack } from "@mui/material";
import { siteHeaderHeightCssVar } from "@/utils/constants/layout.constant";
import React from "react";

/** Figma Brand/Hearlock/100 — white → #ECECFE */
export const ERROR_PAGE_BACKGROUND =
  "linear-gradient(180deg, rgba(255, 255, 255, 0.52) 0.09%, rgba(0, 0, 0, 0) 0.09%), linear-gradient(90deg, rgba(255, 255, 255, 0.52) 0.05%, rgba(0, 0, 0, 0) 0.05%), linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 40%, #ECECFE 100%)";

/** Background tổng trang — gắn thẳng lên shell, không tách Box overlay */
export const ERROR_PAGE_BACKGROUND_SX = {
  backgroundColor: "#FFFFFF",
  backgroundImage: ERROR_PAGE_BACKGROUND,
} as const;

type ErrorShellLayoutProps = {
  children: React.ReactNode;
};

const ErrorShellLayout = ({ children }: ErrorShellLayoutProps) => {
  return (
    <Stack
      minHeight="100dvh"
      width="100%"
      sx={{
        ...ERROR_PAGE_BACKGROUND_SX,
        overflowY: "auto",
        // Header is position:fixed — same offset as main layout so content is not covered.
        paddingTop: siteHeaderHeightCssVar(),
        boxSizing: "border-box",
      }}
    >
      <Header />
      <StackAlignJustCenter
        flex={1}
        width="100%"
        sx={{
          py: { xs: 3, sm: 4 },
          boxSizing: "border-box",
          // Prefer centered layout; when content is taller than the viewport, keep the top visible.
          justifyContent: "safe center",
          minHeight: 0,
        }}
      >
        {children}
      </StackAlignJustCenter>
    </Stack>
  );
};

export default ErrorShellLayout;
