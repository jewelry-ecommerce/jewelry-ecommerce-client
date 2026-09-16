"use client";

import { Box, Skeleton } from "@mui/material";
import useStyles from "./category-scroller.styles";

type CategoryScrollerSkeletonProps = {
  count?: number;
};

const CategoryScrollerSkeletonComponent = ({ count = 12 }: CategoryScrollerSkeletonProps) => {
  const { classes } = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.titleWrapper}>
        <Skeleton variant="text" width={200} height={32} />
      </Box>

      <Box className={classes.embla}>
        <Box className={classes.emblaContainer}>
          {Array.from({ length: count }, (_, index) => (
            <Box key={`loading-${index}`} className={classes.card}>
              <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 0 }} />
              <Skeleton variant="rectangular" className={classes.cardLabelBox} sx={{ borderRadius: 0 }} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CategoryScrollerSkeletonComponent;
