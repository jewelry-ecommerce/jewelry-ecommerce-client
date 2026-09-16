"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Button,
  Typography,
  Stack,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { ArrowNarrowRight } from "@untitledui/icons";
import { toast } from "react-toastify";

import useStyles from "./checkout-voucher.styles";
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled";
import VoucherItem from "./voucher-item.component";
import CheckoutSectionHeaderComponent from "../checkout-header/checkout-header.component";
import TextFieldComponent from "@/components/text-field/text-field.component";
import { PromotionApi } from "@/utils/api";
import { useCheckoutVoucherDiscover } from "@/hooks/checkout/use-checkout-voucher-discover.hook";
import type { PromotionVoucherCard, PromotionVoucherCheckoutContext } from "@/utils/api/promotion/promotion.interface";
import { getCheckoutDisplayVoucherItems, isVoucherSelected } from "./checkout-voucher.mapper";
import { DEFAULT_MAX_SELECTED_CART_VOUCHERS } from "./checkout-voucher.mapper";
import type { SelectedCheckoutVoucher } from "./checkout-voucher.mapper";

export type { SelectedCheckoutVoucher };

interface CheckoutVoucherSectionProps {
  title?: string;
  placeholder?: string;
  selectedVouchers: SelectedCheckoutVoucher[];
  onToggleVoucher: (card: PromotionVoucherCard) => void;
  onApplyValidatedVoucher: (card: PromotionVoucherCard) => void;
  checkoutContext?: PromotionVoucherCheckoutContext | null;
  showTitle?: boolean;
  maxVouchers?: number;
  readOnly?: boolean;
  /** Gọi trước khi đóng popup — dùng flush sync pricing khi user chọn voucher nhanh. */
  onDialogClose?: () => void;
  /** `false` khi đang / chờ pricing-context — discover chỉ chạy sau khi sẵn sàng. */
  isPricingContextReady?: boolean;
}

