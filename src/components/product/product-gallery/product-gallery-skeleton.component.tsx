import React from "react";
import { Box, Skeleton, Typography, useMediaQuery, useTheme } from "@mui/material";
import useStyles from "./product-gallery.styles";
import { ProductTitleSkeletonComponent } from "../product-title/product-title.component";

const ProductGallerySkeletonComponent = ({ count = 4 }) => {
  const { classes, cx } = useStyles();
  const theme = useTheme();
  const items = Array.from(new Array(count));

  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const showArrows = isDesktop ? count > 4 : isMobile ? count > 1 : count > 2;

  return (
    <Box className={classes.root}>
      <ProductTitleSkeletonComponent />

      <Box className={classes.carouselWrapper}>
        <Box className={classes.viewport}>
          <Box className={classes.container}>
            {items.map((_, index) => (
              <Box className={classes.slideItem} key={`gallery-item-skeleton-${index}`}>
                <Box className={classes.reviewCard}>
                  <Box className={classes.labelWrapper}>
                    <Typography className={classes.labelText}>
                      <Skeleton variant="text" width={80} />
                    </Typography>
                  </Box>

                  <Box className={classes.mediaWrapper}>
                    <Skeleton variant="rectangular" className={cx(classes.reviewMedia, "review-image")} />
                  </Box>
                </Box>
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

export default ProductGallerySkeletonComponent;
