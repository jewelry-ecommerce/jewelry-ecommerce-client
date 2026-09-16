import React from "react";
import { Box, Skeleton, useTheme, useMediaQuery } from "@mui/material";
import ProductInfoCardSkeletonComponent from "../product-info-card/product-info-card-skeleton.component";
import useStyles from "./product-info-slider.styles";
import { ProductTitleSkeletonComponent } from "../../product-title/product-title.component";

export interface ProductInfoSliderSkeletonProps {
  count?: number;
  itemsToShow?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  width?: number | string;
  height?: number | string;
}

const ProductInfoSliderSkeletonComponent = ({ count = 3, itemsToShow, width, height }: ProductInfoSliderSkeletonProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const showArrows = isDesktop ? count > 3 : isMobile ? count > 1 : count > 2;

  const { classes, cx } = useStyles({
    props: { itemsToShow, width, height, isDesktop },
  });

  const items = Array.from(new Array(count));
  return (
    <Box className={classes.root}>
      <ProductTitleSkeletonComponent />

      <Box className={classes.carouselWrapper}>
        <Box className={classes.viewport}>
          <Box className={classes.container}>
            {items.map((_, index) => (
              <Box className={cx(classes.slideItem, { [classes.firstSlide]: index === 0 })} key={`info-slider-skeleton-${index}`}>
                <ProductInfoCardSkeletonComponent />
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

export default ProductInfoSliderSkeletonComponent;
