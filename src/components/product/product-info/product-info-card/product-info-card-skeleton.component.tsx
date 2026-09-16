import React from "react";
import { Box, Skeleton } from "@mui/material";
import useStyles from "./product-info-card.styles";
import { PRODUCT_INFO_CARD_ASPECT_RATIO } from "./product-info-card.constants";

export interface ProductInfoCardSkeletonProps {
  width?: number | string | Record<string, number | string>;
  height?: number | string | Record<string, number | string>;
  aspectRatio?: string | number;
  className?: string;
}

const ProductInfoCardSkeletonComponent = ({
  width,
  height,
  aspectRatio = PRODUCT_INFO_CARD_ASPECT_RATIO,
  className,
}: ProductInfoCardSkeletonProps) => {
  const { classes, cx } = useStyles({
    props: { width, height, isLink: false },
  });

  return (
    <Box className={cx(classes.root, className)}>
      <Box className={classes.mediaWrapper} sx={{ aspectRatio: aspectRatio }}>
        <Skeleton variant="rectangular" className={classes.media} />
      </Box>

      <Box className={classes.contentWrapper}>
        <Box className={classes.textGroup}>
          <Box className={classes.title}>
            <Skeleton variant="text" width="80%" />
          </Box>
          <Box className={classes.subtitle}>
            <Skeleton variant="text" width="60%" />
          </Box>
        </Box>
        <Box>
          <Box className={classes.actionLabel} sx={{ textDecoration: "none !important" }}>
            <Skeleton variant="text" width={80} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductInfoCardSkeletonComponent;
