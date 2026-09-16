"use client";

import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import useStyles from "./order-product-item.styles";
import { ButtonComponent } from "@/components/button/button.component";
import { StackAlignCenter, StackRow, StackRowAlignCenter } from "@/components/styled";
import OrderProductItemVariation from "./order-product-item-variation.component";
import type { OrderProductItemData } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-product-item.interface";

// Re-export để các file cùng folder tiếp tục import từ đây mà không cần thay đổi.
export type { OrderProductItemData };

export interface OrderProductItemProps {
  product: OrderProductItemData;
  onSelect: (product: OrderProductItemData) => void;
}

const OrderProductItem: React.FC<OrderProductItemProps> = ({ product, onSelect }) => {
  const { classes } = useStyles();
  const [isVariationModalOpen, setIsVariationModalOpen] = React.useState(false);

  const handleSelectVariation = (variation: any, productData: any) => {
    const variationId = String(variation.id || productData.id);
    onSelect({
      ...product,
      productId: variationId,
      variationId,
      productName: productData.name,
      image: variation.image || productData.image,
      sellingPriceAfterTaxMinor: variation.sellingPriceAfterTaxMinor,
      compareAtPriceAfterTaxMinor: variation.compareAtPriceAfterTaxMinor,
      attributes: variation.resolvedAttributes,
    });
  };

  return (
    <StackRowAlignCenter className={classes.root}>
      <Box className={classes.imageWrapper}>
        <Box component="img" src={product.image} alt={product.productName} className={classes.image} />
      </Box>

      <Stack className={classes.content}>
        <StackRow>
          <Typography className={classes.productName}>{product.productName}</Typography>
        </StackRow>
        <StackRowAlignCenter className={classes.priceWrapper}>
          <Typography className={classes.salePrice}>{Number(product.sellingPriceAfterTaxMinor).toLocaleString()}đ</Typography>
          {product.compareAtPriceAfterTaxMinor && product.compareAtPriceAfterTaxMinor !== product.sellingPriceAfterTaxMinor && (
            <Typography className={classes.originalPrice}>{Number(product.compareAtPriceAfterTaxMinor).toLocaleString()}đ</Typography>
          )}
        </StackRowAlignCenter>
      </Stack>

      <ButtonComponent
        className={classes.selectButton}
        onClick={() => setIsVariationModalOpen(true)}
        content={product.stockStatus === "IN_STOCK" ? "Chọn" : "Hết hàng"}
        disabled={product.stockStatus !== "IN_STOCK"}
        sx={{
          backgroundColor: product.stockStatus === "IN_STOCK" ? "#F5F5F5" : "#EEEEEE",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: product.stockStatus === "IN_STOCK" ? "#F5F5F5" : "#EEEEEE",
            boxShadow: "none",
          },
        }}
      />

      <OrderProductItemVariation
        open={isVariationModalOpen}
        onClose={() => setIsVariationModalOpen(false)}
        slug={product.slug}
        onSelect={handleSelectVariation}
      />
    </StackRowAlignCenter>
  );
};

export default OrderProductItem;
