export const PRODUCT_PRICE_FILTER_MIN = 0;
export const PRODUCT_PRICE_FILTER_MAX = 100_000_000;
export const PRODUCT_PRICE_FILTER_STEP = 50_000;

export function snapProductPriceFilterValue(value: number): number {
  const snapped = Math.round(value / PRODUCT_PRICE_FILTER_STEP) * PRODUCT_PRICE_FILTER_STEP;
  return Math.min(PRODUCT_PRICE_FILTER_MAX, Math.max(PRODUCT_PRICE_FILTER_MIN, snapped));
}

export function snapProductPriceRange(range: ProductPriceRange): ProductPriceRange {
  const min = snapProductPriceFilterValue(range[0]);
  const max = snapProductPriceFilterValue(range[1]);
  return min <= max ? [min, max] : [max, min];
}

export const PRODUCT_PRICE_FILTER_CHIP_SECTION_ID = "price-range";
export const PRODUCT_PRICE_FILTER_CHIP_OPTION_ID = "price-range";

export type ProductPriceRange = readonly [number, number];

export const DEFAULT_PRODUCT_PRICE_RANGE: ProductPriceRange = [PRODUCT_PRICE_FILTER_MIN, PRODUCT_PRICE_FILTER_MAX];

export const isDefaultProductPriceRange = (range: ProductPriceRange): boolean =>
  range[0] === PRODUCT_PRICE_FILTER_MIN && range[1] === PRODUCT_PRICE_FILTER_MAX;

export const isProductPriceFilterChip = (sectionId: string, optionId: string): boolean =>
  sectionId === PRODUCT_PRICE_FILTER_CHIP_SECTION_ID && optionId === PRODUCT_PRICE_FILTER_CHIP_OPTION_ID;
