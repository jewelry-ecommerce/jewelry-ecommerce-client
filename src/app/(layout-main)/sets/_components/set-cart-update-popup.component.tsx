// set term
"use client";

import { SetsApi } from "@/utils/api";
import type { CartSetViewItem } from "@/utils/api/cart/cart.interface";
import { useMemo } from "react";
import useSWR from "swr";
import SetCartVariationPopup from "./set-cart-variation-popup.component";

type SetCartUpdatePopupProps = {
  open: boolean;
  item?: CartSetViewItem;
  isSubmitting?: boolean;
  presentation?: "drawer" | "dialog";
  onClose: () => void;
  onConfirm: (selections: Record<string, string>, maxQuantity?: number) => void;
};

const SetCartUpdatePopup = ({ open, item, isSubmitting, presentation, onClose, onConfirm }: SetCartUpdatePopupProps) => {
  // function
  const { data } = useSWR(open && item?.productSlug ? `catalog/sets/${item.productSlug}` : null, () =>
    SetsApi.getSetBySlug(item!.productSlug),
  );

  // hook
  const selections = useMemo<Record<string, string>>(
    () =>
      data && item
        ? Object.fromEntries(
            data.includedProducts.map((includedProduct) => {
              const component = item.setComponents.find((cartItem) =>
                includedProduct.variants.some((variant) => variant.id === cartItem.id),
              );
              return [includedProduct.itemId, component?.id ?? includedProduct.defaultVariantId];
            }),
          )
        : {},
    [data, item],
  );
  const price = useMemo(
    () =>
      item
        ? {
            sellingPriceAfterTaxMinor: item.unitPrice,
            compareAtPriceAfterTaxMinor: item.originalUnitPrice ?? null,
            discountPercent: null,
            hasDiscount: false,
          }
        : null,
    [item],
  );
  if (!item || !data) return null;

  return (
    <SetCartVariationPopup
      open={open}
      set={data}
      price={price}
      initialSelections={selections}
      title="Cập nhật sản phẩm"
      confirmLabel="Cập nhật"
      isSubmitting={isSubmitting}
      presentation={presentation}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
};

export default SetCartUpdatePopup;
