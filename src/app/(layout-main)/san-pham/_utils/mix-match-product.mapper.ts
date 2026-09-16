import type { ProductItemProps } from "@/components/product/product-item/product-item.component";
import type { ApiProduct, IVariationCardItem } from "@/utils/api/product/product.interface";
import { mapApiProductToProductItem } from "@/utils/product.mapper.util";

const toPriceText = (value: string | number | null | undefined): string | null => {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? String(parsed) : null;
};

const resolveCardProductId = (item: IVariationCardItem, fallbackId: string): string => item.productId?.trim() || fallbackId;

const resolveCardDefaultVariationId = (item: IVariationCardItem, fallbackId: string): string | undefined => {
  const productId = item.productId?.trim();
  const defaultVariationId = item.defaultVariationId?.trim();
  if (defaultVariationId) return defaultVariationId;
  if (productId && fallbackId === productId) return undefined;
  return fallbackId;
};

const buildFallbackDefaultDisplay = (item: IVariationCardItem, image: string): ApiProduct["defaultDisplay"] => ({
  image,
  displayPriceAfterTaxMinor: toPriceText(item.displayPriceAfterTaxMinor) ?? undefined,
  sellingPriceAfterTaxMinor: toPriceText(item.sellingPriceAfterTaxMinor),
  compareAtPriceAfterTaxMinor: toPriceText(item.compareAtPriceAfterTaxMinor),
});

const buildFallbackPricing = (item: IVariationCardItem): ApiProduct["pricing"] => ({
  minDisplayPriceAfterTaxMinor: toPriceText(item.displayPriceAfterTaxMinor) ?? undefined,
  minSellingPriceAfterTaxMinor: toPriceText(item.sellingPriceAfterTaxMinor),
  minCompareAtPriceAfterTaxMinor: toPriceText(item.compareAtPriceAfterTaxMinor),
});

const buildProductCardDefaultDisplay = (item: IVariationCardItem, image: string): ApiProduct["defaultDisplay"] => {
  const fallback = buildFallbackDefaultDisplay(item, image);
  return {
    image,
    displayPriceAfterTaxMinor: item.defaultDisplay?.displayPriceAfterTaxMinor ?? fallback?.displayPriceAfterTaxMinor,
    sellingPriceAfterTaxMinor: item.defaultDisplay?.sellingPriceAfterTaxMinor ?? fallback?.sellingPriceAfterTaxMinor,
    compareAtPriceAfterTaxMinor: item.defaultDisplay?.compareAtPriceAfterTaxMinor ?? fallback?.compareAtPriceAfterTaxMinor,
  };
};

const buildProductCardPricing = (item: IVariationCardItem): ApiProduct["pricing"] => {
  const fallback = buildFallbackPricing(item);
  return {
    minDisplayPriceAfterTaxMinor: item.pricing?.minDisplayPriceAfterTaxMinor ?? fallback?.minDisplayPriceAfterTaxMinor,
    minSellingPriceAfterTaxMinor: item.pricing?.minSellingPriceAfterTaxMinor ?? fallback?.minSellingPriceAfterTaxMinor,
    minCompareAtPriceAfterTaxMinor: item.pricing?.minCompareAtPriceAfterTaxMinor ?? fallback?.minCompareAtPriceAfterTaxMinor,
  };
};

const mapProductCardShapeToProductItem = (item: IVariationCardItem, fallbackId: string): ProductItemProps => {
  const image = item.defaultDisplay?.image?.trim() || item.image?.trim() || "";
  const productId = resolveCardProductId(item, fallbackId);

  const apiProduct: ApiProduct = {
    productId,
    productName: item.productName?.trim() || item.name?.trim() || item.skuCode?.trim() || "Mix & Match",
    productSlug: item.productSlug?.trim() || item.slug?.trim() || productId,
    productStatus: item.productStatus ?? item.status ?? "",
    isPurchasable: item.isPurchasable,
    image,
    imageHover: item.imageHover?.trim() || "",
    brandName: item.brandName ?? "",
    pricing: buildProductCardPricing(item),
    defaultDisplay: buildProductCardDefaultDisplay(item, image),
    visualSwitch: item.visualSwitch ?? null,
    requiresSelectionDialog: item.requiresSelectionDialog ?? false,
    stockStatus: item.stockStatus ?? "",
    defaultVariationId: resolveCardDefaultVariationId(item, fallbackId),
    preOrderCampaignId: item.preOrderCampaignId ?? null,
    updatedAt: item.updatedAt ?? null,
    pricePresentation: item.pricePresentation,
  };

  return mapApiProductToProductItem(apiProduct);
};

export const mapVariationCardToProductItem = (item: IVariationCardItem): ProductItemProps | null => {
  if (!item.found || !item.variationId?.trim()) {
    return null;
  }

  return mapProductCardShapeToProductItem(item, item.variationId.trim());
};

export const mapVariationCardsToProductItems = (items: IVariationCardItem[] = []): ProductItemProps[] =>
  items.map((item) => mapVariationCardToProductItem(item)).filter((item): item is ProductItemProps => Boolean(item));

export const buildVariationCardLookup = (items: IVariationCardItem[] = []): Map<string, ProductItemProps> => {
  const lookup = new Map<string, ProductItemProps>();

  items.forEach((item) => {
    const mapped = mapVariationCardToProductItem(item);
    if (!mapped) return;
    [item.variationId, item.productId, mapped.id, mapped.defaultVariationId].forEach((id) => {
      const key = id?.trim();
      if (key) lookup.set(key, mapped);
    });
  });

  return lookup;
};
