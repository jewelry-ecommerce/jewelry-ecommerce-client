"use client";

import { AI_FALLBACK_BANNER, AI_FALLBACK_SOURCE } from "@/utils/api/ai/ai.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { Typography } from "@mui/material";

type AiSourceBannerProps = {
  source: string;
  banner?: string;
};

const AiSourceBanner = ({ source, banner }: AiSourceBannerProps) => {
  const text = source === AI_FALLBACK_SOURCE ? banner?.trim() || AI_FALLBACK_BANNER : banner?.trim();
  if (!text) return null;
  return (
    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: "#92400E", backgroundColor: "#FEF3C7", px: 2, py: 1 }}>
      {text}
    </Typography>
  );
};

export default AiSourceBanner;
