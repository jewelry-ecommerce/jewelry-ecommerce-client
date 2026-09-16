// set term
"use client";

import { CdnImage } from "@/components/cdn-image";
import AppLink from "@/components/app-link/app-link.component";
import { useProductDefaultImage } from "@/components/providers.component";
import useAddSetToCart from "@/hooks/cart/use-add-set-to-cart.hook";
import { SetsApi } from "@/utils/api";
import { formatPrice } from "@/utils/constants/common.constant";
import type { SetListItem } from "@/utils/api/sets/sets.interface";
import { Box, Button, Typography } from "@mui/material";
import { Plus } from "@untitledui/icons";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import SetCartVariationPopup from "./set-cart-variation-popup.component";
import useStyles from "./set-card.styles";

type SetCardProps = {
  item: SetListItem;
  priority?: boolean;
};

const SetCard = ({ item, priority = false }: SetCardProps) => {
  // hook
  const { classes } = useStyles();
  const productDefaultImage = useProductDefaultImage();
  const { addSetToCart, isAdding } = useAddSetToCart();

  // state
  const [isPopupRequested, setIsPopupRequested] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // function
  const { data: set } = useSWR(isPopupRequested ? `catalog/sets/${item.slug}` : null, () => SetsApi.getSetBySlug(item.slug));
  const initialSelections = useMemo<Record<string, string>>(
    () =>
      set
        ? Object.fromEntries(set.includedProducts.map((includedProduct) => [includedProduct.itemId, includedProduct.defaultVariantId]))
        : {},
    [set],
  );
  const popupPrice = set?.customerDisplayPrice ?? null;
  useEffect(() => {
    if (isPopupRequested && set) setIsPopupOpen(true);
  }, [isPopupRequested, set]);

  const handleAddToCart = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (set) {
      setIsPopupOpen(true);
      return;
    }
    setIsPopupRequested(true);
  };

  const handleConfirmAddToCart = async (selections: Record<string, string>, maxQuantity?: number) => {
    if (!set) return;

    const wasAdded = await addSetToCart(
      set.id,
      set.includedProducts.map((includedProduct) => ({
        itemId: includedProduct.itemId,
        variationId: selections[includedProduct.itemId],
      })),
      maxQuantity,
    );
    if (wasAdded) setIsPopupOpen(false);
  };

  return (
    <React.Fragment>
      <Box className={classes.root}>
        <Box className={classes.imageSection}>
          <AppLink href={`/sets/${item.slug}`} prefetch={false}>
            <CdnImage
              as="next"
              src={item.images[0] ?? productDefaultImage}
              fallback={productDefaultImage}
              alt={item.name}
              fill
              preset="productCard"
              priority={priority}
              sizes="(max-width: 1199px) 50vw, 25vw"
              className={classes.image}
            />
            {item.images[1] ? (
              <CdnImage
                as="next"
                src={item.images[1]}
                fallback={productDefaultImage}
                alt={item.name}
                fill
                preset="productCard"
                sizes="(max-width: 1199px) 50vw, 25vw"
                className={`${classes.hoverImage} set-hover-image`}
                aria-hidden
              />
            ) : null}
          </AppLink>
          <Image src="/image/logo/logo-set.svg" alt="Stella Set" width={88} height={26} className={classes.label} />
          <Button className={`${classes.addToCartButton} set-add-to-cart`} onClick={handleAddToCart}>
            <Plus size={16} color="#333" />
            <Box component="span" className={classes.addToCartLabel}>
              Thêm vào giỏ hàng
            </Box>
          </Button>
        </Box>

        <Box className={classes.infoSection}>
          <AppLink href={`/sets/${item.slug}`} prefetch={false}>
            <Typography className={classes.name}>{item.name}</Typography>
          </AppLink>
          <Box className={classes.priceRow}>
            {item.sellingPrice && <Typography className={classes.currentPrice}>{formatPrice(item.sellingPrice)}</Typography>}
            {item.compareAtPrice && <Typography className={classes.originalPrice}>{formatPrice(item.compareAtPrice)}</Typography>}
            {item.discountPercent != null && item.discountPercent > 0 ? (
              <Typography className={classes.discount}>{item.discountPercent}%</Typography>
            ) : null}
          </Box>
        </Box>
      </Box>
      {set ? (
        <SetCartVariationPopup
          open={isPopupOpen}
          set={set}
          price={popupPrice}
          initialSelections={initialSelections}
          title="Thông tin sản phẩm"
          confirmLabel="Thêm vào giỏ hàng"
          isSubmitting={isAdding}
          onClose={() => setIsPopupOpen(false)}
          onConfirm={handleConfirmAddToCart}
        />
      ) : null}
    </React.Fragment>
  );
};

export default SetCard;
