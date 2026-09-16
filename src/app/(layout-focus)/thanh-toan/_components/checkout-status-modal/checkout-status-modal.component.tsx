import React, { useEffect } from "react";
import { Dialog, Box, Typography, Button, DialogContent, CircularProgress, Stack } from "@mui/material";
import useStyles from "./checkout-status-modal.styles";
import Image from "next/image";
import { StackRowAlignJustCenter } from "@/components/styled";
import {
  PAYOO_LOADING_IMAGE_SRC,
  preloadPayooLoadingImage,
  resolveCheckoutPriceChangeActions,
  resolveCheckoutPriceChangeCtaLabel,
} from "../checkout.helpers";
import type { CheckoutPriceChangeAction, CheckoutPriceChangeDetails } from "@/utils/api/checkout/checkout.interface";
import { formatPrice } from "@/utils/constants/common.constant";

export type CheckoutStatusModalType =
  | "partial_stock"
  | "full_stock"
  | "gift_stock"
  | "price_change"
  | "pricing_unavailable"
  | "shipping_fee_unavailable"
  | "shipping_fee_mismatch"
  | "payoo_loading"
  | "items_unavailable";

interface CheckoutStatusModalProps {
  open: boolean;
  onClose: () => void;
  type: CheckoutStatusModalType;
  productName?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  priceChangeDetails?: CheckoutPriceChangeDetails;
  onPriceChangeAction?: (action: CheckoutPriceChangeAction) => void;
  isActionLoading?: boolean;
}

