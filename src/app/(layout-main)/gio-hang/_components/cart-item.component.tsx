/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import CustomIconGift from "@/assets/icon/CustomGift";
import { CdnImage } from "@/components/cdn-image";
import { StackRow, StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled";
import { CartAttachedItem, CartItemData } from "@/utils/api/cart/cart.interface";
import { isCartItemInvalidOutOfStock } from "@/utils/api/cart/cart.util";
import { Box, Checkbox, IconButton, Typography, useMediaQuery } from "@mui/material";
import Link from "next/link";
import { useMemo } from "react";
import useStyles, { cartItemGiftImage, cartItemLineItemImage } from "./cart-item.styles";
import { CartItemPriceRow } from "./cart-item-price-row.component";
import { CartItemQuantity } from "./cart-item-quantity.component";
import { CartItemStatusBadge } from "./cart-item-status.component";
import { Edit02, Trash03 } from "@untitledui/icons";
import { useProductDefaultImage } from "@/components/providers.component";

export type CartItemProps = {
  item: CartItemData;
};

const formatAttachedPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

const SHOW_PACKAGING_UI = false;

const isPackagingAttachedItem = (gift: CartAttachedItem) => {
  const badge = gift.badge?.toLowerCase() ?? "";
  return badge.includes("bao bì") || badge.includes("hộp đựng");
};

const CartItemComponent = ({ item }: CartItemProps) => {
  const productDefaultImage = useProductDefaultImage();
  const { classes, cx } = useStyles();
  const isMobileQuery = useMediaQuery((theme: any) => theme.breakpoints.down("md"));

  const {
    id,
    image,
    name,
    productSlug,
    details = [],
    sizeLabel,
    status,
    quantity,
    minQuantity = 1,
    maxQuantity,
    disableQuantityControl = false,
    price,
    gifts = [],
    packaging,
    editLabel = <Edit02 size={16} color="#737373" />,
    wishlistLabel = "Thêm Vào Yêu Thích",
    onQuantityChange,
    onPackagingSelectionChange,
    onRemove,
    onEdit,
    onAddToWishlist,
  } = item;

  const isInvalidOutOfStock = isCartItemInvalidOutOfStock(item);
  const productHref = productSlug ? `/san-pham/${productSlug}` : undefined;
  const visibleGifts = gifts.filter((gift) => !isPackagingAttachedItem(gift));

  const memoizedContent = useMemo(() => {
    const lineItemImageSize = isMobileQuery ? cartItemLineItemImage.mobile : cartItemLineItemImage.desktop;
    const productImage = (
      <CdnImage
        as="next"
        src={image?.src}
        fallback={productDefaultImage}
        alt={image?.alt || name}
        width={lineItemImageSize.width}
        height={lineItemImageSize.height}
        preset={isMobileQuery ? "cartLineItemMobile" : "cartLineItem"}
        className={classes.image}
        sizes={`${lineItemImageSize.width}px`}
      />
    );

    return (
      <Box className={cx(classes.root, isInvalidOutOfStock && classes.outOfStockRoot)}>
        <Box className={classes.mainRow}>
          <Box className={classes.productCol}>
            <Box className={classes.productTopRow}>
              <Box className={classes.imageWrap}>
                {productHref ? (
                  <Link href={productHref} className={classes.productImageLink}>
                    {productImage}
                  </Link>
                ) : (
                  productImage
                )}
              </Box>

              <Box className={classes.infoCol}>
                {productHref ? (
                  <Link href={productHref} className={classes.productNameLink}>
                    <Typography className={classes.name}>{name}</Typography>
                  </Link>
                ) : (
                  <Typography className={classes.name}>{name}</Typography>
                )}

                <Typography className={classes.detailLine}>{details}</Typography>

                {sizeLabel && !isMobileQuery && <Typography className={classes.sizeLine}>Size: {sizeLabel}</Typography>}
                <Box
                  sx={{
                    display: isMobileQuery ? "flex" : "none",
                    width: "100%",
                    gap: 0,
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box className={classes.priceCol}>
                    <CartItemPriceRow price={price} classes={classes} />
                  </Box>
                  <StackRowAlignCenter gap={0.5}>
                    <CartItemQuantity
                      id={id}
                      quantity={quantity}
                      minQuantity={minQuantity}
                      maxQuantity={maxQuantity}
                      disableQuantityControl={disableQuantityControl}
                      onQuantityChange={onQuantityChange}
                      onRemove={onRemove}
                      className={classes.quantityControl}
                    />
                  </StackRowAlignCenter>
                </Box>

                {status && !isMobileQuery && <CartItemStatusBadge status={status} />}
                {!isMobileQuery && (
                  <Box className={classes.actionRow}>
                    <Typography component="button" type="button" className={classes.actionButton} onClick={() => onEdit?.(productSlug, id)}>
                      {editLabel}
                    </Typography>
                    <Typography className={classes.actionDivider}>|</Typography>
                    <Typography component="button" type="button" className={classes.actionButton} onClick={() => onAddToWishlist?.()}>
                      {wishlistLabel}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {isMobileQuery && (
              <StackRow className={classes.mobileFooterRow}>
                <Box className={classes.mobileFooterStatusSlot}>
                  {status && <CartItemStatusBadge status={status} tagClassName={classes.mobileStatusTag} />}
                  {status?.helperText && !status.notes?.length ? (
                    <Typography className={classes.helperText}>{status.helperText}</Typography>
                  ) : null}
                </Box>
                <Box className={classes.mobileFooterActions}>
                  <Box className={classes.actionRow}>
                    <Typography component="button" type="button" className={classes.actionButton} onClick={() => onEdit?.(productSlug, id)}>
                      {editLabel}
                    </Typography>
                    <Typography className={classes.actionDivider}>|</Typography>
                    <Typography component="button" type="button" className={classes.actionButton} onClick={() => onAddToWishlist?.()}>
                      {wishlistLabel}
                    </Typography>
                  </Box>
                  <IconButton className={classes.removeButton} onClick={() => onRemove?.(id)} aria-label="Remove item">
                    <Trash03 size={16} color="#000" />
                  </IconButton>
                </Box>
              </StackRow>
            )}
          </Box>

          {!isMobileQuery && (
            <Box className={classes.quantityCol}>
              <CartItemQuantity
                id={id}
                quantity={quantity}
                minQuantity={minQuantity}
                maxQuantity={maxQuantity}
                disableQuantityControl={disableQuantityControl}
                onQuantityChange={onQuantityChange}
                onRemove={onRemove}
                className={classes.quantityControl}
              />
              {status?.helperText && !status.notes?.length ? (
                <Typography className={classes.helperText}>{status.helperText}</Typography>
              ) : null}
            </Box>
          )}

          <Box className={classes.totalCol}>
            <Box className={classes.priceCol}>
              <CartItemPriceRow price={price} classes={classes} />
            </Box>

            <IconButton className={classes.removeButton} onClick={() => onRemove?.(id)} aria-label="Remove item">
              <Trash03 size={16} color="#000" />
            </IconButton>
          </Box>
        </Box>

        {visibleGifts.length > 0 && (
          <Box className={classes.attachedGroup}>
            {visibleGifts.map((gift) => (
              <Box key={gift.id} className={classes.attachedRow}>
                <StackRow className={classes.attachedStack}>
                  <Box className={classes.attachedImageSlot}>
                    <Box className={classes.attachedImageBox}>
                      <CdnImage
                        as="next"
                        src={gift.image.src}
                        fallback={productDefaultImage}
                        alt={gift.image.alt || gift.name}
                        width={cartItemGiftImage.width}
                        height={cartItemGiftImage.height}
                        preset="cartGiftLineItem"
                        className={classes.attachedImage}
                        sizes={`${cartItemGiftImage.width}px`}
                      />
                    </Box>
                  </Box>

                  <Box className={classes.attachedInfoCol}>
                    {gift.badge && (
                      <StackRowAlignCenter className={classes.attachedBadge}>
                        <CustomIconGift width={12} height={12} />
                        <Typography className={classes.attachedBadgeText}>{gift.badge}</Typography>
                      </StackRowAlignCenter>
                    )}
                    <Typography className={classes.attachedName}>{gift.name}</Typography>
                    {gift.subInfo && <Typography className={classes.attachedSubInfo}>{gift.subInfo}</Typography>}
                    {gift.size && <Typography className={classes.attachedSizeLine}>{gift.size}</Typography>}
                  </Box>
                </StackRow>

                <Box className={classes.attachedQtyCol}>
                  <Typography className={classes.attachedQuantity}>x{gift.quantityLabel}</Typography>
                </Box>

                {!isMobileQuery && (
                  <Box className={classes.attachedPriceCol}>
                    <CartItemPriceRow
                      price={gift.price}
                      classes={{
                        currentPrice: classes.attachedCurrentPrice,
                        originalPriceRow: classes.originalPriceRow,
                        originalPrice: classes.attachedOriginalPrice,
                      }}
                    />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        {SHOW_PACKAGING_UI &&
          (packaging?.optionalPackagingOptions ?? []).map((option) => {
            const isSelected = packaging?.selectedOptionalPackagingRelationIds?.includes(option.relationId) ?? false;
            const includedPrice = Number(option.includedPriceAfterTax ?? option.packaging?.includedPriceAfterTax ?? 0);
            const retailPrice = Number(option.packaging?.basePriceAfterTax ?? includedPrice);

            return (
              <StackRowAlignCenterJustBetween key={option.relationId} className={classes.packagingOptionRow}>
                <StackRowAlignCenter gap={1.5} className={classes.packagingOptionInfo}>
                  <Checkbox
                    checked={isSelected}
                    onChange={(_, checked) => onPackagingSelectionChange?.(id, option.relationId, checked)}
                    disabled={option.canCustomerChoose === false}
                    className={classes.packagingCheckbox}
                  />
                  <Box className={classes.packagingOptionContent}>
                    <Typography className={classes.packagingOptionName}>{option.packaging?.name || "Packaging"}</Typography>
                    <Typography
                      className={classes.packagingOptionMeta}
                    >{`x${quantity} • ${option.packaging?.skuCode || "Packaging SKU"}`}</Typography>
                  </Box>
                </StackRowAlignCenter>

                <Box className={classes.packagingOptionPrice}>
                  <Typography className={classes.currentPrice}>{formatAttachedPrice(includedPrice)}</Typography>
                  {retailPrice > includedPrice && (
                    <Typography className={classes.originalPrice}>{formatAttachedPrice(retailPrice)}</Typography>
                  )}
                </Box>
              </StackRowAlignCenterJustBetween>
            );
          })}
      </Box>
    );
  }, [
    visibleGifts,
    packaging,
    classes,
    cx,
    details,
    editLabel,
    id,
    image?.alt,
    image?.src,
    name,
    productDefaultImage,
    onAddToWishlist,
    onEdit,
    onPackagingSelectionChange,
    onRemove,
    onQuantityChange,
    price,
    quantity,
    minQuantity,
    sizeLabel,
    status,
    wishlistLabel,
    isMobileQuery,
    isInvalidOutOfStock,
    maxQuantity,
    disableQuantityControl,
    productHref,
  ]);

  return <>{memoizedContent}</>;
};

export default CartItemComponent;
