"use client";
import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Button,
  Stack,
  Divider,
  TextField,
} from "@mui/material";
import { ChevronDown, Camera01 } from "@untitledui/icons";
import { OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import OrderExchangeItem from "../order-exchange-item/order-exchange-item.component";
import { OrderProductItemData } from "../order-product-item/order-product-item.component";
import useStyles from "./order-exchange-confirmation.styles";
import TextFieldDropdownComponent from "@/components/text-field/text-field-dropdown.component";
import TextFieldUploadImagesComponent, { TextFieldUploadImagesValue } from "@/components/text-field/text-field-upload-images.component";
import { StackAlignCenter } from "@/components/styled";
import OrderExchangeAddress from "./order-exchange-address/order-exchange-address.component";
import type { PickupAddressValues } from "./order-exchange-address/order-exchange-address.types";
import { pickupAddressDefaultsFromOrder } from "./order-exchange-address/order-exchange-address.types";
import { normalizePickupAddressValues } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-return-pickup.interface";
import OrderExchangeSummary from "./order-exchange-summary/order-exchange-summary.component";
import OrderRefundSummary from "./order-refund-summary/order-refund-summary.component";
import { useOrderExchangeShipping } from "@/hooks/order/use-order-exchange-shipping.hook";
import { OrderReturnReason, type OrderExchangeReasonOption } from "@/utils/api/order/order.enum";
import OrderRefundBankInfo from "./order-refund-bank-info.component";
import {
  EMPTY_REFUND_BANK_VALUES,
  isRefundBankFormValid,
  isRefundBankRequired,
  type OrderReturnRefundBankValues,
} from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-refund-bank.util";

const EXCHANGE_SHIPPING_FALLBACK_VND = 20_000;

export type OrderReturnConfirmationVariant = "exchange" | "refund";

interface ExchangeConfirmationProps {
  variant?: OrderReturnConfirmationVariant;
  order: OrderDetailResponse;
  selectedItems: string[];
  exchangeQuantities: Record<string, number>;
  replacementProducts?: OrderProductItemData[];
  replacementQuantities?: Record<string, number>;
  exchangeReasonOptions: OrderExchangeReasonOption[];
  selectedReason: string;
  onReasonChange: (reason: string) => void;
  note: string;
  onNoteChange: (note: string) => void;
  evidenceImages: TextFieldUploadImagesValue[];
  onEvidenceImagesChange: (images: TextFieldUploadImagesValue[]) => void;
  totalPriceToReturn: number;
  priceDifference: number;
  refundedLoyaltyPoints?: number;
  isSubmitting: boolean;
  isEvidenceUploading?: boolean;
  initialPickupAddress?: PickupAddressValues;
  onPickupAddressChange?: (values: PickupAddressValues) => void;
  onBack: () => void;
  onSubmit: (pickupAddress: PickupAddressValues, refundBank?: OrderReturnRefundBankValues) => void;
}

const ExchangeConfirmation: React.FC<ExchangeConfirmationProps> = ({
  variant = "exchange",
  order,
  selectedItems,
  exchangeQuantities,
  replacementProducts = [],
  replacementQuantities = {},
  exchangeReasonOptions,
  selectedReason,
  onReasonChange,
  note,
  onNoteChange,
  evidenceImages,
  onEvidenceImagesChange,
  totalPriceToReturn,
  priceDifference,
  refundedLoyaltyPoints = 0,
  isSubmitting,
  isEvidenceUploading = false,
  initialPickupAddress,
  onPickupAddressChange,
  onBack,
  onSubmit,
}) => {
  const { classes } = useStyles();
  const isRefund = variant === "refund";
  const requiresRefundBank = isRefund && isRefundBankRequired(order.paymentMethod);
  const [pickupAddress, setPickupAddress] = useState<PickupAddressValues>(() =>
    normalizePickupAddressValues(initialPickupAddress ?? pickupAddressDefaultsFromOrder(order)),
  );
  const [pickupAddressValid, setPickupAddressValid] = useState(false);
  const [refundBank, setRefundBank] = useState<OrderReturnRefundBankValues>(EMPTY_REFUND_BANK_VALUES);
  const isRefundBankValid = !requiresRefundBank || isRefundBankFormValid(refundBank);

  const handlePickupAddressUpdate = useCallback(
    (values: PickupAddressValues, isValid: boolean) => {
      setPickupAddress(values);
      setPickupAddressValid(isValid);
      onPickupAddressChange?.(values);
    },
    [onPickupAddressChange],
  );

  /** Chỉ lý do "Đổi ý" mới quote phí ship; cần đã chọn lý do + địa chỉ hợp lệ. */
  const fetchShippingFee = selectedReason === OrderReturnReason.CHANGED_MIND && pickupAddressValid;

  const {
    shippingFee,
    isLoading: isExchangeShipLoading,
    error: exchangeShipError,
  } = useOrderExchangeShipping({
    order,
    pickupAddress,
    pickupAddressValid,
    selectedItems,
    exchangeQuantities,
    replacementProducts,
    replacementQuantities,
    fetchShippingFee,
  });

  const quotedShippingFee = useMemo(() => {
    if (selectedReason !== OrderReturnReason.CHANGED_MIND) return 0;
    if (!pickupAddressValid) return 0;
    if (exchangeShipError && !isExchangeShipLoading) return EXCHANGE_SHIPPING_FALLBACK_VND;
    return shippingFee;
  }, [selectedReason, pickupAddressValid, exchangeShipError, isExchangeShipLoading, shippingFee]);

  return (
    <Box className={classes.root}>
      <Accordion className={classes.accordion} defaultExpanded>
        <AccordionSummary expandIcon={<ChevronDown size={20} />} className={classes.accordionSummary}>
          <Typography className={classes.accordionTitle}>{isRefund ? "Chi tiết sản phẩm hoàn tiền" : "Chi tiết sản phẩm đổi"}</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
          <Box>
            <Typography className={classes.sectionTitle}>{isRefund ? "Sản phẩm hoàn tiền" : "Sản phẩm bạn muốn trả"}</Typography>
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
          {!isRefund && replacementProducts.length > 0 ? (
            <Box>
              <Typography className={classes.sectionTitle}>Sản phẩm bạn muốn đổi sang</Typography>
              {replacementProducts.map((product) => (
                <OrderExchangeItem
                  key={product.productId}
                  item={product}
                  isSelected={true}
                  exchangeQuantity={replacementQuantities[product.productId] || 1}
                  onToggleSelect={() => {}}
                  onQuantityChange={() => {}}
                  showQuantitySpinner={false}
                  showCheckbox={false}
                />
              ))}
            </Box>
          ) : null}
        </AccordionDetails>
      </Accordion>

      <Stack className={classes.reasonSection}>
        <Typography className={classes.sectionTitle}>{isRefund ? "Chọn lý do hoàn tiền" : "Chọn lý do đổi hàng"}</Typography>
        <StackAlignCenter className={classes.reasonSelect}>
          <TextFieldDropdownComponent
            required
            value={selectedReason}
            options={exchangeReasonOptions.map((o) => ({ value: o.value, label: o.label }))}
            onSelect={onReasonChange}
            label={isRefund ? "Chọn lý do hoàn tiền" : "Chọn lý do đổi hàng"}
          />
          <TextField value={note} onChange={(e) => onNoteChange(e.target.value)} label="Ghi chú thêm" multiline rows={4} fullWidth />
        </StackAlignCenter>
      </Stack>

      <Box sx={{ mt: 4, mb: 4 }}>
        <Divider sx={{ mb: 4 }} />
        <TextFieldUploadImagesComponent
          label="Ảnh/video bằng chứng"
          required
          values={evidenceImages}
          onChange={onEvidenceImagesChange}
          maxImages={3}
          uploadIcon={<Camera01 size={24} color="#999999" />}
          accept="image/*,video/*"
        />
      </Box>

      <OrderExchangeAddress order={order} initialValues={initialPickupAddress} onAddressUpdate={handlePickupAddressUpdate} />

      {requiresRefundBank ? <OrderRefundBankInfo values={refundBank} onChange={setRefundBank} /> : null}

      {isRefund ? (
        <OrderRefundSummary
          totalPriceToReturn={totalPriceToReturn}
          refundedLoyaltyPoints={refundedLoyaltyPoints}
          quotedReturnShippingFee={quotedShippingFee}
          paymentMethod={order.paymentMethod}
          isShippingFeeLoading={fetchShippingFee && isExchangeShipLoading}
        />
      ) : (
        <OrderExchangeSummary
          totalPriceToReturn={totalPriceToReturn}
          priceDifference={priceDifference}
          refundedLoyaltyPoints={refundedLoyaltyPoints}
          quotedShippingFee={quotedShippingFee}
          isShippingFeeLoading={fetchShippingFee && isExchangeShipLoading}
        />
      )}

      {/* ── Sticky footer ── */}
      <Box className={classes.stickyFooter}>
        <Box className={classes.footerContent}>
          <Button className={classes.secondaryButton} onClick={onBack}>
            Quay Lại
          </Button>
          <Button
            className={classes.primaryButton}
            disabled={!selectedReason || !pickupAddressValid || !isRefundBankValid || isSubmitting || isEvidenceUploading}
            onClick={() => onSubmit(pickupAddress, requiresRefundBank ? refundBank : undefined)}
          >
            {isSubmitting ? <CircularProgress size={16} color="inherit" /> : "Gửi Yêu Cầu"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ExchangeConfirmation;
