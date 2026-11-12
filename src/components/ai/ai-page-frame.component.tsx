"use client";

import { BreadcrumbComponent } from "@/components";
import { Box, Stack, Typography } from "@mui/material";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import type { ReactNode } from "react";

type AiPageFrameProps = {
  currentLabel: string;
  title: string;
  parent?: { label: string; href: string };
  children: ReactNode;
};

const AiPageFrame = ({ currentLabel, title, parent, children }: AiPageFrameProps) => {
  const items = [
    { label: "Trang chủ", href: "/" },
    ...(parent ? [parent] : []),
    { label: currentLabel },
  ];

  return (
    <Box>
      <BreadcrumbComponent items={items} />
      <Box sx={{ maxWidth: "1392px", width: "100%", margin: "0 auto", padding: { xs: "24px 16px 56px", md: "32px 24px 72px" } }}>
        <Stack sx={{ gap: "28px" }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES["2xl"].bold, color: "#27251F", textTransform: "uppercase" }}>{title}</Typography>
          {children}
        </Stack>
      </Box>
    </Box>
  );
};

export default AiPageFrame;
