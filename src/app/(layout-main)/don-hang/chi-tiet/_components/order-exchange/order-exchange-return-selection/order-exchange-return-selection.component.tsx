import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { OrderDetailResponse, OrderDetailItem } from "@/utils/api/checkout/checkout.interface";
import OrderExchangeItem from "../order-exchange-item/order-exchange-item.component";
import CheckboxComponent from "@/components/checkbox/checkbox.component";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import useStyles from "./order-exchange-return-selection.styles";

interface ExchangeReturnSelectionProps {
  order: OrderDetailResponse;
  selectedItems: string[];
  exchangeQuantities: Record<string, number>;
  onToggleItem: (itemId: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onSelectAll: (checked: boolean) => void;
  onNext: () => void;
  onBack?: () => void;
  sectionTitle?: string;
}

function ExchangeReturnSelection({
  order,
  selectedItems,
  exchangeQuantities,
  onToggleItem,
  onQuantityChange,
  onSelectAll,
  onNext,
  onBack,
  sectionTitle = "Chọn sản phẩm bạn muốn trả",
}: ExchangeReturnSelectionProps) {
  const { classes } = useStyles();

  return (
    <Box>
      <Typography className={classes.sectionTitle}>{sectionTitle}</Typography>
      <Box className={classes.card}>
        <Box className={classes.selectAllRow}>
          <CheckboxComponent
            variant="outlined"
            checked={selectedItems.length > 0}
            iconType={selectedItems.length > 0 && selectedItems.length < order.items.length ? "minus" : "check"}
            onChange={onSelectAll}
            title={`Chọn tất cả (${order.items.length})`}
            sxLabel={{ ...TYPOGRAPHY_STYLES.md.medium, color: "#27251F" }}
            sxCheckbox={{
              backgroundColor: selectedItems.length > 0 ? "#000000" : "transparent",
              borderColor: selectedItems.length > 0 ? "#000000" : "#DEDEDE",
              color: "#000000",
              borderRadius: "4px",
            }}
            size={20}
          />
        </Box>
        <Box>
          {order.items.map((item: OrderDetailItem) => (
            <OrderExchangeItem
              key={item.id}
              item={item}
              isSelected={selectedItems.includes(item.id)}
              exchangeQuantity={exchangeQuantities[item.id] ?? (item.quantity > 0 ? item.quantity : 1)}
              onToggleSelect={onToggleItem}
              onQuantityChange={onQuantityChange}
            />
          ))}
        </Box>
      </Box>

      <Box className={classes.stickyFooter}>
        <Box className={classes.footerContent}>
          {onBack ? (
            <Button className={classes.secondaryButton} onClick={onBack}>
              Quay Lại
            </Button>
          ) : null}
          <Button className={classes.primaryButton} disabled={selectedItems.length === 0} onClick={onNext}>
            Đã Chọn {selectedItems.length} - Tiếp Tục
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ExchangeReturnSelection;
