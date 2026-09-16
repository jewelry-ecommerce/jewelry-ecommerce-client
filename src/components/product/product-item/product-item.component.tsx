import { Box, Button, SxProps, Theme, Typography } from "@mui/material";
import { CdnImage } from "@/components/cdn-image";
import { useRouter } from "next/navigation";
import React, { useMemo, useRef, useState } from "react";
import { useFetchProductBadgesBatch } from "@/hooks/use-fetch-product-badges-batch.hook";
import { useProductCardCdnTransform } from "@/hooks/use-product-card-cdn-transform.hook";
import useStyles from "./product-item.styles";
import ProductQuickViewDrawer from "@/components/product/product-quick-view-drawer/product-quick-view-drawer.component";
import { Heart, Plus } from "@untitledui/icons";
import { ProductLifecycleStatus, ProductStockStatus, ProductVariationStatus } from "@/utils/api/product/product.enum";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import {
  buildCartViewItemFromProductSwatchCard,
  buildCartViewItemFromVariationsApiResponse,
} from "@/utils/api/cart/cart-view-item-builder.util";
import { ProductApi } from "@/utils/api";
import type { IProductVariationResponse, IProductVariationsResponse } from "@/utils/api/product/product.interface";
import { useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import { selectProductBadgePayload } from "@/redux/slices/badge.slice";
import { BadgePosition } from "@/utils/api/badge/badge.interface";
import { pickProductBadgesForCard, resolveProductCardVariantId, type BadgeBatchProductSource } from "@/utils/api/badge/badge.util";
import ProductBadge from "./product-badge.component";
import { DiscountPercentTag } from "@/components/product/discount-percent-tag/discount-percent-tag.component";
import { shouldShowDiscountPercentTag } from "@/utils/customer-display-price.util";
import { formatPrice } from "@/utils/constants/common.constant";
import { buildAuthUrl } from "@/utils/helpers/common/navigation";
import { useProductDefaultImage } from "@/components/providers.component";
import {
  PRODUCT_CARD_IMAGE_HEIGHT,
  PRODUCT_CARD_IMAGE_SIZES,
  PRODUCT_CARD_IMAGE_WIDTH,
} from "@/components/product/product-grid/product-grid.constants";
import { dispatchCartFlowAnimate } from "@/components/fly-to-cart/cart-flow.events";
import { hasActivePreOrderCampaign } from "@/utils/product/purchase-action.util";
import { isVariationAvailableForPurchase } from "@/utils/product/variant-availability.util";

export type ProductLabelPosition = "top-left" | "top-right" | "center-left" | "center-right" | "bottom-left" | "bottom-right" | "center";

export interface ProductVariant {
  label: string;
  image: string;
  imageHover?: string;
  thumbnail?: string;
  selected: boolean;
  valueCode?: string;
  sellingPriceAfterTaxMinor?: number;
  compareAtPriceAfterTaxMinor?: number | null;
  stockStatus?: string;
  /** Từ API catalog khi có (Freesize / thêm nhanh) */
  variationId?: string;
  /** SKU đang thuộc campaign đặt trước — vẫn thêm giỏ dù OUT_OF_STOCK */
  preOrderCampaignId?: string | null;
  discountPercent?: number | null;
  hasDiscount?: boolean;
}

export interface ProductItemProps {
  id: string;
  name: string;
  sellingPriceAfterTaxMinor: number;
  compareAtPriceAfterTaxMinor?: number | null;
  discountPercent?: number | null;
  hasDiscount?: boolean;
  showDiscountPercent?: boolean;
  images: string[];
  label?: string;
  labelPosition?: ProductLabelPosition;
  variants?: ProductVariant[];
  slug?: string;
  isMobileTemplate?: boolean;
  hideColor?: boolean;
  variantAttributeCode?: string;
  onAddToCart?: (id: string, item?: CartViewItem) => void;
  onClick?: (slug: string) => void;
  sx?: SxProps<Theme>;
  stockStatus?: string;
  productStatus?: string;
  isPurchasable?: boolean;
  /** false: thêm thẳng vào giỏ với màu đang xem, không mở popup chọn size */
  requiresSelectionDialog?: boolean;
  isWishlistActive?: boolean;
  onToggleFavorite?: (productIds: string[]) => void | Promise<void>;
  hideAddToCart?: boolean;
  defaultVariationId?: string | null;
  priority?: boolean;
  skipBadgeFetch?: boolean;
}

const isVariationAutoAddable = (variation: IProductVariationResponse): boolean =>
  variation.status === ProductVariationStatus.ACTIVE && isVariationAvailableForPurchase(variation);

const isProductAutoAddable = (product?: IProductVariationsResponse["product"]): boolean =>
  Boolean(product && product.isPurchasable === true && product.status === ProductLifecycleStatus.PUBLISHED);

const findSingleAutoAddableVariation = (data: IProductVariationsResponse): IProductVariationResponse | undefined => {
  if (!isProductAutoAddable(data.product) || data.variations.length !== 1) {
    return undefined;
  }

  const [variation] = data.variations;
  return variation && isVariationAutoAddable(variation) ? variation : undefined;
};

const findVariationByAttribute = (
  variations: IProductVariationResponse[],
  attributeCode: string,
  valueCode: string,
): IProductVariationResponse | undefined =>
  variations.find((variation) =>
    variation.attributeValues.some(
      (attributeValue) => attributeValue.attributeCode === attributeCode && attributeValue.valueCode === valueCode,
    ),
  );

const ProductItemComponent = ({
  id,
  name,
  compareAtPriceAfterTaxMinor,
  sellingPriceAfterTaxMinor,
  discountPercent: productDiscountPercent,
  hasDiscount: productHasDiscount,
  showDiscountPercent,
  images,
  label,
  labelPosition = "top-left",
  variants = [],
  slug,
  isMobileTemplate,
  hideColor,
  variantAttributeCode,
  onAddToCart,
  onClick,
  sx,
  stockStatus,
  productStatus,
  isPurchasable,
  requiresSelectionDialog = true,
  isWishlistActive = false,
  onToggleFavorite,
  hideAddToCart = false,
  defaultVariationId,
  priority = false,
  skipBadgeFetch = false,
}: ProductItemProps) => {
  const router = useRouter();
  const isLogin = useAppSelector(selectIsLogin);
  const productDefaultImage = useProductDefaultImage();
  const imageSectionRef = useRef<HTMLDivElement>(null);
  const productCardCdnTransform = useProductCardCdnTransform(imageSectionRef);

  const badgeFetchProducts = useMemo<BadgeBatchProductSource[]>(() => {
    if (skipBadgeFetch) {
      return [];
    }

    return [{ id, variants, defaultVariationId, stockStatus }];
  }, [defaultVariationId, id, skipBadgeFetch, stockStatus, variants]);
  useFetchProductBadgesBatch(badgeFetchProducts);

  const badgePayload = useAppSelector((state) => selectProductBadgePayload(state, id));

  const defaultIndex = Math.max(
    variants.findIndex((v) => v.selected),
    0,
  );
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const activeVariant = variants[activeIndex];
  const displayVariant = variants[previewIndex ?? activeIndex] ?? activeVariant;
  const badgeVariantId = activeVariant?.variationId?.trim() || resolveProductCardVariantId(variants, defaultVariationId);
  const cardBadges = useMemo(() => pickProductBadgesForCard(badgePayload, badgeVariantId), [badgePayload, badgeVariantId]);
  const imageBadges = useMemo(() => cardBadges.filter((b) => b.position !== BadgePosition.PRICE_LINE), [cardBadges]);
  const priceBadges = useMemo(() => cardBadges.filter((b) => b.position === BadgePosition.PRICE_LINE), [cardBadges]);
  const statusLabel = cardBadges.length === 0 ? label?.trim() : undefined;
  const { classes, cx } = useStyles({ isMobileTemplate });

  const committedSellingPrice = activeVariant?.sellingPriceAfterTaxMinor ?? sellingPriceAfterTaxMinor;
  const committedOriginalPrice = activeVariant?.compareAtPriceAfterTaxMinor ?? compareAtPriceAfterTaxMinor ?? committedSellingPrice;
  const displaySellingPrice = displayVariant?.sellingPriceAfterTaxMinor ?? committedSellingPrice;
  const displayOriginalPrice = displayVariant?.compareAtPriceAfterTaxMinor ?? displaySellingPrice;
  const activeImage = displayVariant?.image || images[0];
  const primarySrc = activeImage || productDefaultImage;
  const hoverSrc = displayVariant?.imageHover || (displayVariant === activeVariant ? images[1] : undefined);
  const hasHoverImage = Boolean(hoverSrc);
  const hasDisplayDiscount = displayOriginalPrice > displaySellingPrice;
  const customerDisplayHasDiscount =
    displayVariant === activeVariant ? (displayVariant?.hasDiscount ?? productHasDiscount) : displayVariant?.hasDiscount;
  const customerDisplayDiscountPercent =
    displayVariant === activeVariant ? (displayVariant?.discountPercent ?? productDiscountPercent) : displayVariant?.discountPercent;
  const showDiscountPercentTag = shouldShowDiscountPercentTag({
    showDiscountPercent,
    hasDiscount: customerDisplayHasDiscount,
    discountPercent: customerDisplayDiscountPercent,
  });
  const isDiscontinued = productStatus === ProductLifecycleStatus.DISCONTINUED || isPurchasable === false;
  const isActiveVariantNotifyOnly =
    activeVariant?.stockStatus === ProductStockStatus.OUT_OF_STOCK && !hasActivePreOrderCampaign(activeVariant?.preOrderCampaignId);

  const handleVariantClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setActiveIndex(index);
    setPreviewIndex(null);
  };

  const handleVariantHover = (index: number) => {
    setPreviewIndex(index);
  };

  const handleVariantHoverEnd = (index: number) => {
    setPreviewIndex((current) => (current === index ? null : current));
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isLogin) {
      router.push(buildAuthUrl("/dang-nhap"));
      return;
    }

    await onToggleFavorite?.([id]);
  };

  const invokeAddToCart = (variationId: string, optimisticItem: CartViewItem): boolean => {
    if (!onAddToCart) {
      return false;
    }

    const result = onAddToCart(variationId, optimisticItem) as void | { success?: boolean } | Promise<{ success?: boolean }>;

    // Sync rejection from useAddToCart (limit / auth-pending)
    if (result && typeof result === "object" && !("then" in result) && result.success === false) {
      return false;
    }

    // Promise = optimistic cart update already applied; do not wait for API persist.
    return true;
  };

  const addActiveVariantToCart = (): boolean => {
    if (requiresSelectionDialog !== false || !activeVariant?.variationId || !slug || !onAddToCart) {
      return false;
    }

    const optimisticItem = buildCartViewItemFromProductSwatchCard({
      variationId: activeVariant.variationId,
      name,
      slug,
      productId: id,
      images,
      label: activeVariant.label,
      image: activeVariant.image || images[0] || "",
      compareAtPriceAfterTaxMinor: committedOriginalPrice > committedSellingPrice ? committedOriginalPrice : undefined,
      sellingPriceAfterTaxMinor: committedSellingPrice,
      stockStatus: activeVariant.stockStatus,
      preOrderCampaignId: activeVariant.preOrderCampaignId,
      showDiscountPercent,
    });
    return invokeAddToCart(activeVariant.variationId, optimisticItem);
  };

  const addApiVariationToCart = (data: IProductVariationsResponse, variation?: IProductVariationResponse): boolean => {
    if (!variation || !slug || !onAddToCart || !isProductAutoAddable(data.product) || !isVariationAutoAddable(variation)) {
      return false;
    }

    const optimisticItem = buildCartViewItemFromVariationsApiResponse(slug, data.product, variation, data.attributes ?? []);
    return invokeAddToCart(variation.id, optimisticItem);
  };

  const addSelectedAttributeVariationToCart = async (): Promise<boolean> => {
    if (requiresSelectionDialog !== false || !variantAttributeCode || !activeVariant?.valueCode || !slug || !onAddToCart) {
      return false;
    }

    const data = await ProductApi.getProductVariationsBySlug(slug);
    const matchedVariation = findVariationByAttribute(data.variations, variantAttributeCode, activeVariant.valueCode);
    return addApiVariationToCart(data, matchedVariation);
  };

  const addSingleVariationToCart = async (): Promise<boolean> => {
    if (requiresSelectionDialog === false || !slug || !onAddToCart) {
      return false;
    }

    const data = await ProductApi.getProductVariationsBySlug(slug);
    return addApiVariationToCart(data, findSingleAutoAddableVariation(data));
  };

  const runDirectAdd = async (): Promise<boolean> => {
    try {
      if (addActiveVariantToCart()) {
        return true;
      }

      return (await addSelectedAttributeVariationToCart()) || (await addSingleVariationToCart());
    } catch {
      return false;
    }
  };

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const addToCartButton = e.currentTarget;

    if (isDiscontinued) {
      return;
    }

    if (isActiveVariantNotifyOnly) {
      setIsQuickViewOpen(true);
      return;
    }

    const directAddSucceeded = await runDirectAdd();
    if (directAddSucceeded) {
      dispatchCartFlowAnimate(addToCartButton);
      return;
    }

    setIsQuickViewOpen(true);
  };

  const swatches = variants.map((variant, index) => ({ variant, index })).filter(({ variant }) => variant.thumbnail?.trim());
  const visibleSwatches = swatches.slice(0, 3);
  const extraCount = Math.max(0, swatches.length - 3);

  return (
    <React.Fragment>
      <Box className={cx(classes.root, "item")} sx={sx} onClick={() => onClick?.(slug || id)}>
        <Box ref={imageSectionRef} className={cx(classes.imageSection, { [classes.imageSectionHasHover]: hasHoverImage })}>
          <CdnImage
            as="next"
            src={primarySrc}
            transform={productCardCdnTransform}
            alt={name}
            width={PRODUCT_CARD_IMAGE_WIDTH}
            height={PRODUCT_CARD_IMAGE_HEIGHT}
            sizes={PRODUCT_CARD_IMAGE_SIZES}
            priority={priority}
            className={cx(classes.productImage, classes.primaryImage, "primary-image")}
            loading={priority ? undefined : "lazy"}
          />
          {hasHoverImage ? (
            <CdnImage
              as="next"
              src={hoverSrc}
              transform={productCardCdnTransform}
              alt=""
              width={PRODUCT_CARD_IMAGE_WIDTH}
              height={PRODUCT_CARD_IMAGE_HEIGHT}
              sizes={PRODUCT_CARD_IMAGE_SIZES}
              loading="lazy"
              className={cx(classes.productImage, classes.hoverImage, "hover-image")}
              aria-hidden
            />
          ) : null}

          {imageBadges.map((badge, index) => (
            <ProductBadge key={`${badge.position}-${index}`} badge={badge} classes={classes} />
          ))}
          {statusLabel ? <Box className={classes.statusLabelTag}>{statusLabel}</Box> : null}

          <Box className={cx(classes.favoriteIconWrapper, "favorite-icon")} onClick={handleToggleFavorite}>
            {isWishlistActive ? <Heart size={20} color="#9259E3" fill="#9259E3" /> : <Heart size={20} color="#333" />}
          </Box>

          {!hideAddToCart ? (
            <Button className={cx(classes.addToCartBtn, "add-to-cart-btn")} onClick={handleAddToCart} disabled={isDiscontinued}>
              <Plus size={16} color="#333" />
              {!isMobileTemplate && (
                <Box component="span" className={classes.btnText}>
                  {isDiscontinued ? "Ngừng kinh doanh" : isActiveVariantNotifyOnly ? "Liên hệ khi có hàng" : "Thêm vào giỏ hàng"}
                </Box>
              )}
            </Button>
          ) : null}
        </Box>

        {/* ─── Thông tin sản phẩm ─── */}
        <Box className={classes.infoSection}>
          <Typography className={classes.productName}>{name}</Typography>

          <Box className={classes.priceColorBox}>
            <Box className={classes.priceRow} sx={{ position: "relative", pr: priceBadges.length > 0 ? 6 : 0 }}>
              <Typography className={classes.currentPrice}>{formatPrice(displaySellingPrice)}</Typography>
              {hasDisplayDiscount ? <Typography className={classes.salePrice}>{formatPrice(displayOriginalPrice)}</Typography> : null}
              {showDiscountPercentTag && <DiscountPercentTag discountPercent={customerDisplayDiscountPercent} />}
              {priceBadges.map((badge, index) => (
                <ProductBadge key={`price-${index}`} badge={badge} classes={classes} />
              ))}
            </Box>

            {!hideColor && (
              <Box className={classes.colorPalette}>
                {visibleSwatches.map(({ variant, index }) => (
                  <Box
                    key={variant.valueCode ?? index}
                    className={classes.colorDotWrapper}
                    onClick={(e) => handleVariantClick(e, index)}
                    onMouseEnter={() => handleVariantHover(index)}
                    onMouseLeave={() => handleVariantHoverEnd(index)}
                  >
                    <Box className={classes.colorDot}>
                      <CdnImage
                        as="next"
                        src={variant.thumbnail!.trim()}
                        preset="swatch"
                        alt={variant.label}
                        fill
                        sizes="12px"
                        style={{ objectFit: "cover" }}
                      />
                    </Box>
                    <Box className={cx(classes.colorDotLine, { [classes.colorDotLineActive]: activeIndex === index })} />
                  </Box>
                ))}
                {extraCount > 0 && <Typography className={classes.colorCount}>+{extraCount}</Typography>}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {!hideAddToCart ? (
        <ProductQuickViewDrawer
          open={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          onConfirmAddToCart={(productId, item) => onAddToCart?.(productId, item)}
          slug={slug || ""}
          initialAttributes={variantAttributeCode ? { [variantAttributeCode]: variants[activeIndex]?.valueCode || "" } : undefined}
        />
      ) : null}
    </React.Fragment>
  );
};

export default ProductItemComponent;
