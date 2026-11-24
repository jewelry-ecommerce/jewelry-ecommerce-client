"use client";

import AiSourceBanner from "@/components/ai/ai-source-banner.component";
import type { AiRecommendation, AiStylistResponse } from "@/utils/api/ai/ai.interface";
import { Box, Stack, Typography } from "@mui/material";
import StylistCard from "./stylist-card.component";

type StylistResultsProps = {
  result: AiStylistResponse;
  canFeedback: boolean;
  onOpenDetail: (item: AiRecommendation) => void;
};

const StylistResults = ({ result, canFeedback, onOpenDetail }: StylistResultsProps) => (
  <Stack sx={{ gap: "20px" }}>
    <AiSourceBanner source={result.source} banner={result.banner} />
    <Typography>{result.recommendations.length} gợi ý</Typography>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: "16px" }}>
      {result.recommendations.map((item) => (
        <StylistCard
          key={item.id}
          item={item}
          sessionId={result.sessionId}
          canFeedback={canFeedback}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </Box>
  </Stack>
);

export default StylistResults;
