"use client";
// không có time refactor
import { useAppSelector } from "@/redux/hooks";
import { selectCartItems, selectCartTotalQuantity, selectCheckoutEligibleItems } from "@/redux/slices/cart.slice";
import { CartItemData, CartSetViewItem } from "@/utils/api/cart/cart.interface";
import { isCartSetViewItem } from "@/utils/api/cart/cart.util";
import {
  getCartFulfillmentComposition,
  resolveCartCheckoutCtaLabel,
  type CartFulfillmentGroup,
} from "@/utils/api/cart/cart-availability.util";
import { computeCartItemsSubtotal } from "@/utils/api/cart/cart-checkout.util";
import CloseIcon from "@mui/icons-material/Close";
import { Badge, Box, Button, Divider, Drawer, IconButton, Typography, useTheme } from "@mui/material";
import useEmblaCarousel from "embla-carousel-react";
import React, { useCallback, useMemo, useState } from "react";

import { MayYouBeInterestedComponent } from "@/components/product/may-you-be-interested";
import ProductQuickViewDrawer from "@/components/product/product-quick-view-drawer/product-quick-view-drawer.component";
import useCartItemQuantity from "@/hooks/cart/use-cart-item-quantity.hook";
import useCartItemVariationUpdate from "@/hooks/cart/use-cart-item-variation-update.hook";
import useUpdateSetCart from "@/hooks/cart/use-update-set-cart.hook";
import { useCartItems } from "@/hooks/cart/use-cart-items.hook";
import useProductWishlist from "@/hooks/use-product-wishlist.hook";
import { useCartRecommendations } from "@/hooks/cart/use-cart-recommendations.hook";
import { cartDrawerGiftImage } from "./cart-drawer.styles";
import CartMiniItemComponent from "./cart-item-for-cart-mini.component";
import CartSetItemComponent from "./cart-set-item.component";
import SetCartUpdatePopup from "@/app/(layout-main)/sets/_components/set-cart-update-popup.component";
import EmptyCartState from "./empty-cart-state.component";
import CartFulfillmentChoiceDialog from "./cart-fulfillment-choice-dialog.component";
import { Heart, ShoppingBag02 } from "@untitledui/icons";
import { CdnImage } from "@/components";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog/delete-confirmation-dialog.component";
import { useProductDefaultImage } from "@/components/providers.component";
import { RemoveScroll } from "react-remove-scroll";
import useStyles from "./cart-drawer.styles";

export type CartDrawerItem = Omit<CartItemData, "onQuantityChange" | "onRemove" | "onEdit" | "onAddToWishlist"> & {
  unitPrice: number;
  selected?: boolean;
};

export type CartDrawerCheckoutOptions = {
  fulfillmentGroup?: CartFulfillmentGroup;
};

export type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  items?: CartDrawerItem[] | undefined;
  title?: string;
  onCheckout?: (options?: CartDrawerCheckoutOptions) => void;
  onGoToCart?: () => void;
  isInitiatingCheckout?: boolean;
};

const formatCurrency = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

