"use client";

import { Box, Skeleton } from "@mui/material";
import useStyles from "./product-collection-showcase.styles";
import { StackRowAlignCenter } from "@/components/styled";

type ProductCollectionShowcaseSkeletonProps = {
  count?: number;
};

const ProductCollectionShowcaseSkeleton = ({ count = 3 }: ProductCollectionShowcaseSkeletonProps) => {
  const { classes } = useStyles();

  return (
    <StackRowAlignCenter>
      {Array.from({ length: count }, (_, index) => (
        <Box key={`loading-${index}`} className={classes.loadingCardWrapper}>
          <Box className={classes.loadingCard}>
            <Skeleton variant="rectangular" animation="wave" className={classes.loadingCardMedia} />
          </Box>
          <Skeleton variant="text" animation="wave" className={classes.loadingCardTitle} />
        </Box>
      ))}
    </StackRowAlignCenter>
  );
};

export default ProductCollectionShowcaseSkeleton;
