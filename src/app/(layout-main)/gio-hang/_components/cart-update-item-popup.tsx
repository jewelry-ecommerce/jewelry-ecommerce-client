"use client";

import { useTheme, useMediaQuery, Box, Button, Drawer, IconButton, Typography, Dialog } from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";
import type { IProductVariationsResponse, IProductVariationResponse } from "@/utils/api/product/product.interface";
import { getProductVariationsBySlug } from "@/utils/api/product/product.api";
import { ProductLifecycleStatus } from "@/utils/api/product/product.enum";
import useStyles from "./cart-update-item-popup.styles";
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled";
import ProductSizeGuideDrawer from "@/components/product/product-size-guide-drawer/product-size-guide-drawer.component";
import { CartProductVariation } from "@/utils/api/cart/cart.interface";
import { XClose } from "@untitledui/icons";
import { isTextAttributeDisplayType, normalizeAttributeDisplayType } from "@/utils/constants/attribute-display-type.enum";
import { RemoveScroll } from "react-remove-scroll";
import { DiscountPercentTag } from "@/components/product/discount-percent-tag/discount-percent-tag.component";
import { resolveCustomerDisplayPrice, shouldShowDiscountPercentTag } from "@/utils/customer-display-price.util";
import { buildContextualVariantSelectors, isVariationAvailableForPurchase } from "@/utils/product/variant-availability.util";
import { useProductDefaultImage } from "@/components/providers.component";
import { resolveProductDefaultImageSrc } from "@/utils/config/tenant-branding.util";

type CartUpdateItemPopupProps = {
  open: boolean;
  onClose: () => void;
  slug?: string;
  onUpdate?: (variation: CartProductVariation) => void;
  editingOldVariationId?: string;
};

