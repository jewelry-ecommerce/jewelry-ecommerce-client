// set term
"use client";

import SetBadge from "./set-badge.component";
import { CdnImage } from "@/components/cdn-image";
import { DiscountPercentTag } from "@/components/product/discount-percent-tag/discount-percent-tag.component";
import { useProductDefaultImage } from "@/components/providers.component";
import { useSetSelection } from "@/app/(layout-main)/sets/_hooks/use-set-selection.hook";
import { isSizeVariantAttribute } from "@/utils/product/size-variant-attribute.util";
import type { SetDetailResponse } from "@/utils/api/sets/sets.interface";
import type { CustomerDisplayPrice } from "@/utils/customer-display-price.util";
import { formatPrice } from "@/utils/constants/common.constant";
import { StackRowAlignCenterJustBetween } from "@/components/styled";
import useQuickViewStyles from "@/components/product/product-quick-view-drawer/product-quick-view-drawer.styles";
import { Box, Button, Dialog, Drawer, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { XClose } from "@untitledui/icons";
import { useEffect, useMemo } from "react";
import { RemoveScroll } from "react-remove-scroll";
import SetDetailProduct from "./set-detail-product.component";
import useSetDetailStyles from "./set-detail.styles";

type SetCartVariationPopupProps = {
  open: boolean;
  set: SetDetailResponse;
  price: Pick<CustomerDisplayPrice, "sellingPriceAfterTaxMinor" | "compareAtPriceAfterTaxMinor" | "discountPercent" | "hasDiscount"> | null;
  initialSelections: Record<string, string>;
  title: string;
  confirmLabel: string;
  isSubmitting?: boolean;
  presentation?: "drawer" | "dialog";
  onClose: () => void;
  onConfirm?: (selections: Record<string, string>, maxQuantity?: number) => void;
};

const SetCartVariationPopup = ({
  open,
  set,
  price,
  initialSelections,
  title,
  confirmLabel,
  isSubmitting,
  presentation = "drawer",
  onClose,
  onConfirm,
}: SetCartVariationPopupProps) => {
  // hook
  const theme = useTheme();
  const { classes, cx } = useQuickViewStyles();
  const { classes: setDetailClasses } = useSetDetailStyles();
  const zIndex = { productQuickViewModal: theme.zIndex.modal + 1 };
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const productDefaultImage = useProductDefaultImage();

  // function
  const items = useMemo(() => set.includedProducts.slice().sort((left, right) => left.sortOrder - right.sortOrder), [set.includedProducts]);

  // function
  const { variationIds, customerDisplayPrice, selectVariation, resetSelection, maxQuantity, isOutOfStock } = useSetSelection(
    set.id,
    items,
    initialSelections,
    price,
  );
  const hasSizeGuide = useMemo(
    () => items.some((item) => item.variantSelectors.some((selector) => isSizeVariantAttribute(selector.attribute))),
    [items],
  );
  const currentPrice = customerDisplayPrice ?? price;

  useEffect(() => {
    if (!open) return;
    resetSelection(initialSelections);
  }, [initialSelections, open, resetSelection]);
  const content = (
    <Box className={cx(setDetailClasses.popupRoot, "item")}>
      <StackRowAlignCenterJustBetween className={classes.header}>
        <Typography className={classes.title}>{title}</Typography>
        <XClose size={24} onClick={onClose} />
      </StackRowAlignCenterJustBetween>
      <RemoveScroll enabled={open} forwardProps style={{ display: "flex", flex: "1 1 auto", minHeight: 0, width: "100%" }}>
        <Box className={cx(classes.body, setDetailClasses.popupBody)}>
          <Box className={cx(classes.productWrapper, setDetailClasses.popupProductWrapper)}>
            <Box className={cx(classes.topSection, setDetailClasses.popupTopSection)}>
              <Box className={classes.thumb}>
                <CdnImage
                  as="next"
                  src={set.images[0] ?? productDefaultImage}
                  fallback={productDefaultImage}
                  alt={set.name}
                  width={122}
                  height={154}
                  preset="cartLineItem"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
              <Box className={classes.productInfo}>
                <SetBadge />
                <Typography className={classes.productName}>{set.name}</Typography>
                {currentPrice ? (
                  <Box className={classes.priceRow}>
                    <Typography className={classes.salePrice}>{formatPrice(currentPrice.sellingPriceAfterTaxMinor)}</Typography>
                    {currentPrice.compareAtPriceAfterTaxMinor ? (
                      <Typography className={classes.originalPrice}>{formatPrice(currentPrice.compareAtPriceAfterTaxMinor)}</Typography>
                    ) : null}
                    {currentPrice.hasDiscount && currentPrice.discountPercent ? (
                      <DiscountPercentTag discountPercent={currentPrice.discountPercent} />
                    ) : null}
                  </Box>
                ) : null}
              </Box>
            </Box>
            <Box className={setDetailClasses.popupProducts}>
              {items.map((item) => (
                <SetDetailProduct
                  key={item.itemId}
                  item={item}
                  selectedVariationId={variationIds[item.itemId]}
                  onVariationChange={selectVariation}
                  showSizeGuideAtKey={hasSizeGuide}
                />
              ))}
            </Box>
            <Box className={cx(classes.footer, classes.footerFullWidth, setDetailClasses.popupFooter)}>
              <Button
                type="button"
                fullWidth
                className={classes.addButton}
                onClick={() => onConfirm?.(variationIds, maxQuantity)}
                variant="contained"
                disabled={isSubmitting || isOutOfStock}
              >
                {isOutOfStock ? "Hết hàng" : confirmLabel}
              </Button>
            </Box>
          </Box>
        </Box>
      </RemoveScroll>
    </Box>
  );

  if (presentation === "dialog" && !isMobile) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        disableScrollLock
        maxWidth={false}
        PaperProps={{ className: setDetailClasses.popupDialogPaper }}
      >
        {content}
      </Dialog>
    );
  }

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={onClose}
      PaperProps={{ className: classes.drawerPaper }}
      ModalProps={{ keepMounted: true, disableScrollLock: true, sx: { zIndex: zIndex.productQuickViewModal } }}
    >
      {content}
    </Drawer>
  );
};

export default SetCartVariationPopup;
