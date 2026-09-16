"use client";

import { Edit02, Trash03 } from "@untitledui/icons";
import { CdnImage } from "@/components/cdn-image";
import { CartItemData } from "@/utils/api/cart/cart.interface";
import { isCartItemInvalidOutOfStock } from "@/utils/api/cart/cart.util";
import { Box, IconButton, Typography } from "@mui/material";
import Link from "next/link";
import useStyles, { cartMiniItemImage } from "./cart-item-for-cart-mini.styles";
import { CartItemPriceRow } from "./cart-item-price-row.component";
import { CartItemQuantity } from "./cart-item-quantity.component";
import { CartItemStatusBadge } from "./cart-item-status.component";
import { useProductDefaultImage } from "@/components/providers.component";

export type CartItemProps = {
  item: CartItemData;
  isLast: boolean;
};

const CartMiniItemComponent = ({ item, isLast }: CartItemProps) => {
  const productDefaultImage = useProductDefaultImage();
  const { classes, cx } = useStyles();

  const {
    id,
    image,
    name,
    details = "",
    sizeLabel,
    status,
    quantity,
    minQuantity = 1,
    maxQuantity,
    disableQuantityControl = false,
    price,
    editLabel = <Edit02 size={16} color="#737373" />,
    wishlistLabel = "Thêm vào yêu thích",
    productSlug,
    onQuantityChange,
    onRemove,
    onEdit,
    onAddToWishlist,
    onclose,
  } = item;

  const isInvalidOutOfStock = isCartItemInvalidOutOfStock(item);
  const productHref = productSlug ? `/san-pham/${productSlug}` : undefined;

  return (
    <Box className={cx(isLast ? classes.rootLast : classes.root, isInvalidOutOfStock && classes.outOfStockRoot)}>
      <Box className={classes.mainRow}>
        <Box className={classes.imageBox}>
          {productHref ? (
            <Link href={productHref} className={classes.productImageLink} onClick={onclose}>
              <CdnImage
                as="next"
                src={image?.src}
                fallback={productDefaultImage}
                alt={image?.alt || name}
                width={cartMiniItemImage.width}
                height={cartMiniItemImage.height}
                preset="cartMiniLineItem"
                className={classes.image}
                sizes={`${cartMiniItemImage.width}px`}
              />
            </Link>
          ) : (
            <CdnImage
              as="next"
              src={image?.src}
              fallback={productDefaultImage}
              alt={image?.alt || name}
              width={cartMiniItemImage.width}
              height={cartMiniItemImage.height}
              preset="cartMiniLineItem"
              className={classes.image}
              sizes={`${cartMiniItemImage.width}px`}
            />
          )}
        </Box>

        <Box className={classes.infoCol}>
          {productHref ? (
            <Link href={productHref} className={classes.productNameLink} onClick={onclose}>
              <Typography className={classes.name}>{name}</Typography>
            </Link>
          ) : (
            <Typography className={classes.name}>{name}</Typography>
          )}

          {!!details && <Typography className={classes.detailLine}>{details}</Typography>}

          {sizeLabel && <Typography className={classes.sizeLine}>Size: {sizeLabel}</Typography>}

          {status ? <CartItemStatusBadge status={status} /> : null}

          <Box className={classes.actionRow}>
            <Typography component="button" type="button" className={classes.actionButton} onClick={() => onEdit?.(productSlug, id)}>
              {editLabel}
            </Typography>
            <Typography className={classes.actionDivider}>|</Typography>
            <Typography component="button" type="button" className={classes.actionButton} onClick={() => onAddToWishlist?.()}>
              {wishlistLabel}
            </Typography>
          </Box>

          <CartItemQuantity
            id={id}
            quantity={quantity}
            minQuantity={minQuantity}
            maxQuantity={maxQuantity}
            disableQuantityControl={disableQuantityControl}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
            className={classes.quantityControl}
            isMiniCart
          />
          {status?.helperText && !status.notes?.length ? <Typography className={classes.helperText}>{status.helperText}</Typography> : null}
        </Box>

        <Box className={classes.rightCol}>
          <Box className={classes.priceCol}>
            <CartItemPriceRow price={price} classes={classes} />
          </Box>

          <IconButton className={classes.removeButton} onClick={() => onRemove?.(id)} aria-label="Remove item">
            <Trash03 size={20} color="#BDBDBD" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default CartMiniItemComponent;
