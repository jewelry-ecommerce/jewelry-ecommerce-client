// set term
"use client";

import AppLink from "@/components/app-link/app-link.component";
import { CdnImage } from "@/components/cdn-image";
import SetBadge from "@/app/(layout-main)/sets/_components/set-badge.component";
import SetKeyBadge from "@/app/(layout-main)/sets/_components/set-key-badge.component";
import { useProductDefaultImage } from "@/components/providers.component";
import type { CartSetViewItem, CartViewItem } from "@/utils/api/cart/cart.interface";
import { Box, Collapse, IconButton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ChevronDown, ChevronUp, Edit02, Trash03 } from "@untitledui/icons";
import { useState } from "react";
import useCartMiniItemStyles, { cartMiniItemImage } from "./cart-item-for-cart-mini.styles";
import { CartItemPriceRow } from "./cart-item-price-row.component";
import { CartItemQuantity } from "./cart-item-quantity.component";
import useCartPageItemStyles, { cartItemLineItemImage } from "./cart-item.styles";
import { CartItemStatusBadge } from "./cart-item-status.component";
import { ProductStockStatus } from "@/utils/api/product/product.enum";
import { StackRowAlignCenterJustBetween } from "@/components/styled";
import { CART_ITEM_INVALID_REASON } from "@/utils/api/cart/cart.util";

type CartSetItemProps = {
  item: CartSetViewItem;
  compact?: boolean;
  onQuantityChange?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
  onEdit?: () => void;
  onNavigate?: () => void;
};

type SetComponentRowProps = {
  component: CartViewItem;
  fallback: string;
  compact: boolean;
  isMobile: boolean;
};

const SetComponentRow = ({ component, fallback, compact, isMobile }: SetComponentRowProps) => {
  const { classes } = useCartMiniItemStyles();
  const productHref = !component.isKey && component.productSlug ? `/san-pham/${component.productSlug}` : undefined;
  const setImageSize = compact ? cartMiniItemImage : isMobile ? cartItemLineItemImage.mobile : cartItemLineItemImage.desktop;
  const componentImageSize = { width: setImageSize.width / 2, height: setImageSize.height / 2 };
  const isOutOfStock = component.stockStatus === ProductStockStatus.OUT_OF_STOCK;
  const image = (
    <CdnImage
      as="next"
      src={component.image.src}
      fallback={fallback}
      alt={component.name}
      width={componentImageSize.width}
      height={componentImageSize.height}
      preset="cartMiniLineItem"
    />
  );
  const name = (
    <Typography className={classes.attachedName} sx={{ opacity: isOutOfStock ? 0.56 : 1 }}>
      {component.name}
    </Typography>
  );

  return (
    <Stack
      sx={{
        display: "grid",
        gridTemplateColumns: compact ? "88px minmax(0, 1fr)" : "var(--cart-product-image-width) minmax(0, 1fr)",
        columnGap: compact ? 1.5 : { xs: 1, md: 2 },
        py: 1,
      }}
    >
      <Box sx={{ ...componentImageSize, justifySelf: "end", bgcolor: "var(--product-image-background)" }}>
        {productHref ? <AppLink href={productHref}>{image}</AppLink> : image}
      </Box>
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Stack gap={compact ? 0.25 : 1}>
          {component.isKey ? <SetKeyBadge /> : null}
          {productHref ? (
            <AppLink href={productHref} className={classes.productNameLink}>
              {name}
            </AppLink>
          ) : (
            name
          )}
        </Stack>
        <Typography className={classes.attachedSubInfo} sx={{ opacity: isOutOfStock ? 0.56 : 1 }}>
          {component.details}
          {component.sizeLabel ? ` | Size: ${component.sizeLabel}` : ""}
        </Typography>
      </Stack>
    </Stack>
  );
};

type SetImageProps = Pick<CartSetItemProps, "item"> & { fallback: string; compact: boolean; isMobile: boolean };

