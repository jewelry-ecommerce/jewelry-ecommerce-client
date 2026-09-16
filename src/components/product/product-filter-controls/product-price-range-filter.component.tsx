"use client";

import { Box, Slider, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { formatPrice } from "@/utils/constants/common.constant";
import {
  DEFAULT_PRODUCT_PRICE_RANGE,
  PRODUCT_PRICE_FILTER_MAX,
  PRODUCT_PRICE_FILTER_MIN,
  PRODUCT_PRICE_FILTER_STEP,
  snapProductPriceRange,
  type ProductPriceRange,
} from "@/utils/constants/product-price-filter.constant";

import useStyles from "./product-filter-controls.styles";

type ProductPriceRangeFilterProps = {
  value: ProductPriceRange;
  onChangeCommitted: (range: ProductPriceRange) => void;
};

const formatPriceRangeLabel = (range: ProductPriceRange): string => `Từ ${formatPrice(range[0])} - Đến ${formatPrice(range[1])}`;

export const formatProductPriceRangeChipLabel = (range: ProductPriceRange): string => `${formatPrice(range[0])} - ${formatPrice(range[1])}`;

const ProductPriceRangeFilter = ({ value, onChangeCommitted }: ProductPriceRangeFilterProps) => {
  const { classes } = useStyles();
  const [localRange, setLocalRange] = useState<ProductPriceRange>(value);

  useEffect(() => {
    setLocalRange(snapProductPriceRange(value));
  }, [value]);

  const handleSliderChange = (_event: Event, nextValue: number | number[]) => {
    if (!Array.isArray(nextValue) || nextValue.length !== 2) return;
    setLocalRange(snapProductPriceRange([nextValue[0], nextValue[1]]));
  };

  const handleSliderCommit = (_event: Event | React.SyntheticEvent, nextValue: number | number[]) => {
    if (!Array.isArray(nextValue) || nextValue.length !== 2) return;
    onChangeCommitted(snapProductPriceRange([nextValue[0], nextValue[1]]));
  };

  return (
    <Box className={classes.priceRangeSection}>
      <Typography className={classes.priceRangeLabel}>{formatPriceRangeLabel(localRange)}</Typography>
      <Slider
        value={[localRange[0], localRange[1]]}
        min={PRODUCT_PRICE_FILTER_MIN}
        max={PRODUCT_PRICE_FILTER_MAX}
        step={PRODUCT_PRICE_FILTER_STEP}
        onChange={handleSliderChange}
        onChangeCommitted={handleSliderCommit}
        valueLabelDisplay="off"
        className={classes.priceRangeSlider}
        disableSwap
      />
    </Box>
  );
};

export { formatPriceRangeLabel };
export default ProductPriceRangeFilter;
