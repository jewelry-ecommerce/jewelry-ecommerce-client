import React from "react";
import { Box, Skeleton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import ProductItemSkeletonComponent from "../product-item/product-item-skeleton.component";
import useStyles from "./product-slider.styles";
import { ProductTitleSkeletonComponent } from "../product-title/product-title.component";

export interface ProductSliderSkeletonProps {
  count?: number;
}

const ProductSliderSkeletonComponent = ({ count = 4 }: ProductSliderSkeletonProps) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const items = Array.from(new Array(count));

  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const showArrows = isDesktop ? count > 4 : count > 2;

  return (
    <Box className={classes.root}>
      <ProductTitleSkeletonComponent />

      <Box className={classes.carouselWrapper}>
        <Box className={classes.viewport}>
          <Box className={classes.container}>
            {items.map((_, index) => (
              <Box className={classes.slideItem} key={`slider-item-skeleton-${index}`}>
                <ProductItemSkeletonComponent />
              </Box>
            ))}
          </Box>
        </Box>

        {showArrows && (
          <React.Fragment>
            <Skeleton variant="circular" width={40} height={40} className={`${classes.navButton} ${classes.prevButton}`} />
            <Skeleton variant="circular" width={40} height={40} className={`${classes.navButton} ${classes.nextButton}`} />
          </React.Fragment>
        )}
      </Box>
    </Box>
  );
};

export default ProductSliderSkeletonComponent;
