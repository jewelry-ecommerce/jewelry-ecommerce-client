import React from "react";
import { Box, Skeleton } from "@mui/material";
import useStyles from "./banner-hero.styles";
import { buildHeroSlotAspectRatio } from "./banner-hero.constants";

export interface BannerHeroSkeletonProps {
  count?: number;
}

const BannerHeroSkeletonComponent = ({ count = 4 }: BannerHeroSkeletonProps) => {
  const { classes } = useStyles();
  const items = Array.from({ length: count });

  return (
    <Box className={classes.root}>
      <Box className={classes.gridContainer}>
        {items.map((_, index) => {
          const isLastOdd = items.length % 2 !== 0 && index === items.length - 1;
          const mobileSpanWidth = isLastOdd ? 2 : 1;
          const gridStyle: React.CSSProperties = {
            gridColumn: isLastOdd ? "span 2" : "span 1",
            aspectRatio: buildHeroSlotAspectRatio(mobileSpanWidth, 1),
          };

          return (
            <Box key={`hero-skeleton-${index}`} className={classes.gridItem} style={gridStyle}>
              <Box className={classes.mediaWrapper}>
                <Skeleton variant="rectangular" width="100%" height="100%" />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default BannerHeroSkeletonComponent;
