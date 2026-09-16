"use client";

import { SetsApi } from "@/utils/api";
import { ProductStockStatus } from "@/utils/api/product/product.enum";
import type { SetIncludedProduct, SetVariant } from "@/utils/api/sets/sets.interface";
import type { CustomerDisplayPrice } from "@/utils/customer-display-price.util";
import { useCallback, useState } from "react";

type SetSelectionState = {
  variationIds: Record<string, string>;
  variationByItemId: Record<string, SetVariant>;
  customerDisplayPrice: SetDisplayPrice | null;
};

type SetDisplayPrice = Pick<
  CustomerDisplayPrice,
  "sellingPriceAfterTaxMinor" | "compareAtPriceAfterTaxMinor" | "discountPercent" | "hasDiscount"
>;

const findSelectedVariants = (items: SetIncludedProduct[], variationIds: Readonly<Record<string, string>>) =>
  Object.fromEntries(
    items.flatMap((item) => {
      const variant = item.variants.find(({ id }) => id === variationIds[item.itemId]);
      return variant ? [[item.itemId, variant]] : [];
    }),
  );

const buildState = (
  items: SetIncludedProduct[],
  variationIds: Record<string, string>,
  price: SetDisplayPrice | null,
): SetSelectionState => ({
  variationIds,
  variationByItemId: findSelectedVariants(items, variationIds),
  customerDisplayPrice: price,
});

export const buildDefaultSetSelections = (items: SetIncludedProduct[]): Record<string, string> =>
  Object.fromEntries(items.map((item) => [item.itemId, item.defaultVariantId]));

export const useSetSelection = (
  setId: string,
  items: SetIncludedProduct[],
  initialVariationIds: Record<string, string>,
  initialPrice: SetDisplayPrice | null,
) => {
  const [selection, setSelection] = useState(() => buildState(items, initialVariationIds, initialPrice));

  const selectVariation = useCallback(
    async (itemId: string, variant: SetVariant) => {
      const variationIds = { ...selection.variationIds, [itemId]: variant.id };
      const response = await SetsApi.getSetItemVariations(setId, itemId, variationIds);
      const stockByItemId = new Map(response.selections.map((item) => [item.itemId, item]));
      const variationByItemId = Object.fromEntries(
        items.flatMap((item) => {
          const selected = item.variants.find(({ id }) => id === variationIds[item.itemId]);
          const stock = stockByItemId.get(item.itemId);
          return selected
            ? [
                [
                  item.itemId,
                  { ...selected, stock: stock?.stock ?? selected.stock, stockStatus: stock?.stockStatus ?? selected.stockStatus },
                ],
              ]
            : [];
        }),
      );
      setSelection({ variationIds, variationByItemId, customerDisplayPrice: response.customerDisplayPrice });
    },
    [items, selection.variationIds, setId],
  );

  const resetSelection = useCallback(
    (variationIds: Record<string, string>) => {
      setSelection(buildState(items, variationIds, initialPrice));
    },
    [initialPrice, items],
  );
  const maxQuantity = Math.min(
    ...items.map((item) => {
      const stock = selection.variationByItemId[item.itemId]?.stock ?? 0;
      return Math.floor(stock / item.quantity);
    }),
  );
  const isOutOfStock = items.some((item) => selection.variationByItemId[item.itemId]?.stockStatus === ProductStockStatus.OUT_OF_STOCK);

  return { ...selection, selectVariation, resetSelection, maxQuantity, isOutOfStock };
};
