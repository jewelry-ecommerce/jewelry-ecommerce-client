"use client";

import { Box, Skeleton } from "@mui/material";
import useStyles from "./product-grid.styles";
import ProductItemSkeletonComponent from "../product-item/product-item-skeleton.component";

type ProductGridSkeletonProps = {
  count?: number;
};

const ProductGridSkeleton = ({ count = 8 }: ProductGridSkeletonProps) => {
  const { classes } = useStyles();

  const skeletonItems: Array<{ type: "product"; id: string } | { type: "banner"; id: string; position: "left" | "right" }> = [];

  for (let i = 0; i < count; i += count) {
    const rowCount = Math.min(count, count - i);

    for (let productIndex = 0; productIndex < rowCount; productIndex += 1) {
      skeletonItems.push({
        type: "product",
        id: `loading-${i + productIndex}`,
      });
    }
  }

  return (
    <Box className={classes.root}>
      <Box className={classes.gridContainer}>
        {skeletonItems.map((item) => {
          return (
            <Box key={item.id} className={classes.productGrid}>
              <Box className={classes.loadingProductCard}>
                <ProductItemSkeletonComponent />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ProductGridSkeleton;
