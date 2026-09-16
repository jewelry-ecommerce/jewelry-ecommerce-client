import type { ProductItemProps } from "@/components/product/product-item/product-item.component";
import {
  ApiProduct,
  IProductFiltersResponse,
  IProductSkuCardItem,
  IProductSkuCardSelectedSku,
  IProductSkuCardVisualSwitchOption,
} from "./api/product/product.interface";
import { ProductFilterSection } from "@/components/product/product-filter-controls/product-filter-controls.interface";
import { resolveCustomerDisplayPrice } from "@/utils/customer-display-price.util";

export const mapApiProductToProductItem = (product: ApiProduct): ProductItemProps => {
  const customerDisplayPrice =
    product.defaultDisplay?.customerDisplayPrice ??
    product.pricing?.customerDisplayPrice ??
    resolveCustomerDisplayPrice({
      displayPriceAfterTaxMinor:
        product.defaultDisplay?.displayPriceAfterTaxMinor ??
        product.defaultDisplay?.sellingPriceAfterTaxMinor ??
        product.pricing?.minDisplayPriceAfterTaxMinor ??
        product.pricing?.minSellingPriceAfterTaxMinor,
      sellingPriceAfterTaxMinor: product.defaultDisplay?.sellingPriceAfterTaxMinor ?? product.pricing?.minSellingPriceAfterTaxMinor,
      compareAtPriceAfterTaxMinor: product.defaultDisplay?.compareAtPriceAfterTaxMinor ?? product.pricing?.minCompareAtPriceAfterTaxMinor,
    });
  const sellingPriceAfterTaxMinor = customerDisplayPrice.sellingPriceAfterTaxMinor;
  const compareAtPriceAfterTaxMinor = customerDisplayPrice.compareAtPriceAfterTaxMinor;

  const defaultVariationId = product.defaultVariationId?.trim();
  const options = product.visualSwitch?.options || [];
  const defaultOptionIndex = Math.max(
    options.findIndex((option) => option.selected),
    0,
  );

  const variants = options.map((option, index) => {
    const optionSellingPriceAfterTaxMinor =
      option.customerDisplayPrice ??
      resolveCustomerDisplayPrice({
        displayPriceAfterTaxMinor: option.displayPriceAfterTaxMinor ?? option.sellingPriceAfterTaxMinor,
        sellingPriceAfterTaxMinor: option.sellingPriceAfterTaxMinor,
        compareAtPriceAfterTaxMinor: option.compareAtPriceAfterTaxMinor,
      });
    const isDefaultOption = index === defaultOptionIndex;
    // Prefer per-SKU campaign; chỉ fallback product khi option không gửi field (legacy).
    const optionCampaign = "preOrderCampaignId" in option ? option.preOrderCampaignId : (product.preOrderCampaignId ?? null);

    return {
      label: option.label,
      image: option.image,
      thumbnail: option.thumbnail,
      selected: option.selected,
      valueCode: option.valueCode,
      sellingPriceAfterTaxMinor: optionSellingPriceAfterTaxMinor.sellingPriceAfterTaxMinor,
      compareAtPriceAfterTaxMinor: optionSellingPriceAfterTaxMinor.compareAtPriceAfterTaxMinor,
      discountPercent: option.customerDisplayPrice
        ? option.customerDisplayPrice.discountPercent
        : optionSellingPriceAfterTaxMinor.discountPercent,
      hasDiscount: option.customerDisplayPrice ? option.customerDisplayPrice.hasDiscount : optionSellingPriceAfterTaxMinor.hasDiscount,
      stockStatus: option.stockStatus,
      variationId: option.variationId?.trim() || option.previewVariationId?.trim() || (isDefaultOption ? defaultVariationId : undefined),
      preOrderCampaignId: optionCampaign ?? null,
    };
  });

  const primaryImage = product.defaultDisplay?.image || product.image;
  const hoverImage = product.imageHover;

  const resolvedVariants =
    variants.length > 0
      ? variants
      : defaultVariationId
        ? [
            {
              label: "",
              image: primaryImage,
              selected: true,
              sellingPriceAfterTaxMinor,
              compareAtPriceAfterTaxMinor,
              discountPercent: customerDisplayPrice.discountPercent,
              hasDiscount: customerDisplayPrice.hasDiscount,
              stockStatus: product.stockStatus,
              variationId: defaultVariationId,
              preOrderCampaignId: product.preOrderCampaignId ?? null,
            },
          ]
        : undefined;

  return {
    id: product.productId,
    name: product.productName,
    sellingPriceAfterTaxMinor,
    compareAtPriceAfterTaxMinor,
    discountPercent: customerDisplayPrice.discountPercent,
    hasDiscount: customerDisplayPrice.hasDiscount,
    images: [primaryImage, hoverImage].filter(Boolean),
    variants: resolvedVariants,
    variantAttributeCode: product.visualSwitch?.attributeCode,
    slug: product.productSlug,
    stockStatus: product.stockStatus,
    productStatus: product.productStatus,
    isPurchasable: product.isPurchasable,
    requiresSelectionDialog: product.requiresSelectionDialog ?? true,
    defaultVariationId: defaultVariationId || undefined,
    showDiscountPercent: product.pricePresentation?.showDiscountPercent,
  };
};