function CheckoutStatusModal({
  open,
  onClose,
  type,
  productName = "SẢN PHẨM",
  onPrimaryAction,
  onSecondaryAction,
  priceChangeDetails,
  onPriceChangeAction,
  isActionLoading = false,
}: CheckoutStatusModalProps) {
  const { classes, cx } = useStyles();
  useEffect(() => {
    preloadPayooLoadingImage();
  }, []);

  const getModalContent = () => {
    switch (type) {
      case "partial_stock":
        return {
          title: `SẢN PHẨM ${productName.toUpperCase()} VỪA Hết hàng`,
          description: "Hệ thống sẽ tự động gỡ sản phẩm này để bạn có thể tiếp tục hoàn tất các món còn lại.",
          primaryBtn: "Tiếp Tục Đặt Hàng",
          secondaryBtn: "Quay Lại Giỏ Hàng",
        };
      case "full_stock":
        return {
          title: `SẢN PHẨM ${productName.toUpperCase()} VỪA Hết hàng`,
          description:
            "Rất tiếc, sản phẩm duy nhất trong đơn hàng của bạn hiện đã hết hàng. Vui lòng quay lại Giỏ hàng để chọn sản phẩm khác.",
          primaryBtn: null,
          secondaryBtn: "Quay Lại Giỏ Hàng",
          isSecondaryPrimary: false,
        };
      case "gift_stock":
        return {
          title: "QUÀ TẶNG KÈM VỪA Hết hàng",
          description:
            "Rất tiếc, quà tặng kèm theo hiện đã hết hàng, hệ thống sẽ tự động gỡ quà tặng này. Đơn hàng của bạn vẫn được giữ nguyên giá trị.",
          primaryBtn: "Tiếp Tục Đặt Hàng",
          secondaryBtn: null,
        };
      case "price_change":
        return {
          title: "CÓ SỰ THAY ĐỔI VỀ GIÁ HOẶC MÃ GIẢM GIÁ ĐÃ HẾT LƯỢT. HỆ THỐNG SẼ CẬP NHẬT LẠI SỐ TIỀN.",
          description: "",
          primaryBtn: "Tiếp Tục Đặt Hàng",
          secondaryBtn: null,
        };
      case "pricing_unavailable":
        return {
          title: "KHÔNG THỂ CẬP NHẬT GIÁ CHECKOUT LÚC NÀY",
          description: "Hệ thống chưa lấy được giá mới .Vui lòng thử lại sau ít phút",
          primaryBtn: null,
          secondaryBtn: "Quay Lai Gio Hang",
        };
      case "shipping_fee_unavailable":
        return {
          title: "KHÔNG THỂ TÍNH PHÍ VẬN CHUYỂN LÚC NÀY",
          description: "Hệ thống chưa tính được phí vận chuyển cho địa chỉ của bạn. Vui lòng thử lại sau ít phút.",
          primaryBtn: "Thử Lại",
          secondaryBtn: "Quay Lại Giỏ Hàng",
        };
      case "shipping_fee_mismatch":
        return {
          title: "PHÍ VẬN CHUYỂN ĐÃ CẬP NHẬT",
          description: "Phí vận chuyển cho đơn hàng đã có sự thay đổi. Vui lòng tải lại thông tin thanh toán mới nhất.",
          primaryBtn: "Tải Lại",
          secondaryBtn: null,
        };
      case "items_unavailable":
        return {
          title: `SẢN PHẨM ${productName.toUpperCase()} HIỆN KHÔNG CÒN TỒN TẠI`,
          description: "Sản phẩm không còn tồn tại, bị ẩn, hoặc ngừng bán. Vui lòng quay lại giỏ hàng để cập nhật.",
          primaryBtn: null,
          secondaryBtn: "Quay Lại Giỏ Hàng",
        };
      case "payoo_loading":
        return {
          title: "ĐANG KẾT NỐI ĐẾN CỔNG THANH TOÁN PAYOO, VUI LÒNG KHÔNG ĐÓNG TRÌNH DUYỆT",
          description: "",
          primaryBtn: null,
          secondaryBtn: null,
          image: PAYOO_LOADING_IMAGE_SRC,
        };
      default:
        return {
          title: "",
          description: "",
          primaryBtn: null,
          secondaryBtn: null,
        };
    }
  };

  const content = getModalContent();
  const imageSrc = content?.image || "/image/checkout/out-stock.svg";
  const isPayooLoading = type === "payoo_loading";
  const imageSize = isPayooLoading ? { width: 240, height: 155 } : { width: 240, height: 174 };
  const priceChangeActions = type === "price_change" ? resolveCheckoutPriceChangeActions(priceChangeDetails) : [];
  const previousTotal = priceChangeDetails?.previousTotals?.amountPayableMinor;
  const currentTotal = priceChangeDetails?.currentTotals?.amountPayableMinor;
  const changedItems = priceChangeDetails?.priceChangedItems ?? [];
  const hasPriceChangeSummary = previousTotal != null || currentTotal != null || changedItems.length > 0;
  const isActionsStack = priceChangeDetails?.popup?.actions_layout === "STACK";

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (isActionLoading) return;
        if (reason !== "backdropClick") {
          onClose();
        }
      }}
      disableEscapeKeyDown
      PaperProps={{ className: classes.modalPaper }}
    >
      <DialogContent className={classes.dialogContent}>
        <StackRowAlignJustCenter className={isPayooLoading ? classes.imageWrapperPayoo : classes.imageWrapper}>
          <Image
            src={imageSrc}
            alt="Status image"
            width={imageSize.width}
            height={imageSize.height}
            className={classes.image}
            style={{ width: imageSize.width, height: imageSize.height }}
            priority={isPayooLoading}
          />
        </StackRowAlignJustCenter>

        <Box className={classes.contentWrapper}>
          <Typography className={classes.title}>{content.title}</Typography>

          {content.description && <Typography className={classes.description}>{content.description}</Typography>}
        </Box>

        {type === "price_change" && hasPriceChangeSummary ? (
          <>
            {previousTotal != null || currentTotal != null ? (
              <Box className={classes.totalsRow}>
                <Box className={classes.totalBox}>
                  <Typography className={classes.totalLabel}>Tổng cũ</Typography>
                  <Typography className={classes.totalValue}>{formatPrice(Number(previousTotal ?? 0))}</Typography>
                </Box>
                <Box className={cx(classes.totalBox, classes.totalBoxNew)}>
                  <Typography className={cx(classes.totalLabel, classes.totalLabelNew)}>Tổng mới</Typography>
                  <Typography className={cx(classes.totalValue, classes.totalValueNew)}>
                    {formatPrice(Number(currentTotal ?? 0))}
                  </Typography>
                </Box>
              </Box>
            ) : null}

            {changedItems.length > 0 ? (
              <Box className={classes.changedItems}>
                {changedItems.map((item, index) => (
                  <Box key={item.variationId || `${item.productName}-${index}`} className={classes.changedItem}>
                    <Typography className={classes.changedItemName}>{item.productName || item.variationName}</Typography>
                    <Typography className={classes.changedItemPrice}>
                      Thành tiền: {formatPrice(Number(item.previousFinalAmountMinor ?? 0))} →{" "}
                      {formatPrice(Number(item.currentFinalAmountMinor ?? 0))}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : null}
          </>
        ) : null}

        {priceChangeActions.length > 0 ? (
          <Box className={cx(classes.buttonWrapper, isActionsStack && classes.buttonWrapperStack)}>
            {priceChangeActions.map((action) => {
              const isOutlined = action.cta_variant === "OUTLINED";
              return (
                <Button
                  key={action.id}
                  className={isOutlined ? classes.secondaryButton : classes.primaryButton}
                  fullWidth
                  disabled={isActionLoading}
                  onClick={() => onPriceChangeAction?.(action)}
                  sx={{
                    ...(action.cta_bg ? { backgroundColor: `${action.cta_bg} !important` } : {}),
                    ...(action.cta_color ? { color: `${action.cta_color} !important` } : {}),
                    ...(isOutlined && action.cta_border_color ? { borderColor: `${action.cta_border_color} !important` } : {}),
                  }}
                >
                  {isActionLoading ? (
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <CircularProgress size={16} color="inherit" />
                      <Typography component="span" sx={{ fontSize: "inherit", fontWeight: "inherit" }}>
                        Đang Xử Lý...
                      </Typography>
                    </Stack>
                  ) : (
                    resolveCheckoutPriceChangeCtaLabel(action)
                  )}
                </Button>
              );
            })}
          </Box>
        ) : content.primaryBtn || content.secondaryBtn ? (
          <Box className={classes.buttonWrapper}>
            {content.secondaryBtn && (
              <Button
                className={content.isSecondaryPrimary ? classes.primaryButton : classes.secondaryButton}
                fullWidth
                onClick={onSecondaryAction}
              >
                {content.secondaryBtn}
              </Button>
            )}
            {content.primaryBtn && (
              <Button className={classes.primaryButton} fullWidth onClick={onPrimaryAction}>
                {content.primaryBtn}
              </Button>
            )}
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default CheckoutStatusModal;
