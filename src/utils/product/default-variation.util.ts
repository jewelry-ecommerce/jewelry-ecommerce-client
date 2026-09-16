import type { ProductPurchaseAction } from "@/utils/api/product/product.interface";
import { isVariationAvailableForPurchase } from "./variant-availability.util";

export interface DefaultVariationCandidate {
  stock: number;
  stockStatus?: string;
  purchaseAction?: ProductPurchaseAction | null;
  preOrderCampaignId?: string | null;
  displayPriceAfterTaxMinor?: number | string | null;
  sellingPriceAfterTaxMinor?: number | string | null;
  customerDisplayPrice?: {
    sellingPriceAfterTaxMinor?: number | string | null;
  };
}

const resolveVariationSellingPriceMinor = (variation: DefaultVariationCandidate): number =>
  Number(
    variation.customerDisplayPrice?.sellingPriceAfterTaxMinor ??
      variation.displayPriceAfterTaxMinor ??
      variation.sellingPriceAfterTaxMinor ??
      0,
  );

/**
 * Biến thể mặc định: còn mua được (kể cả pre-order stock = 0) và giá bán nhỏ nhất.
 * Nếu tất cả hết hàng thì lấy biến thể giá nhỏ nhất (rule cũ).
 */
export function pickDefaultVariation<T extends DefaultVariationCandidate>(variations: T[]): T | undefined {
  if (!variations.length) return undefined;

  const purchasableVariations = variations.filter(isVariationAvailableForPurchase);
  const pool = purchasableVariations.length > 0 ? purchasableVariations : variations;

  let cheapest = pool[0];
  let cheapestPrice = resolveVariationSellingPriceMinor(cheapest);

  for (let i = 1; i < pool.length; i++) {
    const price = resolveVariationSellingPriceMinor(pool[i]);
    if (price < cheapestPrice) {
      cheapest = pool[i];
      cheapestPrice = price;
    }
  }

  return cheapest;
}