const CartDrawerComponent = ({ open, onClose, title = "Giỏ hàng", onCheckout, onGoToCart, isInitiatingCheckout }: CartDrawerProps) => {
  const theme = useTheme();
  const zIndex = {
    cartDrawer: theme.zIndex.modal + 1,
    deleteConfirmationModal: theme.zIndex.modal + 2,
  };
  const productDefaultImage = useProductDefaultImage();
  const giftItems = useMemo(
    () => [
      { id: "gift-1", name: "Túi quà tặng (Neon)", image: productDefaultImage, originalPrice: "200.000đ" },
      { id: "gift-2", name: "Hộp quà tặng (Silver)", image: productDefaultImage, originalPrice: "180.000đ" },
      { id: "gift-3", name: "Charm quà tặng", image: productDefaultImage, originalPrice: "150.000đ" },
    ],
    [productDefaultImage],
  );
  const items = useAppSelector(selectCartItems) as CartDrawerItem[];
  const checkoutEligibleItems = useAppSelector(selectCheckoutEligibleItems) as CartDrawerItem[];
  const cartTotalQuantity = useAppSelector(selectCartTotalQuantity);
  const { classes } = useStyles();
  const { handleRemoveSelected } = useCartItems();

  const [editingItemSlug, setEditingItemSlug] = useState<string>();
  const [editingOldVariationId, setEditingOldVariationId] = useState<string>();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [editingSetItem, setEditingSetItem] = useState<CartSetViewItem>();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteConfirmItemId, setDeleteConfirmItemId] = useState<string | null>(null);
  const [isFulfillmentChoiceOpen, setIsFulfillmentChoiceOpen] = useState(false);

  const [giftEmblaRef] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const { recommendedProducts, isLoading: isRecommendedLoading } = useCartRecommendations(open);

  const { handleToggleWishlist, isProductWished } = useProductWishlist();

  const { handleQuantityChange } = useCartItemQuantity();

  const { updateCartItemVariation } = useCartItemVariationUpdate();
  const { updateSetCart, isUpdating: isUpdatingSet } = useUpdateSetCart();

  const handleRemove = useCallback((id: CartItemData["id"]) => {
    setDeleteConfirmItemId(String(id));
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmItemId) {
      handleRemoveSelected(deleteConfirmItemId);
    }
    setIsDeleteConfirmOpen(false);
    setDeleteConfirmItemId(null);
  }, [deleteConfirmItemId, handleRemoveSelected]);

  const handleEditItem = useCallback((productSlug: CartItemData["productSlug"], variationId: CartItemData["variationId"]) => {
    if (productSlug) {
      setEditingItemSlug(productSlug);
      setEditingOldVariationId(variationId);
      setIsQuickViewOpen(true);
    }
  }, []);

  const handleUpdateSet = async (selections: Record<string, string>, maxQuantity?: number) => {
    if (!editingSetItem) return;
    const wasUpdated = await updateSetCart(editingSetItem, selections, maxQuantity);
    if (wasUpdated) setEditingSetItem(undefined);
  };

  const handleUpdateItem = useCallback(
    async (variationId: string, optimisticItem?: CartDrawerItem) => {
      if (!editingItemSlug || editingOldVariationId === undefined) return;

      const currentItem = items.find((item) => String(item.id) === String(editingOldVariationId));

      await updateCartItemVariation({
        oldVariationId: String(editingOldVariationId),
        nextVariationId: String(variationId),
        optimisticReplacementItem: optimisticItem,
        targetStock: Number(optimisticItem?.maxQuantity ?? currentItem?.maxQuantity ?? 0),
      });

      setIsQuickViewOpen(false);
      setEditingItemSlug(undefined);
      setEditingOldVariationId(undefined);
    },
    [editingItemSlug, editingOldVariationId, items, updateCartItemVariation],
  );

  const total = useMemo(() => computeCartItemsSubtotal(checkoutEligibleItems), [checkoutEligibleItems]);
  const checkoutButtonLabel = useMemo(() => resolveCartCheckoutCtaLabel(checkoutEligibleItems), [checkoutEligibleItems]);
  const isMixedFulfillmentCart = useMemo(() => getCartFulfillmentComposition(checkoutEligibleItems) === "MIXED", [checkoutEligibleItems]);

  const handleCheckoutClick = useCallback(() => {
    if (isMixedFulfillmentCart) {
      setIsFulfillmentChoiceOpen(true);
      return;
    }
    onCheckout?.();
  }, [isMixedFulfillmentCart, onCheckout]);

  const handleChooseFulfillmentGroup = useCallback(
    (group: CartFulfillmentGroup) => {
      setIsFulfillmentChoiceOpen(false);
      onCheckout?.({ fulfillmentGroup: group });
    },
    [onCheckout],
  );

  // Calculate how many gifts can be unlocked based on total (every 200k = 1 gift)
  const maxGiftsAllowed = useMemo(() => Math.floor(total / 500000), [total]);
  const selectedGiftsCount = useMemo(() => 0, []); // placeholder for actual selected count
  const displayGiftsCount = Math.min(selectedGiftsCount, maxGiftsAllowed);

  const footer = (
    <Box className={classes.footer}>
      <Box className={classes.totalRow}>
        <Typography className={classes.totalLabel}>Tổng cộng</Typography>
        <Typography className={classes.totalValue}>{formatCurrency(total)}</Typography>
      </Box>
      <Button fullWidth className={classes.checkoutButton} onClick={handleCheckoutClick} disabled={isInitiatingCheckout}>
        {checkoutButtonLabel}
      </Button>
      <Button fullWidth variant="outlined" className={classes.goCartButton} onClick={onGoToCart}>
        Đến Giỏ Hàng
      </Button>
    </Box>
  );

  const cartScrollContent = (
    <React.Fragment>
      {/* <Box className={classes.promoWrap}>
        <Box className={classes.promoRow}>
          <Box component="img" src="/image/icons/icon-gift-cart.svg" alt="gift" width={16} height={16} />
          <Typography className={classes.promoText}>Mua sắm để nhận quà tặng hấp dẫn.</Typography>
        </Box>
        <Box className={giftItems.length > 3 ? classes.giftTabsScrollWrapper : undefined}>
          <Box
            className={classes.giftTabs}
            style={giftItems.length > 3 ? { gridTemplateColumns: `repeat(${giftItems.length}, 1fr)` } : undefined}
          >
            {giftItems.map((_, index) => (
              <Box key={index} className={index < maxGiftsAllowed ? classes.giftTabActive : classes.giftTabDisabled}>
                Quà tặng
              </Box>
            ))}
          </Box>
        </Box>

        <Typography className={classes.giftLabel}>
          Chọn quà tặng của bạn: ({displayGiftsCount}/{maxGiftsAllowed}):
        </Typography>

        <Box className={classes.giftEmbla} ref={giftEmblaRef}>
          <Box className={classes.giftEmblaContainer}>
            {giftItems.map((gift) => (
              <Box key={gift.id} className={classes.giftCard}>
                <Box className={classes.giftImageWrap}>
                  <CdnImage
                    as="next"
                    src={gift.image}
                    fallback={productDefaultImage}
                    alt={gift.name}
                    width={cartDrawerGiftImage.width}
                    height={cartDrawerGiftImage.height}
                    preset="cartGiftLineItem"
                    className={classes.giftImage}
                    sizes={`${cartDrawerGiftImage.width}px`}
                  />
                </Box>
                <Box className={classes.giftInfo}>
                  <Typography className={classes.giftName}>{gift.name}</Typography>
                  <Typography className={classes.giftPrice}>
                    Miễn phí <span className={classes.giftOriginalPrice}>{gift.originalPrice}</span>
                  </Typography>
                </Box>
                <IconButton className={classes.giftActionButton}>
                  <ShoppingBag02 size={16} color="#333" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <Divider className={classes.divider} /> */}
      {items.map((item, index) => {
        if (isCartSetViewItem(item)) {
          return (
            <Box key={`${item.id}-${index}`} className={classes.itemWrap}>
              <CartSetItemComponent
                item={item}
                compact
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
                onEdit={() => setEditingSetItem(item)}
                onNavigate={onClose}
              />
            </Box>
          );
        }
        const productId = item.productId;
        const itemData: CartItemData = {
          ...item,
          wishlistLabel:
            productId && isProductWished(String(productId)) ? (
              <Heart size={16} color="#9259E3" fill="#9259E3" />
            ) : (
              <Heart size={16} color="#333" />
            ),
          onQuantityChange: handleQuantityChange,
          onRemove: handleRemove,
          onEdit: handleEditItem,
          onAddToWishlist: productId
            ? () => {
                void handleToggleWishlist([String(productId)]);
              }
            : undefined,
          onclose: onClose,
        };

        return (
          <Box key={`${item.id}-${index}`} className={classes.itemWrap}>
            <CartMiniItemComponent item={itemData} isLast={index === items.length - 1} />
          </Box>
        );
      })}

      <MayYouBeInterestedComponent
        products={recommendedProducts}
        title={isRecommendedLoading ? "Đang tải gợi ý..." : "Có thể bạn quan tâm"}
        isLoading={isRecommendedLoading}
        onClose={onClose}
      />
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{ className: classes.paper }}
        ModalProps={{
          keepMounted: true,
          disableScrollLock: true,
          sx: { zIndex: zIndex.cartDrawer },
        }}
      >
        {open ? (
          <Box className={classes.drawerContent}>
            <Box className={classes.header}>
              <Box className={classes.titleWrap}>
                <Typography className={classes.title}>{title}</Typography>
                <Badge
                  badgeContent={cartTotalQuantity}
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "rgba(240, 240, 240, 1)",
                    },
                    marginBottom: "4px",
                  }}
                ></Badge>
              </Box>
              <IconButton className={classes.closeButton} onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
            {items.length > 0 ? (
              <>
                <RemoveScroll enabled={open} forwardProps>
                  <Box className={classes.body}>{cartScrollContent}</Box>
                </RemoveScroll>
                {footer}
              </>
            ) : (
              <RemoveScroll enabled={open} forwardProps>
                <Box className={classes.body}>
                  <EmptyCartState isMiniCart onclose={onClose} />
                </Box>
              </RemoveScroll>
            )}
          </Box>
        ) : null}
      </Drawer>

      <ProductQuickViewDrawer
        open={isQuickViewOpen}
        slug={editingItemSlug || ""}
        initialVariationId={editingOldVariationId}
        confirmButtonLabel="Cập Nhật"
        isCartUpdate
        onClose={() => {
          setIsQuickViewOpen(false);
          setEditingItemSlug(undefined);
          setEditingOldVariationId(undefined);
        }}
        onConfirmAddToCart={handleUpdateItem}
      />
      <SetCartUpdatePopup
        open={Boolean(editingSetItem)}
        item={editingSetItem}
        isSubmitting={isUpdatingSet}
        onClose={() => setEditingSetItem(undefined)}
        onConfirm={handleUpdateSet}
      />

      <DeleteConfirmationDialog
        open={isDeleteConfirmOpen}
        title="BẠN CHẮC CHẮN MUỐN XÓA SẢN PHẨM NÀY?"
        cancelButtonText="Hủy"
        confirmButtonText="Đồng Ý"
        modalZIndex={zIndex.deleteConfirmationModal}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setDeleteConfirmItemId(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <CartFulfillmentChoiceDialog
        open={isFulfillmentChoiceOpen}
        isLoading={isInitiatingCheckout}
        modalZIndex={zIndex.deleteConfirmationModal}
        onClose={() => setIsFulfillmentChoiceOpen(false)}
        onChoose={handleChooseFulfillmentGroup}
      />
    </React.Fragment>
  );
};

export default CartDrawerComponent;