export const mapApiProductsToProductItems = (products: ApiProduct[]): ProductItemProps[] => {
  return (products || []).filter(Boolean).map((product) => mapApiProductToProductItem(product));
};

const mapSkuCardOptionToVariant = (
  option: IProductSkuCardVisualSwitchOption,
  selectedSku: IProductSkuCardSelectedSku,
): NonNullable<ProductItemProps["variants"]>[number] => {
  const isSelectedSku = option.sku.id === selectedSku.id;

  return {
    label: option.label,
    image: option.sku.image ?? "",
    imageHover: option.sku.imageHover ?? undefined,
    thumbnail: option.swatchImage ?? undefined,
    selected: option.selected,
    valueCode: option.valueCode ?? undefined,
    sellingPriceAfterTaxMinor: option.sku.customerDisplayPrice.sellingPriceAfterTaxMinor,
    compareAtPriceAfterTaxMinor: option.sku.customerDisplayPrice.compareAtPriceAfterTaxMinor,
    stockStatus: option.sku.stockStatus,
    variationId: option.sku.id,
    // Prefer per-SKU campaign; chỉ fallback selectedSku khi option.sku không gửi field.
    preOrderCampaignId:
      "preOrderCampaignId" in option.sku
        ? (option.sku.preOrderCampaignId ?? null)
        : isSelectedSku
          ? (selectedSku.preOrderCampaignId ?? null)
          : null,
    discountPercent: option.sku.customerDisplayPrice.discountPercent,
    hasDiscount: option.sku.customerDisplayPrice.hasDiscount,
  };
};

export const mapApiProductSkuCardToProductItem = (product: IProductSkuCardItem): ProductItemProps => {
  const selectedSku = product.selectedSku;
  const customerDisplayPrice = selectedSku.customerDisplayPrice;
  const images = [selectedSku.image, selectedSku.imageHover].filter((image): image is string => Boolean(image && image.trim()));
  const variants =
    product.visualSwitch?.options?.length && product.visualSwitch.options.length > 0
      ? product.visualSwitch.options.map((option) => mapSkuCardOptionToVariant(option, selectedSku))
      : [
          {
            label: "",
            image: selectedSku.image ?? "",
            imageHover: selectedSku.imageHover ?? undefined,
            thumbnail: undefined,
            selected: true,
            valueCode: undefined,
            sellingPriceAfterTaxMinor: customerDisplayPrice.sellingPriceAfterTaxMinor,
            compareAtPriceAfterTaxMinor: customerDisplayPrice.compareAtPriceAfterTaxMinor,
            stockStatus: selectedSku.stockStatus,
            variationId: selectedSku.id,
            preOrderCampaignId: selectedSku.preOrderCampaignId ?? null,
            discountPercent: customerDisplayPrice.discountPercent,
            hasDiscount: customerDisplayPrice.hasDiscount,
          },
        ];

  return {
    id: product.productId,
    name: product.name,
    sellingPriceAfterTaxMinor: customerDisplayPrice.sellingPriceAfterTaxMinor,
    compareAtPriceAfterTaxMinor: customerDisplayPrice.compareAtPriceAfterTaxMinor,
    discountPercent: customerDisplayPrice.discountPercent,
    hasDiscount: customerDisplayPrice.hasDiscount,
    images,
    variants,
    variantAttributeCode: product.visualSwitch?.attributeCode,
    slug: product.slug,
    stockStatus: selectedSku.stockStatus,
    productStatus: product.status,
    isPurchasable: product.isPurchasable,
    requiresSelectionDialog: product.addToCart.mode === "SELECT_REQUIRED",
    defaultVariationId: selectedSku.id,
    showDiscountPercent: product.pricePresentation?.showDiscountPercent,
  };
};

export const mapApiProductSkuCardsToProductItems = (products: IProductSkuCardItem[]): ProductItemProps[] => {
  return (products || []).filter(Boolean).map((product) => mapApiProductSkuCardToProductItem(product));
};

export const applyWishlistStateToProductItems = (
  items: ProductItemProps[],
  isProductWished: (productId: string) => boolean,
  onToggleFavorite?: ProductItemProps["onToggleFavorite"],
): ProductItemProps[] =>
  items.map((item) => ({
    ...item,
    isWishlistActive: isProductWished(item.id),
    onToggleFavorite,
  }));

export const mapFilterSections = (filters: IProductFiltersResponse): ProductFilterSection[] => {
  if (!Array.isArray(filters)) {
    return [];
  }

  return filters.map((section) => ({
    id: section.id,
    label: section.label,
    defaultExpanded: true,
    options: (section.options || []).map((option) => ({
      id: option.value,
      label: option.label,
      count: option.count,
      checked: false,
    })),
  }));
};