const SetImage = ({ item, fallback, compact, isMobile, onNavigate }: SetImageProps & Pick<CartSetItemProps, "onNavigate">) => {
  const { classes: miniClasses } = useCartMiniItemStyles();
  const { classes: pageClasses } = useCartPageItemStyles();
  const href = item.productSlug ? `/sets/${item.productSlug}` : undefined;
  const size = compact ? { width: 88, height: 100 } : isMobile ? cartItemLineItemImage.mobile : cartItemLineItemImage.desktop;
  const image = (
    <CdnImage
      as="next"
      src={item.image.src}
      fallback={fallback}
      alt={item.name}
      width={size.width}
      height={size.height}
      preset={compact ? "cartMiniLineItem" : isMobile ? "cartLineItemMobile" : "cartLineItem"}
      className={compact ? miniClasses.image : pageClasses.image}
    />
  );

  return (
    <Box className={compact ? miniClasses.imageBox : pageClasses.imageWrap}>
      {href ? (
        <AppLink href={href} onClick={onNavigate} className={compact ? miniClasses.productImageLink : pageClasses.productImageLink}>
          {image}
        </AppLink>
      ) : (
        image
      )}
    </Box>
  );
};

type SetInfoProps = CartSetItemProps & { compact: boolean; isMobile: boolean; isExpanded: boolean; onToggle: () => void };

const getSetComponentCategoryLabel = (component: CartViewItem, components: CartViewItem[]) => {
  const categoryName = component.categoryName || component.name;
  const matchingComponents = components.filter((item) => (item.categoryName || item.name) === categoryName);

  return matchingComponents.length > 1 ? `${categoryName} ${matchingComponents.indexOf(component) + 1}` : categoryName;
};

const SetComponentSummaries = ({ components, className }: { components: CartViewItem[]; className: string }) => (
  <>
    {components.map((component) => (
      <Typography key={component.id} className={className}>
        {getSetComponentCategoryLabel(component, components)}
        {component.details ? `: ${component.details}` : ""}
        {component.sizeLabel ? ` | Size: ${component.sizeLabel}` : ""}
      </Typography>
    ))}
  </>
);

const resolveSetDisplayStatus = (components: CartViewItem[]) =>
  components.find((component) => component.stockStatus === ProductStockStatus.OUT_OF_STOCK)?.status ??
  components.find((component) => component.status?.tone === "success")?.status;

const hasInsufficientSetStock = (item: CartSetViewItem): boolean =>
  item.isValid === false &&
  (item.reason === CART_ITEM_INVALID_REASON.INSUFFICIENT_STOCK ||
    item.setComponents.some(
      (component) => component.isValid === false && component.reason === CART_ITEM_INVALID_REASON.INSUFFICIENT_STOCK,
    ));

const SetInsufficientStockWarning = ({ item }: Pick<CartSetItemProps, "item">) => {
  if (!hasInsufficientSetStock(item)) return null;

  return (
    <Typography sx={{ color: "warning.main", fontSize: 12, lineHeight: "18px", mt: 0.5 }}>
      Số lượng vượt quá tồn kho sản phẩm, vui lòng giảm số lượng hoặc xóa sản phẩm khỏi giỏ hàng.
    </Typography>
  );
};

const SetMobileStatus = ({ item }: Pick<CartSetItemProps, "item">) => {
  const { classes } = useCartPageItemStyles();
  const status = resolveSetDisplayStatus(item.setComponents);

  if (!status) return null;

  return (
    <Box className={classes.mobileFooterRow}>
      <Box className={classes.mobileFooterStatusSlot}>
        <CartItemStatusBadge status={status} tagClassName={classes.mobileStatusTag} />
      </Box>
    </Box>
  );
};

const SetDetailsButton = ({ expanded, onToggle, className }: { expanded: boolean; onToggle: () => void; className: string }) => (
  <Box
    component="button"
    type="button"
    onClick={onToggle}
    aria-expanded={expanded}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      width: "fit-content",
      p: 0,
      border: 0,
      color: "#737373",
      bgcolor: "transparent",
      cursor: "pointer",
      font: "inherit",
    }}
  >
    <Typography className={className}>{expanded ? "Thu gọn" : "Xem chi tiết"}</Typography>
    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
  </Box>
);

