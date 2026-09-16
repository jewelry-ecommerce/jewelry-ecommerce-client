import React, { useState } from "react";
import { Box, Typography, CircularProgress, ClickAwayListener, Button } from "@mui/material";
import { ChevronDown } from "@untitledui/icons";
import { OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import OrderExchangeItem from "../order-exchange-item/order-exchange-item.component";
import OrderProductItem, { OrderProductItemData } from "../order-product-item/order-product-item.component";
import useStyles from "./order-exchange-replacement.styles";

interface ExchangeReplacementSelectionProps {
  order: OrderDetailResponse;
  selectedItems: string[];
  exchangeQuantities: Record<string, number>;
  replacementProducts: OrderProductItemData[];
  replacementQuantities: Record<string, number>;
  availableProducts: OrderProductItemData[];
  isProductsLoading: boolean;
  onAddReplacement: (product: OrderProductItemData) => void;
  onRemoveReplacement: (productId: string) => void;
  onReplacementQuantityChange: (productId: string, quantity: number | null) => void;
  priceDifference: number;
  onBack: () => void;
  onNext: () => void;
}

const ExchangeReplacementSelection: React.FC<ExchangeReplacementSelectionProps> = ({
  order,
  selectedItems,
  exchangeQuantities,
  replacementProducts,
  replacementQuantities,
  availableProducts,
  isProductsLoading,
  onAddReplacement,
  onRemoveReplacement,
  onReplacementQuantityChange,
  priceDifference,
  onBack,
  onNext,
}) => {
  const { classes } = useStyles();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <Box>
      <Box className={classes.summarySection}>
        <Typography className={classes.sectionTitle}>Sản phẩm bạn muốn trả</Typography>
        <Box sx={{ mt: 2 }}>
          {selectedItems.map((id) => {
            const item = order.items.find((i) => i.id === id);
            if (!item) return null;
            return (
              <OrderExchangeItem
                key={item.id}
                item={item}
                isSelected={true}
                exchangeQuantity={exchangeQuantities[id] ?? 1}
                onToggleSelect={() => {}}
                onQuantityChange={() => {}}
                showQuantitySpinner={false}
                showCheckbox={false}
              />
            );
          })}
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography className={classes.sectionTitle}>Chọn sản phẩm bạn muốn đổi sang</Typography>

        <ClickAwayListener onClickAway={() => setIsDropdownOpen(false)}>
          <Box className={classes.selectorWrapper}>
            <Box className={classes.selectorTrigger} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {replacementProducts.length > 0 ? `Đã chọn ${replacementProducts.length} sản phẩm` : "Chọn sản phẩm đổi sang"}
              <ChevronDown size={18} color="#27251F" />
            </Box>
            {isDropdownOpen && (
              <Box className={classes.selectorMenu}>
                {isProductsLoading ? (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <CircularProgress size={24} color="inherit" />
                  </Box>
                ) : (
                  availableProducts.map((product) => (
                    <OrderProductItem key={product.productId} product={product} onSelect={onAddReplacement} />
                  ))
                )}
              </Box>
            )}
          </Box>
        </ClickAwayListener>

        <Box sx={{ mt: 5 }}>
          {replacementProducts.map((product) => (
            <OrderExchangeItem
              key={product.productId}
              item={product}
              exchangeQuantity={replacementQuantities[product.productId] || 1}
              onQuantityChange={(id, qty) => onReplacementQuantityChange(id, qty)}
              onRemove={onRemoveReplacement}
              showCheckbox={false}
            />
          ))}
        </Box>
      </Box>

      <Box className={classes.stickyFooter}>
        <Box className={classes.footerContent}>
          <Button className={classes.secondaryButton} onClick={onBack}>
            Quay Lại
          </Button>
          <Button className={classes.primaryButton} disabled={replacementProducts.length === 0} onClick={onNext}>
            Chênh Lệch {priceDifference > 0 ? "+" : ""}
            {priceDifference.toLocaleString()}đ - Tiếp Tục
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ExchangeReplacementSelection;
