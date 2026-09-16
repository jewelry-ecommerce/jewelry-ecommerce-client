export type CustomerDisplayPriceCurrency = "VND";

export interface CustomerDisplayPriceSource {
  displayPriceAfterTaxMinor?: number | string | null;
  sellingPriceAfterTaxMinor?: number | string | null;
  compareAtPriceAfterTaxMinor?: number | string | null;
}

export interface CustomerDisplayPrice {
  currency: CustomerDisplayPriceCurrency;
  compareAtPriceAfterTaxMinor: number | null;
  sellingPriceAfterTaxMinor: number;
  discountPercent: number | null;
  hasDiscount: boolean;
}

export interface PricePresentation {
  showDiscountPercent: boolean;
}

export interface ShowDiscountPercentTagInput {
  showDiscountPercent?: boolean;
  hasDiscount?: boolean;
  discountPercent?: number | null;
}

/** Tag `-X%` chỉ khi Admin bật hiển thị % và SKU đang có giảm giá. */
export function shouldShowDiscountPercentTag({ showDiscountPercent, hasDiscount, discountPercent }: ShowDiscountPercentTagInput): boolean {
  return Boolean(showDiscountPercent && hasDiscount && discountPercent != null);
}

const toMinorUnit = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null;
};

export interface ResolveDiscountPercentForTagInput {
  /** From API `customerDisplayPrice.discountPercent`. `null` = không hiện tag. */
  discountPercent?: number | null;
  sellingPriceAfterTaxMinor?: number;
  compareAtPriceAfterTaxMinor?: number | null;
}

/** Tag `-X%` chỉ khi API trả `discountPercent > 0`, hoặc client tự resolve (không có object API). */
export function resolveDiscountPercentForTag({
  discountPercent,
  sellingPriceAfterTaxMinor = 0,
  compareAtPriceAfterTaxMinor,
}: ResolveDiscountPercentForTagInput): number | undefined {
  if (discountPercent === null) {
    return undefined;
  }

  if (typeof discountPercent === "number") {
    return discountPercent > 0 ? discountPercent : undefined;
  }

  const compare = compareAtPriceAfterTaxMinor;
  const selling = sellingPriceAfterTaxMinor;
  if (compare != null && compare > selling && compare > 0) {
    return Math.round(((compare - selling) / compare) * 100);
  }

  return undefined;
}

export const resolveCustomerDisplayPrice = (source: CustomerDisplayPriceSource): CustomerDisplayPrice => {
  const displayPriceAfterTaxMinor = toMinorUnit(source.displayPriceAfterTaxMinor);
  const sellingPriceAfterTaxMinor = displayPriceAfterTaxMinor ?? toMinorUnit(source.sellingPriceAfterTaxMinor) ?? 0;
  const compareAtPriceAfterTaxMinor = toMinorUnit(source.compareAtPriceAfterTaxMinor);
  const hasDiscount = compareAtPriceAfterTaxMinor !== null && compareAtPriceAfterTaxMinor > sellingPriceAfterTaxMinor;

  return {
    currency: "VND",
    compareAtPriceAfterTaxMinor: hasDiscount ? compareAtPriceAfterTaxMinor : null,
    sellingPriceAfterTaxMinor,
    discountPercent:
      hasDiscount && compareAtPriceAfterTaxMinor
        ? Math.round(((compareAtPriceAfterTaxMinor - sellingPriceAfterTaxMinor) / compareAtPriceAfterTaxMinor) * 100)
        : null,
    hasDiscount,
  };
};
