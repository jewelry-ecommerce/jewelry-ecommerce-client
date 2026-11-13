"use client";

import AiSourceBanner from "@/components/ai/ai-source-banner.component";
import { ButtonComponent } from "@/components/button/button.component";
import type { AiRecommendation, AiStylistResponse } from "@/utils/api/ai/ai.interface";
import { Box, Stack, Typography } from "@mui/material";
import StylistCard from "./stylist-card.component";

type StylistResultsProps = {
  result: AiStylistResponse;
  selectedIds: number[];
  canFeedback: boolean;
  onToggle: (productId: number) => void;
  onOpenDetail: (item: AiRecommendation) => void;
  onCreateSet: () => void;
};

const StylistResults = ({ result, selectedIds, canFeedback, onToggle, onOpenDetail, onCreateSet }: StylistResultsProps) => (
  <Stack sx={{ gap: "20px" }}>
    <AiSourceBanner source={result.source} banner={result.banner} />
    <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", gap: "12px" }}>
      <Typography>{result.recommendations.length} gợi ý</Typography>
      <ButtonComponent content="Phối thành một bộ" onClick={onCreateSet} />
    </Stack>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: "16px" }}>
      {result.recommendations.map((item) => (
        <StylistCard
          key={item.id}
          item={item}
          selected={selectedIds.includes(item.id)}
          sessionId={result.sessionId}
          canFeedback={canFeedback}
          onToggle={onToggle}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </Box>
  </Stack>
);

export default StylistResults;
