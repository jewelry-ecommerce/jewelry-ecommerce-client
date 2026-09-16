import { Box, Typography, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";
import {
  DiscountPercentTag,
  resolveCartItemDiscountPercent,
} from "@/components/product/discount-percent-tag/discount-percent-tag.component";
import { shouldShowDiscountPercentTag } from "@/utils/customer-display-price.util";
import type { CartItemPrice } from "@/utils/api/cart/cart.interface";

interface CartItemPriceRowProps {
  price: CartItemPrice;
  classes: {
    currentPrice: string;
    originalPriceRow: string;
    originalPrice: string;
  };
  currentPriceSx?: SxProps<Theme>;
  originalPriceSx?: SxProps<Theme>;
  originalPriceAdornment?: ReactNode;
}

export function CartItemPriceRow({ price, classes, currentPriceSx, originalPriceSx, originalPriceAdornment }: CartItemPriceRowProps) {
  const discountPercent = resolveCartItemDiscountPercent(price);
  const showOriginalRow = Boolean(price.original) || Boolean(discountPercent) || Boolean(originalPriceAdornment);
  const showDiscountPercentTag = shouldShowDiscountPercentTag({
    showDiscountPercent: price.showDiscountPercent,
    hasDiscount: price.hasDiscount,
    discountPercent: price.discountPercent,
  });

  return (
    <>
      <Typography className={classes.currentPrice} sx={currentPriceSx}>
        {price.current}
      </Typography>
      {showOriginalRow ? (
        <Box className={classes.originalPriceRow}>
          {price.original ? (
            <Typography className={classes.originalPrice} sx={originalPriceSx}>
              {price.original}
            </Typography>
          ) : null}
          {showDiscountPercentTag && <DiscountPercentTag discountPercent={price.discountPercent} />}
          {originalPriceAdornment}
        </Box>
      ) : null}
    </>
  );
}