const CheckoutVoucherSection = ({
  title = "Mã voucher / Thẻ quà tặng",
  placeholder = "Chọn mã voucher",
  selectedVouchers,
  onToggleVoucher,
  onApplyValidatedVoucher,
  checkoutContext,
  showTitle = true,
  maxVouchers = DEFAULT_MAX_SELECTED_CART_VOUCHERS,
  readOnly = false,
  onDialogClose,
  isPricingContextReady = true,
}: CheckoutVoucherSectionProps) => {
  const { classes } = useStyles();
  const isMobile = useMediaQuery("(max-width:810px)");
  const [isOpen, setIsOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [conditionDialog, setConditionDialog] = useState<{ open: boolean; summary: string; title: string }>({
    open: false,
    summary: "",
    title: "",
  });

  const { sections, isLoading, isRefreshing, error } = useCheckoutVoucherDiscover(isOpen, checkoutContext, {
    isPricingContextReady,
  });
  const displayItems = getCheckoutDisplayVoucherItems(sections);

  const totalSelected = selectedVouchers.length;
  const showInitialLoading = isLoading && displayItems.length === 0;
  const showEmptyState = !showInitialLoading && !error && displayItems.length === 0;

  function handleCloseDialog() {
    onDialogClose?.();
    setIsOpen(false);
  }

  const handleApplyCode = async () => {
    const trimmed = voucherCode.trim();
    if (!trimmed) return;
    if (totalSelected >= maxVouchers) {
      toast.error(`Bạn chỉ được chọn tối đa ${maxVouchers} voucher`);
      return;
    }

    setIsValidating(true);
    try {
      const checkoutSessionId = checkoutContext?.cart?.checkoutSessionId;
      if (!checkoutSessionId) {
        toast.error("Không thể kiểm tra mã voucher. Vui lòng thử lại.");
        return;
      }

      const response = await PromotionApi.validatePromotionVoucherCode(checkoutSessionId, trimmed);
      if (response.valid && response.card) {
        onApplyValidatedVoucher(response.card);
        setVoucherCode("");
      } else {
        toast.error(response.message || "Mã voucher không hợp lệ");
      }
    } catch {
      toast.error("Không thể kiểm tra mã voucher. Vui lòng thử lại.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleShowCondition = (_id: string, summary: string) => {
    const item = displayItems.find((i) => i.voucherCodeId === _id);
    setConditionDialog({ open: true, summary, title: item?.title ?? "" });
  };

  return (
    <React.Fragment>
      <Stack className={classes.root}>
        {showTitle && <CheckoutSectionHeaderComponent title="MÃ GIẢM GIÁ" />}
        <StackRowAlignCenterJustBetween
          className={classes.voucherWrapper}
          onClick={() => !readOnly && setIsOpen(true)}
          sx={{
            cursor: readOnly ? "default" : "pointer",
            backgroundColor: readOnly ? "#F5F5F5" : "#FFFFFF",
            borderColor: "#DEDEDE",
          }}
        >
          <Typography className={classes.label}>{totalSelected > 0 ? `Đã chọn ${totalSelected} voucher` : placeholder}</Typography>
          <StackRowAlignCenter>
            <ArrowNarrowRight size={18} />
          </StackRowAlignCenter>
        </StackRowAlignCenterJustBetween>
      </Stack>

      {/* Popup danh sách voucher */}
      <Dialog
        open={isOpen}
        onClose={handleCloseDialog}
        fullScreen={isMobile}
        fullWidth
        maxWidth={false}
        PaperProps={{ className: classes.modalPaper }}
      >
        <DialogTitle className={classes.modalTitleWrapper}>
          <StackRowAlignCenterJustBetween>
            <CheckoutSectionHeaderComponent title={title} />
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </StackRowAlignCenterJustBetween>

          <Stack className={classes.inputContainer}>
            <StackRowAlignCenterJustBetween className={classes.inputWrapper}>
              <TextFieldComponent label="Nhập mã voucher" value={voucherCode} onValueChange={setVoucherCode} disabled={isValidating} />
              <Button
                className={classes.voucherButton}
                onClick={() => void handleApplyCode()}
                disabled={!voucherCode.trim() || totalSelected >= maxVouchers || isValidating}
                startIcon={isValidating ? <CircularProgress size={14} color="inherit" /> : undefined}
              >
                Áp Dụng
              </Button>
            </StackRowAlignCenterJustBetween>
            <Typography className={classes.voucherLimitCaption}>Được áp dụng tối đa {maxVouchers} voucher</Typography>

            <Box className={classes.chipContainer} aria-hidden={selectedVouchers.length === 0}>
              {selectedVouchers.map((v) => (
                <Box key={v.voucherCodeId} className={classes.voucherChip}>
                  <LocalOfferIcon className={classes.chipIcon} />
                  <Typography className={classes.chipLabel}>{v.codeMask || v.code}</Typography>
                  <CloseIcon
                    className={classes.chipIcon}
                    onClick={() =>
                      onToggleVoucher({
                        voucherCodeId: v.voucherCodeId,
                        code: v.code,
                        codeMask: v.codeMask,
                        title: v.title,
                      } as PromotionVoucherCard)
                    }
                  />
                </Box>
              ))}
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent className={classes.modalContent} dividers={false}>
          {showInitialLoading && (
            <Stack alignItems="center" justifyContent="center" py={4}>
              <CircularProgress size={32} />
              <Typography mt={2} color="text.secondary">
                Đang tải...
              </Typography>
            </Stack>
          )}

          {!showInitialLoading && error && sections.length === 0 && (
            <Stack alignItems="center" py={4}>
              <Typography color="error">{error}</Typography>
            </Stack>
          )}

          {showEmptyState && (
            <Stack alignItems="center" py={4}>
              <Typography color="text.secondary">Không có voucher khả dụng</Typography>
            </Stack>
          )}

          {displayItems.length > 0 && (
            <Box
              className={classes.voucherList}
              sx={{
                opacity: isRefreshing ? 0.72 : 1,
                transition: "opacity 0.2s ease",
              }}
            >
              {displayItems.map((item) => (
                <VoucherItem
                  key={item.voucherCodeId}
                  id={item.voucherCodeId}
                  title={item.title}
                  subtitle={item.subtitle || item.benefitSummary}
                  image={item.image}
                  conditionSummary={item.conditionSummary}
                  isSelected={isVoucherSelected(selectedVouchers, item.voucherCodeId)}
                  isDisable={item.disabled || (totalSelected >= maxVouchers && !isVoucherSelected(selectedVouchers, item.voucherCodeId))}
                  onToggle={() => onToggleVoucher(item)}
                  onShowCondition={handleShowCondition}
                />
              ))}
            </Box>
          )}
        </DialogContent>

        <Box className={classes.footer}>
          <Button className={classes.voucherButton} fullWidth onClick={handleCloseDialog}>
            Hoàn Thành
          </Button>
        </Box>
      </Dialog>

      {/* Dialog điều kiện voucher */}
      <Dialog open={conditionDialog.open} onClose={() => setConditionDialog((d) => ({ ...d, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>
          <StackRowAlignCenterJustBetween>
            <Typography fontWeight={700}>{conditionDialog.title || "Điều kiện voucher"}</Typography>
            <IconButton onClick={() => setConditionDialog((d) => ({ ...d, open: false }))}>
              <CloseIcon />
            </IconButton>
          </StackRowAlignCenterJustBetween>
        </DialogTitle>
        <DialogContent>
          <Typography whiteSpace="pre-line">{conditionDialog.summary || "Không có thông tin điều kiện."}</Typography>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default CheckoutVoucherSection;
