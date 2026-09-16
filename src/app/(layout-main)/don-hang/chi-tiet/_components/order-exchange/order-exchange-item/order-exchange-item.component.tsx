"use client";

import React from "react";
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import NumberSpinner from "@/components/number-spinner/number-spinner";
import useStyles from "./order-exchange-item.styles";
import {
  StackAlignCenter,
  StackAlignStartJustBetween,
  StackRowAlignCenter,
  StackRowAlignCenterJustBetween,
  StackRowAlignStartJustBetween,
} from "@/components/styled";
import CheckboxComponent from "@/components/checkbox/checkbox.component";
import { Trash03 } from "@untitledui/icons";
import {
  exchangeLineUnitCompareAtPrice,
  exchangeLineUnitSalePrice,
} from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-pricing.util";

export interface OrderExchangeItemProps {
  item: any;
  isSelected?: boolean;
  exchangeQuantity: number;
  onToggleSelect?: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
  showQuantitySpinner?: boolean;
  showCheckbox?: boolean;
  hideOriginalQuantity?: boolean;
}

const OrderExchangeItem: React.FC<OrderExchangeItemProps> = ({
  item,
  isSelected = false,
  exchangeQuantity,
  onToggleSelect,
  onQuantityChange,
  onRemove,
  showQuantitySpinner = true,
  showCheckbox = true,
  hideOriginalQuantity = false,
}) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(810));

  const handleQuantityChange = (value: number | null) => {
    if (value !== null) {
      onQuantityChange(item.id || item.productId, value);
    }
  };

  const saleUnit = exchangeLineUnitSalePrice(item);
  const compareAtUnit = exchangeLineUnitCompareAtPrice(item);
  const showCompareAtPrice = compareAtUnit > 0 && compareAtUnit !== saleUnit;
  const MainContentStack = isMobile ? StackAlignStartJustBetween : StackRowAlignStartJustBetween;
  const RightActionsStack = isMobile ? StackRowAlignCenterJustBetween : StackRowAlignCenter;

  return (
    <Box
      className={classes.root}
      onClick={() => showCheckbox && onToggleSelect && onToggleSelect(item.id || item.productId)}
      sx={{ cursor: showCheckbox ? "pointer" : "default" }}
    >
      {showCheckbox && (
        <Box className={classes.checkboxWrapper}>
          <CheckboxComponent
            checked={isSelected}
            onChange={() => onToggleSelect && onToggleSelect(item.id || item.productId)}
            size={20}
            sxCheckbox={{
              backgroundColor: isSelected ? "#000000" : "transparent",
              borderColor: isSelected ? "#000000" : "#DEDEDE",
            }}
          />
        </Box>
      )}

      <Box className={classes.imageWrapper}>
        <Box component="img" src={item.image} alt={item.productName} className={classes.image} />
      </Box>

      <MainContentStack className={classes.mainContent}>
        <Stack className={classes.infoWrapper}>
          {isMobile && onRemove ? (
            <StackRowAlignStartJustBetween sx={{ width: "100%", gap: 1, alignItems: "flex-start" }}>
              <Typography className={classes.productName} sx={{ flex: 1, minWidth: 0 }}>
                {item.productName}
              </Typography>
              <Box
                sx={{ cursor: "pointer", color: "#999", flexShrink: 0, lineHeight: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id || item.productId);
                }}
              >
                <Trash03 size={20} color="#000000" />
              </Box>
            </StackRowAlignStartJustBetween>
          ) : (
            <Typography className={classes.productName}>{item.productName}</Typography>
          )}
          <Stack className={classes.variantWrapper}>
            {item.attributes?.map((attr: any) => (
              <Typography key={attr.attributeCode} className={classes.variantInfo}>
                {attr.attributeName}: {attr.value}
              </Typography>
            ))}
          </Stack>
          {!hideOriginalQuantity && exchangeQuantity > 0 ? (
            <Typography className={classes.originalQuantity}>x{exchangeQuantity}</Typography>
          ) : null}
        </Stack>

        <RightActionsStack className={classes.rightActions}>
          {isMobile ? (
            <>
              <Stack className={classes.priceWrapper}>
                <Typography className={classes.salePrice}>{saleUnit.toLocaleString()}đ</Typography>
                {showCompareAtPrice && <Typography className={classes.originalPrice}>{compareAtUnit.toLocaleString()}đ</Typography>}
              </Stack>
              {showQuantitySpinner && (
                <StackAlignCenter onClick={(e) => e.stopPropagation()}>
                  <NumberSpinner
                    value={exchangeQuantity}
                    min={1}
                    max={item.quantity || 999}
                    onValueChange={handleQuantityChange}
                    isMiniCart={true}
                  />
                </StackAlignCenter>
              )}
            </>
          ) : (
            <>
              {showQuantitySpinner && (
                <StackAlignCenter onClick={(e) => e.stopPropagation()}>
                  <NumberSpinner
                    value={exchangeQuantity}
                    min={1}
                    max={item.quantity || 999}
                    onValueChange={handleQuantityChange}
                    isMiniCart={true}
                  />
                </StackAlignCenter>
              )}

              <Stack className={classes.priceWrapper}>
                <Typography className={classes.salePrice}>{saleUnit.toLocaleString()}đ</Typography>
                {showCompareAtPrice && <Typography className={classes.originalPrice}>{compareAtUnit.toLocaleString()}đ</Typography>}
              </Stack>

              {onRemove && (
                <Box
                  sx={{ cursor: "pointer", color: "#999", ml: 2, mr: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item.id || item.productId);
                  }}
                >
                  <Trash03 size={20} color="#000000" />
                </Box>
              )}
            </>
          )}
        </RightActionsStack>
      </MainContentStack>
    </Box>
  );
};

export default OrderExchangeItem;
