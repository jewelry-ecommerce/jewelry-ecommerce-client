"use client";

import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthResolved } from "@/redux/slices/auth.slice";
import { selectCartItems, selectCartLoading } from "@/redux/slices/cart.slice";
import { Box, Button, Checkbox, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import CustomCheckboxCheckedIcon from "@/assets/icon/CustomCheckboxCheckedIcon";
import CustomCheckboxUncheckedIcon from "@/assets/icon/CustomCheckboxUncheckedIcon";
import CustomCheckedAllIcon from "@/assets/icon/CustomCheckedAllIcon";
import CustomUncheckedAllIcon from "@/assets/icon/CustomUncheckedAllIcon";
import useCartCheckout from "@/hooks/cart/use-cart-checkout.hook";
import useCartItemQuantity from "@/hooks/cart/use-cart-item-quantity.hook";
import useCartItemVariationUpdate from "@/hooks/cart/use-cart-item-variation-update.hook";
import useUpdateSetCart from "@/hooks/cart/use-update-set-cart.hook";
import useCartPackagingUpdate from "@/hooks/cart/use-cart-packaging-update.hook";
import { useCartItems } from "@/hooks/cart/use-cart-items.hook";
import useCartSummary from "@/hooks/cart/use-cart-summary.hook";
import useProductWishlist from "@/hooks/use-product-wishlist.hook";
import { CartItemData, CartProductVariation, CartSetViewItem, CartViewItem } from "@/utils/api/cart/cart.interface";
import { isCartSetViewItem } from "@/utils/api/cart/cart.util";
import {
  getCartFulfillmentComposition,
  hasMixedRetailAndPreOrder,
  resolveCartCheckoutCtaLabel,
  type CartFulfillmentGroup,
} from "@/utils/api/cart/cart-availability.util";
import { getCheckoutItemsFromCart } from "@/utils/api/cart/cart-checkout.util";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog/delete-confirmation-dialog.component";
import CartFulfillmentChoiceDialog from "./cart-fulfillment-choice-dialog.component";
import { StackRow } from "@/components/styled";
import CartItemComponent from "./cart-item.component";
import CartSetItemComponent from "./cart-set-item.component";
import SetCartUpdatePopup from "@/app/(layout-main)/sets/_components/set-cart-update-popup.component";
import CartSkeletonComponent from "./cart-skeleton.component";
import CartSummaryComponent from "./cart-summary.component";
import CartUpdateItemPopup from "./cart-update-item-popup";
import useCartViewStyles from "./cart-view.styles";
import EmptyCartState from "./empty-cart-state.component";
import { Heart } from "@untitledui/icons";

export type CartViewProps = {
  title?: string;
  onAddSelectedToWishlist?: (selectedItems: CartViewItem[]) => void;
};

const CartViewComponent = ({ title = "Giỏ hàng của bạn", onAddSelectedToWishlist }: CartViewProps) => {
  const { classes, cx } = useCartViewStyles();
  const theme = useTheme();
  const isMobileSummary = useMediaQuery(theme.breakpoints.down("lg"));
  const mobileSummaryBarRef = useRef<HTMLDivElement | null>(null);
  const [mobileSummaryBarHeight, setMobileSummaryBarHeight] = useState(0);
  const items = useAppSelector(selectCartItems);
  const cartLoading = useAppSelector(selectCartLoading);
  const isAuthResolved = useAppSelector(selectIsAuthResolved);

  const [editingItem, setEditingItem] = useState<string>();
  const [editingOldVariationId, setEditingOldVariationId] = useState<string>();
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
  const [editingSetItem, setEditingSetItem] = useState<CartSetViewItem>();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteConfirmItemId, setDeleteConfirmItemId] = useState<string | null>(null);
  const [isFulfillmentChoiceOpen, setIsFulfillmentChoiceOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { handleToggleWishlist, isProductWished } = useProductWishlist();
  const { initiateCheckoutFromCart, isInitiatingCheckout } = useCartCheckout();
  useEffect(() => {
    if (!isAuthResolved || hasLoaded) return;
    if (!cartLoading) {
      setHasLoaded(true);
    }
  }, [cartLoading, hasLoaded, isAuthResolved]);

  const { handleQuantityChange } = useCartItemQuantity();

  const { handlePackagingSelectionChange } = useCartPackagingUpdate();

  const { updateCartItemVariation } = useCartItemVariationUpdate();
  const { updateSetCart, isUpdating: isUpdatingSet } = useUpdateSetCart();

  const { selectedCount, handleToggleItemSelect, handleSelectAll, handleRemoveSelected } = useCartItems();

  const handleRemove = useCallback((id: CartItemData["id"]) => {
    setDeleteConfirmItemId(String(id));
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(
    (itemId: string | null) => {
      if (itemId === "all") {
        handleRemoveSelected();
      } else if (itemId) {
        handleRemoveSelected(itemId);
      }
      setIsDeleteConfirmOpen(false);
      setDeleteConfirmItemId(null);
    },
    [handleRemoveSelected],
  );

  const handleEditItem = useCallback((productSlug: CartItemData["productSlug"], variationId: CartItemData["variationId"]) => {
    if (productSlug) {
      setEditingItem(productSlug);
      setEditingOldVariationId(variationId);
      setIsUpdatePopupOpen(true);
    }
  }, []);

  const handleUpdateItem = useCallback(
    async (variation: CartProductVariation) => {
      if (!editingItem || editingOldVariationId === undefined) return;

      await updateCartItemVariation({
        oldVariationId: String(editingOldVariationId),
        detailVariation: variation,
        targetStock: Number(variation.stock),
      });

      setIsUpdatePopupOpen(false);
      setEditingItem(undefined);
      setEditingOldVariationId(undefined);
    },
    [editingItem, editingOldVariationId, updateCartItemVariation],
  );

  const handleUpdateSet = async (selections: Record<string, string>, maxQuantity?: number) => {
    if (!editingSetItem) return;
    const wasUpdated = await updateSetCart(editingSetItem, selections, maxQuantity);
    if (wasUpdated) setEditingSetItem(undefined);
  };

  const selectableItems = useMemo(() => items.filter((item) => !item.disableSelection), [items]);

  const isAllSelected = selectableItems.length > 0 && selectedCount === selectableItems.length;
  const isSelectAllDisabled = items.every((item) => item.disableSelection) || hasMixedRetailAndPreOrder(items);

  // Collect unique non-empty warnings from visible cart items
  // const cartWarnings = useMemo(() => {
  //   const result: string[] = [];
  //   for (const item of items) {
  //     if (item.pricingWarning && !result.includes(item.pricingWarning)) {
  //       result.push(item.pricingWarning);
  //     }
  //     if (item.promotionWarnings?.length) {
  //       for (const w of item.promotionWarnings) {
  //         if (w && !result.includes(w)) {
  //           result.push(w);
  //         }
  //       }
  //     }
  //   }
  //   return result;
  // }, [items]);

  // Only after first cart sync (`hasLoaded`) — avoids calculate on persisted items before GET.
  const { summary: summaryValues, isLoading: isCalculating } = useCartSummary({
    enabled: hasLoaded,
  });

  useEffect(() => {
    if (!isMobileSummary || items.length === 0) {
      setMobileSummaryBarHeight(0);
      return;
    }

    const barElement = mobileSummaryBarRef.current;
    if (!barElement) return;

    const updateBarHeight = () => {
      setMobileSummaryBarHeight(barElement.getBoundingClientRect().height);
    };

    updateBarHeight();

    const resizeObserver = new ResizeObserver(updateBarHeight);
    resizeObserver.observe(barElement);
    window.addEventListener("resize", updateBarHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateBarHeight);
    };
  }, [isMobileSummary, items.length, selectedCount, isCalculating, summaryValues.totalAmount]);

  const selectedCheckoutItems = useMemo(() => getCheckoutItemsFromCart(items, "selected-eligible"), [items]);
  const isMixedFulfillmentCart = useMemo(() => getCartFulfillmentComposition(selectedCheckoutItems) === "MIXED", [selectedCheckoutItems]);

  const handleCheckout = useCallback(async () => {
    if (isMixedFulfillmentCart) {
      setIsFulfillmentChoiceOpen(true);
      return;
    }
    await initiateCheckoutFromCart({ mode: "selected-eligible" });
  }, [initiateCheckoutFromCart, isMixedFulfillmentCart]);

  const handleChooseFulfillmentGroup = useCallback(
    async (group: CartFulfillmentGroup) => {
      setIsFulfillmentChoiceOpen(false);
      await initiateCheckoutFromCart({ mode: "selected-eligible", fulfillmentGroup: group });
    },
    [initiateCheckoutFromCart],
  );

  const checkoutButtonLabel = useMemo(() => resolveCartCheckoutCtaLabel(selectedCheckoutItems), [selectedCheckoutItems]);

  const renderItems = useMemo(
    () =>
      items.map((item) => {
        if (isCartSetViewItem(item)) {
          return (
            <StackRow key={item.id} className={cx(classes.itemRow, classes.setItemRow)}>
              <Box className={cx(classes.BoxCheckbox, classes.setItemCheckbox)}>
                <Checkbox
                  checked={Boolean(item.selected)}
                  onChange={() => handleToggleItemSelect(item.id)}
                  disabled={item.disableSelection}
                  icon={<CustomCheckboxUncheckedIcon />}
                  checkedIcon={<CustomCheckboxCheckedIcon />}
                  className={classes.checkBox}
                  disableRipple
                  disableTouchRipple
                />
              </Box>
              <Box className={classes.itemBox}>
                <CartSetItemComponent
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                  onEdit={() => setEditingSetItem(item)}
                />
              </Box>
            </StackRow>
          );
        }
        const productId = item.productId;
        const itemData: CartItemData = {
          ...item,
          wishlistLabel:
            productId && isProductWished(String(productId)) ? (
              <Heart size={16} color="#9259E3" fill="#9259E3" />
            ) : (
              <Heart size={16} color="#737373" />
            ),
          onQuantityChange: handleQuantityChange,
          onPackagingSelectionChange: handlePackagingSelectionChange,
          onRemove: handleRemove,
          onEdit: handleEditItem,
          onAddToWishlist: productId
            ? () => {
                void handleToggleWishlist([String(productId)]);
              }
            : undefined,
        };

        return (
          <StackRow key={item.id} className={classes.itemRow}>
            <Box className={classes.BoxCheckbox}>
              <Checkbox
                checked={Boolean(item.selected)}
                onChange={() => handleToggleItemSelect(item.id)}
                disabled={item.disableSelection}
                icon={<CustomCheckboxUncheckedIcon />}
                checkedIcon={<CustomCheckboxCheckedIcon />}
                className={classes.checkBox}
                disableRipple
                disableTouchRipple
              />
            </Box>
            <Box className={classes.itemBox}>
              <CartItemComponent item={itemData} />
            </Box>
          </StackRow>
        );
      }),
    [
      handleEditItem,
      handlePackagingSelectionChange,
      handleQuantityChange,
      handleRemove,
      handleToggleItemSelect,
      handleToggleWishlist,
      isProductWished,
      items,
      classes.BoxCheckbox,
      classes.checkBox,
      classes.itemBox,
      classes.itemRow,
      classes.setItemCheckbox,
      classes.setItemRow,
    ],
  );

  if (!isAuthResolved || !hasLoaded) {
    return (
      <Box className={classes.root}>
        <Typography className={classes.title}>{title}</Typography>
        <CartSkeletonComponent />
      </Box>
    );
  }

  return (
    <Box
      className={classes.root}
      style={isMobileSummary && mobileSummaryBarHeight > 0 ? { paddingBottom: mobileSummaryBarHeight } : undefined}
    >
      <Typography className={classes.title}>{title}</Typography>

      {items.length === 0 ? (
        <Box style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
          <EmptyCartState />
        </Box>
      ) : (
        // </Box>
        <Box className={classes.grid}>
          <Box className={classes.itemsSlot}>
            <Box className={classes.productHeader}>
              <Typography className={classes.productHeaderTitle}>Sản Phẩm ({items.length})</Typography>
              <Typography className={classes.productHeaderQty}>Số Lượng</Typography>
              <Typography className={classes.productHeaderTotal}>Tổng</Typography>
            </Box>

            <Box className={classes.selectAllRow}>
              <Box className={classes.selectAllLeft}>
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={!isAllSelected && selectedCount > 0}
                  onChange={(_, checked) => handleSelectAll(checked)}
                  disabled={isSelectAllDisabled}
                  icon={<CustomUncheckedAllIcon />}
                  checkedIcon={<CustomCheckedAllIcon />}
                  indeterminateIcon={<CustomCheckedAllIcon />}
                  sx={{ p: 0, mr: 1, width: 20, height: 20 }}
                  disableRipple
                  disableTouchRipple
                />
                <Typography className={classes.selectAllText}>Chọn tất cả</Typography>
              </Box>

              <Box className={classes.selectAllActions}>
                <Button
                  disableElevation
                  onClick={() => {
                    setDeleteConfirmItemId("all");
                    setIsDeleteConfirmOpen(true);
                  }}
                  disabled={!selectedCount}
                  className={classes.bulkDeleteButton}
                >
                  Xóa
                </Button>
              </Box>
            </Box>

            {/* {cartWarnings.length > 0 && (
              <Box
                sx={{
                  backgroundColor: "#FFF8E1",
                  border: "1px solid #FFE082",
                  borderRadius: 1,
                  padding: "8px 12px",
                  marginBottom: 1,
                  fontSize: 13,
                  color: "#795548",
                }}
              >
                {cartWarnings.map((w, idx) => (
                  <Typography key={idx} variant="caption" display="block" sx={{ color: "#795548", fontSize: 13 }}>
                    {w}
                  </Typography>
                ))}
              </Box>
            )} */}

            <Box style={{ paddingTop: 8 }}>{renderItems}</Box>
          </Box>

          <Box className={classes.summarySlot}>
            <Box className={classes.summaryCol}>
              <CartSummaryComponent
                summaryValues={summaryValues}
                isCalculating={isCalculating}
                classes={classes}
                cx={cx}
                onCheckout={handleCheckout}
                isInitiatingCheckout={isInitiatingCheckout}
                checkoutButtonLabel={checkoutButtonLabel}
                mobileSummaryBarRef={mobileSummaryBarRef}
              />
            </Box>
          </Box>
        </Box>
      )}

      <CartUpdateItemPopup
        open={isUpdatePopupOpen}
        slug={editingItem}
        onClose={() => {
          setIsUpdatePopupOpen(false);
          setEditingItem(undefined);
          setEditingOldVariationId(undefined);
        }}
        onUpdate={handleUpdateItem}
        editingOldVariationId={editingOldVariationId}
      />
      <SetCartUpdatePopup
        open={Boolean(editingSetItem)}
        item={editingSetItem}
        isSubmitting={isUpdatingSet}
        presentation="dialog"
        onClose={() => setEditingSetItem(undefined)}
        onConfirm={handleUpdateSet}
      />

      <DeleteConfirmationDialog
        open={isDeleteConfirmOpen}
        title="BẠN CHẮC CHẮN MUỐN XÓA SẢN PHẨM NÀY?"
        message={deleteConfirmItemId === "all" ? "Những sản phẩm đã chọn sẽ bị xóa khỏi giỏ hàng" : undefined}
        cancelButtonText="Hủy"
        confirmButtonText="Đồng Ý"
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setDeleteConfirmItemId(null);
        }}
        onConfirm={() => handleConfirmDelete(deleteConfirmItemId)}
        isLoading={isDeleting}
      />

      <CartFulfillmentChoiceDialog
        open={isFulfillmentChoiceOpen}
        isLoading={isInitiatingCheckout}
        onClose={() => setIsFulfillmentChoiceOpen(false)}
        onChoose={handleChooseFulfillmentGroup}
      />
    </Box>
  );
};

export default CartViewComponent;
