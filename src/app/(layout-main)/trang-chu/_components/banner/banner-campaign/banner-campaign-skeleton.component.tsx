import React from "react";
import { Box, Stack, Skeleton } from "@mui/material";
import useStyles from "./banner-campaign.styles";

export interface BannerCampaignSkeletonProps {
  count?: number;
}

const BannerCampaignSkeletonComponent = ({ count = 2 }: BannerCampaignSkeletonProps) => {
  const { classes } = useStyles();

  const items = Array.from(new Array(count));

  return (
    <Stack className={classes.root} direction={{ xs: "column", lg: "row" }}>
      {items.map((_, index) => (
        <Box key={`campaign-skeleton-${index}`} className={classes.bannerItem}>
          <Box className={classes.imageWrapper}>
            <Skeleton variant="rectangular" width="100%" height="100%" />
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

export default BannerCampaignSkeletonComponent;