const SetActions = ({ item, compact, isMobile, onEdit, onQuantityChange, onRemove }: SetInfoProps) => {
  if (compact) {
    return (
      <IconButton size="small" sx={{ alignSelf: "flex-start" }} onClick={onEdit} aria-label="Cập nhật sản phẩm Set">
        <Edit02 size={16} />
      </IconButton>
    );
  }

  return (
    <StackRowAlignCenterJustBetween sx={{ width: "100%", gap: 1 }}>
      <IconButton size="small" onClick={onEdit} aria-label="Cập nhật sản phẩm Set">
        <Edit02 size={16} />
      </IconButton>
      {isMobile ? (
        <IconButton size="small" onClick={() => onRemove?.(item.id)} aria-label="Xóa sản phẩm Set">
          <Trash03 size={16} />
        </IconButton>
      ) : null}
    </StackRowAlignCenterJustBetween>
  );
};

const SetCompactCommerce = ({ item, onQuantityChange, onRemove }: Pick<SetInfoProps, "item" | "onQuantityChange" | "onRemove">) => (
  <Stack sx={{ gridColumn: "2 / -1", width: "100%" }}>
    <StackRowAlignCenterJustBetween>
      <CartItemQuantity
        id={item.id}
        quantity={item.quantity}
        minQuantity={1}
        maxQuantity={item.maxQuantity}
        disableQuantityControl={item.disableQuantityControl}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        isMiniCart
      />
      <IconButton size="small" onClick={() => onRemove?.(item.id)} aria-label="Xóa sản phẩm Set">
        <Trash03 size={16} />
      </IconButton>
    </StackRowAlignCenterJustBetween>
    <SetInsufficientStockWarning item={item} />
  </Stack>
);

const SetMobileCommerce = ({ item, onQuantityChange, onRemove }: Pick<SetInfoProps, "item" | "onQuantityChange" | "onRemove">) => {
  const { classes } = useCartPageItemStyles();
  return (
    <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
      <SetPrice item={item} className={classes.priceCol} classes={classes} />
      <CartItemQuantity
        id={item.id}
        quantity={item.quantity}
        minQuantity={1}
        maxQuantity={item.maxQuantity}
        disableQuantityControl={item.disableQuantityControl}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        className={classes.quantityControl}
      />
    </Box>
  );
};

const SetPrice = ({
  item,
  className,
  classes,
}: {
  item: CartSetViewItem;
  className: string;
  classes: Parameters<typeof CartItemPriceRow>[0]["classes"];
}) => (
  <Box className={className}>
    <CartItemPriceRow price={item.price} classes={classes} />
  </Box>
);

const SetInfo = ({ item, compact, isMobile, isExpanded, onEdit, onQuantityChange, onRemove, onNavigate, onToggle }: SetInfoProps) => {
  const { classes: miniClasses } = useCartMiniItemStyles();
  const { classes: pageClasses } = useCartPageItemStyles();
  const classes = compact ? miniClasses : pageClasses;
  const href = item.productSlug ? `/sets/${item.productSlug}` : undefined;
  const status = resolveSetDisplayStatus(item.setComponents);
  const name = (
    <Typography className={classes.name} sx={{ textTransform: "uppercase" }}>
      {item.name}
    </Typography>
  );

  return (
    <Box className={classes.infoCol}>
      <SetBadge />
      {href ? (
        <AppLink href={href} onClick={onNavigate} className={classes.productNameLink}>
          {name}
        </AppLink>
      ) : (
        name
      )}
      <SetComponentSummaries components={item.setComponents} className={classes.detailLine} />
      {status && (compact || !isMobile) && <CartItemStatusBadge status={status} />}
      {!compact ? <SetInsufficientStockWarning item={item} /> : null}
      {!compact && isMobile ? <SetMobileCommerce item={item} onQuantityChange={onQuantityChange} onRemove={onRemove} /> : null}
      <SetActions {...{ item, compact, isMobile, isExpanded, onEdit, onQuantityChange, onRemove, onToggle }} />
      {!compact ? <SetDetailsButton expanded={isExpanded} onToggle={onToggle} className={classes.detailLine} /> : null}
    </Box>
  );
};

