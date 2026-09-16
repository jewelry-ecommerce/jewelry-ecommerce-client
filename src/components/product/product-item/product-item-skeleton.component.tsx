import { Box, Skeleton } from "@mui/material";
import React from "react";
import useStyles from "./product-item.styles";

export const ProductItemSkeletonComponent = () => {
  const { classes } = useStyles({});

  return (
    <Box className={classes.root}>
      <Box className={classes.imageSection}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>

      <Box className={classes.infoSection}>
        <Box sx={{ height: 36 }}>
          <Skeleton variant="text" width="90%" />
        </Box>

        <Box className={classes.priceColorBox}>
          <Box className={classes.priceRow}>
            <Skeleton variant="text" width={70} />
            <Skeleton variant="text" width={50} />
          </Box>
          <Box className={classes.colorPalette}>
            <Skeleton variant="rectangular" className={classes.colorDot} />
            <Skeleton variant="rectangular" className={classes.colorDot} />
            <Skeleton variant="rectangular" className={classes.colorDot} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductItemSkeletonComponent;
