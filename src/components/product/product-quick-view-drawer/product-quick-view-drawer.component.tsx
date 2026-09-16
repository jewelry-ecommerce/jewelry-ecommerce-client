import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import { buildCartViewItemFromVariationsApiResponse } from "@/utils/api/cart/cart-view-item-builder.util";
import useProductWishlist from "@/hooks/use-product-wishlist.hook";
import { Heart } from "@untitledui/icons";
import { StackRowAlignCenterJustBetween } from "@/components/styled";
import { CustomerRequestApi, ProductApi } from "@/utils/api";
import { Box, Button, Drawer, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { toast } from "react-toastify";
import ProductSizeGuideDrawer from "../product-size-guide-drawer/product-size-guide-drawer.component";
import ProductVariantSelector from "../product-variant-selector/product-variant-selector.component";
import useStyles from "./product-quick-view-drawer.styles";
import { XClose } from "@untitledui/icons";
import TextFieldComponent from "@/components/text-field/text-field.component";
import { normalizeAttributeDisplayType } from "@/utils/constants/attribute-display-type.enum";
import { ProductLifecycleStatus, ProductStockStatus } from "@/utils/api/product/product.enum";
import { pickDefaultVariation } from "@/utils/product/default-variation.util";
import { buildContextualVariantSelectors, isVariationAvailableForPurchase } from "@/utils/product/variant-availability.util";
import { hasActivePreOrderCampaign } from "@/utils/product/purchase-action.util";
import { useProductDefaultImage } from "@/components/providers.component";
import { StatusBadge } from "@/components/status-badge/status-badge.component";
import { PRE_ORDER_BADGE_COLORS } from "@/utils/constants/pre-order-badge.constant";
import { DiscountPercentTag } from "@/components/product/discount-percent-tag/discount-percent-tag.component";
import { shouldShowDiscountPercentTag } from "@/utils/customer-display-price.util";
import { RemoveScroll } from "react-remove-scroll";
import { PHONE_REGEX, VALIDATION_MESSAGES } from "@/utils/constants/common.constant";
import { getErrorMessage } from "@/utils/helpers/axios";

type ProductQuickViewDrawerProps = {
  open: boolean;
  onClose: () => void;
  slug: string;
  onConfirmAddToCart?: (id: string, item?: CartViewItem) => void;
  initialAttributes?: Record<string, string>;
  initialVariationId?: string;
  confirmButtonLabel?: string;
  isCartUpdate?: boolean;
};

const ProductQuickViewDrawer = ({
  open,
  onClose,
  slug,
  onConfirmAddToCart,
  initialAttributes,
  initialVariationId,
  confirmButtonLabel,
  isCartUpdate = false,
}: ProductQuickViewDrawerProps) => {
  const productDefaultImage = useProductDefaultImage();
  const { classes, cx } = useStyles();
  const theme = useTheme();
  const zIndex = {
    productQuickViewModal: theme.zIndex.modal + 1,
  };
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const { handleToggleWishlist, isProductWished } = useProductWishlist();
  const [contactValue, setContactValue] = useState("");
  const [contactError, setContactError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const initializedForOpenRef = useRef(false);

  const { data, isLoading: isProductLoading } = useSWR(open && slug ? ["product-quick-view", slug] : null, ([_, slugParam]) =>
    ProductApi.getProductVariationsBySlug(slugParam),
  );

  const variations = useMemo(() => data?.variations ?? [], [data]);
  const attributes = useMemo(() => data?.attributes ?? [], [data]);
  const product = useMemo(() => data?.product, [data]);

  const baseVariantSelectors = useMemo(() => {
    return attributes.map((attr) => ({
      attribute: {
        id: attr.id,
        name: attr.name,
        code: attr.code,
        index: attr.index,
        displayType: normalizeAttributeDisplayType(attr.displayType),
      },
      options: attr.values.map((v) => ({
        id: v.code,
        code: v.code,
        label: v.value,
        value: v.value,
        thumbnail: v.image ?? null,
        selected: false,
        available: variations.some(
          (variation) =>
            variation.attributeValues.some((av) => av.attributeCode === attr.code && av.valueCode === v.code) &&
            isVariationAvailableForPurchase(variation),
        ),
        variationIds: variations
          .filter((variation) => variation.attributeValues.some((av) => av.attributeCode === attr.code && av.valueCode === v.code))
          .map((variation) => variation.id),
      })),
    }));
  }, [attributes, variations]);

  const variantSelectors = useMemo(
    () => buildContextualVariantSelectors(baseVariantSelectors, variations, selectedAttributes),
    [baseVariantSelectors, variations, selectedAttributes],
  );

  useEffect(() => {
    if (!open) {
      initializedForOpenRef.current = false;
      return;
    }

    if (!variations.length || initializedForOpenRef.current) return;

    if (initialVariationId) {
      const matchedVariation = variations.find((variation) => String(variation.id) === String(initialVariationId));
      if (matchedVariation) {
        const attrs: Record<string, string> = {};
        matchedVariation.attributeValues.forEach((av) => {
          attrs[av.attributeCode] = av.valueCode;
        });
        setSelectedAttributes(attrs);
        initializedForOpenRef.current = true;
        return;
      }
    }

    if (initialAttributes && Object.keys(initialAttributes).length > 0) {
      // Variations matching initialAttributes; default = purchasable with lowest price among them
      const matchingVariations = variations.filter((v) =>
        Object.entries(initialAttributes).every(([code, val]) =>
          v.attributeValues.some((av) => av.attributeCode === code && av.valueCode === val),
        ),
      );
      const baseVariation = pickDefaultVariation(matchingVariations);
      if (baseVariation) {
        const newAttrs: Record<string, string> = {};

        baseVariation.attributeValues.forEach((av) => {
          newAttrs[av.attributeCode] = initialAttributes[av.attributeCode] || av.valueCode;
        });

        setSelectedAttributes(newAttrs);
        initializedForOpenRef.current = true;
        return;
      }
    }

    const defaultVariation = pickDefaultVariation(variations) ?? variations[0];
    const initialAttrs: Record<string, string> = {};
    defaultVariation.attributeValues.forEach((av) => {
      initialAttrs[av.attributeCode] = av.valueCode;
    });
    setSelectedAttributes(initialAttrs);
    initializedForOpenRef.current = true;
  }, [open, variations, initialAttributes, initialVariationId]);
  const currentVariation = useMemo(() => {
    if (!variations.length) return undefined;

    return variations.find((v) => v.attributeValues.every((av) => selectedAttributes[av.attributeCode] === av.valueCode)) || variations[0];
  }, [variations, selectedAttributes]);
  const currentDisplayPrice = currentVariation?.customerDisplayPrice;
  const currentSellingPrice = currentDisplayPrice?.sellingPriceAfterTaxMinor ?? 0;
  const currentOriginalPrice = currentDisplayPrice?.compareAtPriceAfterTaxMinor ?? 0;
  const hasCurrentDiscount = currentOriginalPrice > currentSellingPrice;
  const showDiscountPercentTag = shouldShowDiscountPercentTag({
    showDiscountPercent: currentVariation?.pricePresentation?.showDiscountPercent,
    hasDiscount: currentDisplayPrice?.hasDiscount,
    discountPercent: currentDisplayPrice?.discountPercent,
  });

  const isCurrentPreOrder = hasActivePreOrderCampaign(currentVariation?.preOrderCampaignId);
  const isOutOfStockSelection = Boolean(
    currentVariation && !isCurrentPreOrder && currentVariation.stockStatus === ProductStockStatus.OUT_OF_STOCK,
  );
  const isDiscontinued = product?.status === ProductLifecycleStatus.DISCONTINUED || product?.isPurchasable === false;

  const resolveConfirmLabel = (): string => {
    if (confirmButtonLabel) return confirmButtonLabel;
    if (isCurrentPreOrder) return "Đặt Trước";
    if (isOutOfStockSelection) return "Liên Hệ Khi Có Hàng";
    return "Thêm Vào Giỏ Hàng";
  };

  const isFavorite = Boolean(product?.id && isProductWished(String(product.id)));

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product?.id) {
      void handleToggleWishlist([String(product.id)]);
    }
  };

  const handleBackInStockRequest = async () => {
    if (isLoading) return;
    const phone = contactValue.trim();
    if (phone && !PHONE_REGEX.test(phone)) {
      setContactError(VALIDATION_MESSAGES.phone);
      return;
    }
    setIsLoading(true);
    setContactError("");
    try {
      await CustomerRequestApi.postBackInStockRequest({
        phone,
        skuCode: currentVariation?.skuCode ?? "",
      });
      toast.success("Cảm ơn bạn! Chúng tôi sẽ liên hệ ngay khi có hàng.");
      setContactValue("");
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error) || "Không thể đăng ký. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAddToCart = () => {
    if (!currentVariation) {
      return;
    }
    if (isDiscontinued) {
      return;
    }
    if (isOutOfStockSelection) {
      handleBackInStockRequest();
      return;
    }

    const resolvedProduct = product;
    if (!resolvedProduct) {
      return;
    }

    const optimisticItem = buildCartViewItemFromVariationsApiResponse(slug, resolvedProduct, currentVariation, attributes);

    onConfirmAddToCart?.(currentVariation.id, optimisticItem);
    onClose();
  };

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={() => {
        onClose();
        setContactValue("");
        setContactError("");
      }}
      PaperProps={{ className: cx(classes.drawerPaper, isCartUpdate && classes.cartUpdateDrawerPaper) }}
      ModalProps={{
        keepMounted: true,
        disableScrollLock: true,
        sx: { zIndex: zIndex.productQuickViewModal },
      }}
    >
      <Box className={cx(classes.root, isCartUpdate && classes.cartUpdateRoot, "item")}>
        <StackRowAlignCenterJustBetween className={classes.header}>
          <Typography className={classes.title}>{isCartUpdate ? "Cập nhật sản phẩm" : "Thông tin sản phẩm"}</Typography>
          <XClose
            size={24}
            onClick={() => {
              onClose();
              setContactValue("");
              setContactError("");
            }}
          />
        </StackRowAlignCenterJustBetween>

        <RemoveScroll enabled={open} forwardProps>
          <Box className={classes.body}>
            {isProductLoading ? (
              <Typography sx={{ p: 2 }}>Đang tải...</Typography>
            ) : !product || !currentVariation ? (
              <Typography sx={{ p: 2 }}>Không tìm thấy dữ liệu sản phẩm.</Typography>
            ) : (
              <Box className={classes.productWrapper}>
                <Box className={classes.topSection}>
                  <Box className={classes.thumb}>
                    <Box
                      component="img"
                      src={currentVariation.image || product.image || productDefaultImage}
                      alt={product.name}
                      width="100%"
                      height="100%"
                      // className={cx("img-product")}
                      style={{ objectFit: "cover" }}
                    />
                  </Box>

                  <Box className={classes.productInfo}>
                    <Typography className={classes.productName}>{product.name}</Typography>
                    {isDiscontinued ? (
                      <StatusBadge label="Ngừng kinh doanh" color="#4B5563" backgroundColor="rgba(75, 85, 99, 0.12)" size="sm" />
                    ) : isCurrentPreOrder ? (
                      <StatusBadge
                        label="Đặt trước"
                        color={PRE_ORDER_BADGE_COLORS.color}
                        backgroundColor={PRE_ORDER_BADGE_COLORS.backgroundColor}
                        size="sm"
                      />
                    ) : isOutOfStockSelection ? (
                      <StatusBadge label="Hết hàng" color="#F04438" backgroundColor="rgba(240, 68, 56, 0.12)" size="sm" />
                    ) : (
                      <StatusBadge label="Đang có hàng" color="#019A01" backgroundColor="rgba(1, 154, 1, 0.12)" size="sm" />
                    )}
                    <Box className={classes.priceRow}>
                      <Typography className={classes.salePrice}>{currentSellingPrice.toLocaleString()}đ</Typography>
                      {hasCurrentDiscount ? (
                        <Typography className={classes.originalPrice}>{currentOriginalPrice.toLocaleString()}đ</Typography>
                      ) : null}
                      {showDiscountPercentTag && <DiscountPercentTag discountPercent={currentDisplayPrice?.discountPercent} />}
                    </Box>
                  </Box>
                </Box>

                <ProductVariantSelector
                  variantSelectors={variantSelectors}
                  selectedAttributes={selectedAttributes}
                  onAttributeSelect={(attrCode: string, valueCode: string) =>
                    setSelectedAttributes((prev) => ({ ...prev, [attrCode]: valueCode }))
                  }
                  onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                />

                {isOutOfStockSelection && (
                  <Box className={classes.contactInputWrapper}>
                    <TextFieldComponent
                      label="Số điện thoại của bạn"
                      value={contactValue}
                      onChange={(event) => {
                        setContactValue(event.target.value);
                        if (contactError) setContactError("");
                      }}
                      className={classes.contactInput}
                      error={contactError}
                    />
                  </Box>
                )}

                <Box className={cx(classes.footer, isCartUpdate && classes.footerFullWidth)}>
                  <Button
                    type="button"
                    fullWidth={isCartUpdate}
                    className={cx(classes.addButton, `${isOutOfStockSelection ? "" : "add-to-cart"}`)}
                    onClick={handleConfirmAddToCart}
                    variant="contained"
                    disabled={isDiscontinued || isLoading}
                  >
                    {resolveConfirmLabel()}
                  </Button>
                  {!isCartUpdate ? (
                    <Box className={classes.likeButton} onClick={handleToggleFavorite}>
                      {isFavorite ? <Heart size={16} color="#9259E3" fill="#9259E3" /> : <Heart size={16} color="#737373" />}
                    </Box>
                  ) : null}
                </Box>
              </Box>
            )}
          </Box>
        </RemoveScroll>
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
    </Drawer>
  );
};

export default ProductQuickViewDrawer;