const SetComponents = ({
  item,
  fallback,
  compact,
  expanded,
  isMobile,
}: {
  item: CartSetViewItem;
  fallback: string;
  compact: boolean;
  expanded: boolean;
  isMobile: boolean;
}) => {
  const imageWidth = compact ? cartMiniItemImage.width : (isMobile ? cartItemLineItemImage.mobile : cartItemLineItemImage.desktop).width;
  const dividerIndent = imageWidth / 2;
  const rows = (
    <Stack
      sx={{
        mt: 1,
        "& > :not(:last-child)": {
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            right: 0,
            bottom: 0,
            left: dividerIndent,
            borderBottom: "1px solid #E5E5E5",
          },
        },
      }}
    >
      {item.setComponents.map((component) => (
        <SetComponentRow key={component.id} component={component} fallback={fallback} compact={compact} isMobile={isMobile} />
      ))}
    </Stack>
  );

  return (
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      {rows}
    </Collapse>
  );
};

const CartSetItemComponent = ({ item, compact = false, onEdit, onQuantityChange, onRemove, onNavigate }: CartSetItemProps) => {
  const fallback = useProductDefaultImage();
  const { classes: miniClasses } = useCartMiniItemStyles();
  const { classes: pageClasses } = useCartPageItemStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isExpanded, setIsExpanded] = useState(false);
  const infoProps = {
    item,
    compact,
    isMobile,
    isExpanded,
    onEdit,
    onQuantityChange,
    onRemove,
    onNavigate,
    onToggle: () => setIsExpanded((value) => !value),
  };

  if (compact)
    return (
      <Box className={miniClasses.root}>
        <Box className={miniClasses.mainRow}>
          <SetImage item={item} fallback={fallback} compact isMobile={isMobile} onNavigate={onNavigate} />
          <SetInfo {...infoProps} />
          <Box className={miniClasses.rightCol}>
            <SetPrice item={item} className={miniClasses.priceCol} classes={miniClasses} />
          </Box>
          <SetCompactCommerce item={item} onQuantityChange={onQuantityChange} onRemove={onRemove} />
          <Box sx={{ gridColumn: "2 / -1" }}>
            <SetDetailsButton expanded={isExpanded} onToggle={() => setIsExpanded((value) => !value)} className={miniClasses.detailLine} />
          </Box>
        </Box>
        <SetComponents item={item} fallback={fallback} compact expanded={isExpanded} isMobile={isMobile} />
      </Box>
    );

  return (
    <Box className={pageClasses.root}>
      <Box className={pageClasses.mainRow}>
        <Box className={pageClasses.productCol}>
          <Box className={pageClasses.productTopRow}>
            {isMobile ? (
              <Stack spacing={1} sx={{ width: "var(--cart-product-image-width)", flexShrink: 0 }}>
                <SetImage item={item} fallback={fallback} compact={false} isMobile onNavigate={onNavigate} />
                <SetMobileStatus item={item} />
              </Stack>
            ) : (
              <SetImage item={item} fallback={fallback} compact={false} isMobile={false} onNavigate={onNavigate} />
            )}
            <SetInfo {...infoProps} />
          </Box>
        </Box>
        {!isMobile ? (
          <Box className={pageClasses.quantityCol}>
            <CartItemQuantity
              id={item.id}
              quantity={item.quantity}
              minQuantity={1}
              maxQuantity={item.maxQuantity}
              disableQuantityControl={item.disableQuantityControl}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
              className={pageClasses.quantityControl}
            />
          </Box>
        ) : null}
        <Box className={pageClasses.totalCol}>
          <SetPrice item={item} className={pageClasses.priceCol} classes={pageClasses} />
          <IconButton className={pageClasses.removeButton} onClick={() => onRemove?.(item.id)} aria-label="Xóa sản phẩm Set">
            <Trash03 size={16} color="#000" />
          </IconButton>
        </Box>
      </Box>
      <SetComponents item={item} fallback={fallback} compact={false} expanded={isExpanded} isMobile={isMobile} />
    </Box>
  );
};

export default CartSetItemComponent;