const CartUpdateItemPopup = ({ open, onClose, slug, onUpdate, editingOldVariationId }: CartUpdateItemPopupProps) => {
  const { classes, cx } = useStyles();
  const productDefaultImage = useProductDefaultImage() || resolveProductDefaultImageSrc();
  const [productData, setProductData] = useState<IProductVariationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!slug) {
      setError("Product slug missing");
      setProductData(null);
      setSelectedAttributes({});
      return;
    }

    setLoading(true);
    setError(null);

    getProductVariationsBySlug(slug)
      .then((data) => {
        setProductData(data);
        if (data.variations && data.variations.length > 0) {
          const selectedVariant = editingOldVariationId
            ? data.variations.find((v) => String(v.id) === String(editingOldVariationId))
            : undefined;
          const initVariant = selectedVariant ?? data.variations[0];

          if (initVariant) {
            const initialAttrs: Record<string, string> = {};
            initVariant.attributeValues.forEach((av) => {
              initialAttrs[av.attributeCode] = av.valueCode;
            });
            setSelectedAttributes(initialAttrs);
          } else {
            setSelectedAttributes({});
          }
        } else {
          setSelectedAttributes({});
        }
      })
      .catch((err) => {
        setError((err as Error)?.message || "Failed to load variation data");
        setProductData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, slug, editingOldVariationId]);

  const variations = useMemo(() => productData?.variations ?? [], [productData]);
  const attributes = useMemo(() => productData?.attributes ?? [], [productData]);
  const product = useMemo(() => productData?.product, [productData]);

  const baseVariantSelectors = useMemo(
    () =>
      attributes.map((attr) => ({
        attribute: {
          id: attr.id,
          name: attr.name,
          code: attr.code,
          index: attr.index,
          displayType: normalizeAttributeDisplayType(attr.displayType),
        },
        options: attr.values.map((value) => ({
          id: value.code,
          code: value.code,
          label: value.value,
          value: value.value,
          thumbnail: value.image ?? null,
          selected: false,
          available: variations.some(
            (variation) =>
              variation.attributeValues.some((av) => av.attributeCode === attr.code && av.valueCode === value.code) &&
              isVariationAvailableForPurchase(variation),
          ),
          variationIds: variations
            .filter((variation) => variation.attributeValues.some((av) => av.attributeCode === attr.code && av.valueCode === value.code))
            .map((variation) => variation.id),
        })),
      })),
    [attributes, variations],
  );

  const variantSelectors = useMemo(
    () => buildContextualVariantSelectors(baseVariantSelectors, variations, selectedAttributes),
    [baseVariantSelectors, variations, selectedAttributes],
  );

  const currentVariation = useMemo(() => {
    if (!variations.length) return undefined;
    return variations.find((v) => v.attributeValues.every((av) => selectedAttributes[av.attributeCode] === av.valueCode)) || variations[0];
  }, [variations, selectedAttributes]);
  const isDiscontinued = product?.status === ProductLifecycleStatus.DISCONTINUED || product?.isPurchasable === false;
  const currentVariationCustomerDisplayPrice = currentVariation
    ? (currentVariation.customerDisplayPrice ??
      resolveCustomerDisplayPrice({
        displayPriceAfterTaxMinor:
          currentVariation.displayPriceAfterTaxMinor ??
          currentVariation.sellingPriceAfterTaxMinor ??
          currentVariation.compareAtPriceAfterTaxMinor,
        sellingPriceAfterTaxMinor:
          currentVariation.displayPriceAfterTaxMinor ??
          currentVariation.sellingPriceAfterTaxMinor ??
          currentVariation.compareAtPriceAfterTaxMinor,
        compareAtPriceAfterTaxMinor: currentVariation.compareAtPriceAfterTaxMinor,
      }))
    : undefined;
  const currentVariationDisplayPriceMinor =
    currentVariationCustomerDisplayPrice?.sellingPriceAfterTaxMinor ?? currentVariation?.sellingPriceAfterTaxMinor ?? 0;
  const currentVariationCompareAtPriceMinor = currentVariationCustomerDisplayPrice?.compareAtPriceAfterTaxMinor;
  const showDiscountPercentTag = shouldShowDiscountPercentTag({
    showDiscountPercent: currentVariation?.pricePresentation?.showDiscountPercent,
    hasDiscount: currentVariationCustomerDisplayPrice?.hasDiscount,
    discountPercent: currentVariationCustomerDisplayPrice?.discountPercent,
  });

  const handleUpdate = () => {
    if (!product || !currentVariation) return;
    if (isDiscontinued) return;
    if (!isVariationAvailableForPurchase(currentVariation)) return;
    const mapToCartProductVariation = (v: IProductVariationResponse): CartProductVariation => ({
      ...v,
      customerDisplayPrice:
        v.customerDisplayPrice ??
        resolveCustomerDisplayPrice({
          displayPriceAfterTaxMinor: v.displayPriceAfterTaxMinor ?? v.sellingPriceAfterTaxMinor ?? v.compareAtPriceAfterTaxMinor,
          sellingPriceAfterTaxMinor: v.displayPriceAfterTaxMinor ?? v.sellingPriceAfterTaxMinor ?? v.compareAtPriceAfterTaxMinor,
          compareAtPriceAfterTaxMinor: v.compareAtPriceAfterTaxMinor,
        }),
      compareAtPriceAfterTaxMinor: Number(v.compareAtPriceAfterTaxMinor),
      sellingPriceAfterTaxMinor: Number(v.sellingPriceAfterTaxMinor),
      stockStatus: v.status || (v.stock > 0 ? "ACTIVE" : "INACTIVE"),
      attributes: v.attributeValues.map((a) => {
        const matchedAttribute =
          attributes.find((attr) => attr.code === a.attributeCode) ||
          attributes.find((attr) => attr.id === a.attributeCode) ||
          attributes.find((attr) => String(attr.code).toUpperCase() === String(a.attributeCode).toUpperCase());

        const matchedValue =
          matchedAttribute?.values.find((value) => value.code === a.valueCode) ||
          matchedAttribute?.values.find((value) => String(value.value).toUpperCase() === String(a.valueCode).toUpperCase());

        const normalizedCode = matchedAttribute?.name?.toUpperCase().includes("SIZE") ? "SIZE" : matchedAttribute?.code || a.attributeCode;

        const normalizedValue = matchedValue?.value
          ? matchedValue.value
          : normalizedCode === "SIZE"
            ? a.valueCode.split("_").pop() || a.valueCode
            : a.valueCode.replaceAll("_", " ");

        return {
          attributeId: matchedAttribute?.id ?? a.attributeCode,
          attributeName: matchedAttribute?.name ?? a.attributeCode,
          attributeCode: normalizedCode,
          value: normalizedValue,
          valueCode: a.valueCode,
        };
      }),
    });
    onUpdate?.(mapToCartProductVariation(currentVariation));
    onClose();
  };

  const isAttributeValueDisabled = (attrCode: string, valueCode: string) => {
    const selector = variantSelectors.find((item) => item.attribute.code === attrCode);
    const option = selector?.options.find((item) => item.code === valueCode);
    return !(option?.available ?? false);
  };

  const content = (
    <Box className={classes.root}>
      <StackRowAlignCenterJustBetween className={classes.header}>
        <Typography className={classes.title}>Cập nhật sản phẩm</Typography>
        <IconButton onClick={onClose} size="small" sx={{ p: 0 }}>
          <XClose size={24} />
        </IconButton>
      </StackRowAlignCenterJustBetween>

      <Box className={classes.body}>
        {loading ? (
          <Typography sx={{ p: 2 }}>Đang tải...</Typography>
        ) : error ? (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        ) : !product || !currentVariation ? (
          <Typography sx={{ p: 2 }}>Không tìm thấy dữ liệu sản phẩm.</Typography>
        ) : (
          <>
            <Box className={classes.topSection}>
              <Box
                component="img"
                src={currentVariation.image || product.image || productDefaultImage}
                alt={product.name}
                onError={(e) => {
                  if (productDefaultImage && e.currentTarget.src !== productDefaultImage) {
                    e.currentTarget.src = productDefaultImage;
                  }
                }}
                className={classes.thumb}
              />
              <Box className={classes.productInfo}>
                <Typography className={classes.productName}>{product.name}</Typography>
                {isDiscontinued ? (
                  <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#4B5563", mb: 0.75 }}>Ngừng kinh doanh</Typography>
                ) : null}
                <Box className={classes.priceRow}>
                  <Typography className={classes.salePrice}>{Number(currentVariationDisplayPriceMinor).toLocaleString()}đ</Typography>
                  {currentVariationCompareAtPriceMinor != null &&
                  Number(currentVariationCompareAtPriceMinor) > Number(currentVariationDisplayPriceMinor) ? (
                    <Typography className={classes.originalPrice}>
                      {Number(currentVariationCompareAtPriceMinor).toLocaleString()}đ
                    </Typography>
                  ) : null}
                  {showDiscountPercentTag && <DiscountPercentTag discountPercent={currentVariationCustomerDisplayPrice?.discountPercent} />}
                </Box>
              </Box>
            </Box>

            {attributes.map((attr) => (
              <Box key={attr.id} className={classes.section}>
                <StackRowAlignCenterJustBetween>
                  <StackRowAlignCenter gap={1}>
                    <Typography className={classes.sectionLabel}>{attr.name}:</Typography>
                    <Typography className={classes.labelBold}>
                      {attr.values.find((v) => v.code === selectedAttributes[attr.code])?.value || ""}
                    </Typography>
                  </StackRowAlignCenter>
                  {/* {attr.displayType === "text" && (
                    <Typography className={classes.guideLink} onClick={() => setIsSizeGuideOpen(true)}>
                      Hướng dẫn đo size
                    </Typography>
                  )} */}
                </StackRowAlignCenterJustBetween>
                <Box className={isTextAttributeDisplayType(attr.displayType) ? classes.sizes : classes.swatches}>
                  {attr.values.map((val) => {
                    const isActive = selectedAttributes[attr.code] === val.code;
                    const isDisabled = isAttributeValueDisabled(attr.code, val.code);

                    return (
                      <Button
                        key={val.code}
                        className={cx(
                          isTextAttributeDisplayType(attr.displayType) ? classes.sizeButton : classes.swatchButton,
                          isActive && (isTextAttributeDisplayType(attr.displayType) ? classes.sizeActive : classes.swatchActive),
                          isDisabled && (isTextAttributeDisplayType(attr.displayType) ? classes.sizeDisabled : classes.swatchDisabled),
                        )}
                        onClick={() => !isDisabled && setSelectedAttributes((prev) => ({ ...prev, [attr.code]: val.code }))}
                        disabled={isDisabled}
                      >
                        {"image" in val && val.image ? (
                          <Box
                            component="img"
                            src={val.image as string}
                            alt={`${product.name} - ${val.value}`}
                            className={classes.swatchImage}
                          />
                        ) : (
                          <Typography sx={{ fontSize: "12px" }}>{val.value}</Typography>
                        )}
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            ))}

            <Box className={classes.footer}>
              <Button
                fullWidth
                className={classes.updateButton}
                onClick={handleUpdate}
                variant="contained"
                disabled={isDiscontinued || !currentVariation || !isVariationAvailableForPurchase(currentVariation)}
              >
                Cập Nhật
              </Button>
            </Box>
          </>
        )}
      </Box>
      <ProductSizeGuideDrawer
        open={isSizeGuideOpen}
        showBackButton
        onClose={() => setIsSizeGuideOpen(false)}
        onCloseAll={() => {
          setIsSizeGuideOpen(false);
          onClose();
        }}
      />
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        PaperProps={{ className: classes.drawerPaper }}
        ModalProps={{ disableScrollLock: true, sx: { zIndex: 1400 } }}
      >
        <RemoveScroll enabled={open}>{content}</RemoveScroll>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} disableScrollLock PaperProps={{ className: classes.dialogPaper }} maxWidth={false}>
      <RemoveScroll enabled={open}>{content}</RemoveScroll>
    </Dialog>
  );
};

export default CartUpdateItemPopup;
