import type { CartItemStatus, CartPackagingData, CartViewItem } from "@/utils/api/cart/cart.interface";
import type { CartRecommendationProduct } from "@/utils/api/cart/cart.interface";
import {
  attachPackagingGiftsToCartItem,
  buildPackagingDataFromProductOptions,
  formatProductAttributeValues,
  resolvePackagingOptionsForVariation,
} from "@/utils/api/cart/cart.util";
import { resolveCustomerDisplayPrice, type CustomerDisplayPriceSource } from "@/utils/customer-display-price.util";
import type {
  IProductPackagingOption,
  IProductSkuCardItem,
  IProductVariation,
  IProductVariationAttribute,
  IProductVariationResponse,
  IProductVariationsResponse,
  IVariantSelector,
} from "@/utils/api/product/product.interface";
import { isSizeVariantAttribute } from "@/utils/product/size-variant-attribute.util";
import { ProductAvailabilityCode, ProductStockStatus } from "@/utils/api/product/product.enum";
import { isPreOrderPurchaseAction } from "@/utils/product/purchase-action.util";
import { resolveProductDefaultImageSrc } from "@/utils/config/tenant-branding.util";
import { PRE_ORDER_BADGE_COLORS } from "@/utils/constants/pre-order-badge.constant";

const formatCurrency = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
const productDefaultImage = () => resolveProductDefaultImageSrc();
const PRE_ORDER_MAX_QUANTITY = 999;

export interface CartViewItemBuildInput {
  variationId: string;
  productId?: string;
  productSlug: string;
  name: string;
  imageSrc: string;
  imageAlt?: string;
  sellingPriceAfterTaxMinor: number;
  compareAtPriceAfterTaxMinor?: number;
  customerDisplayPrice?: CustomerDisplayPriceSource;
  stock?: number;
  inStock?: boolean;
  maxQuantity?: number;
  availabilityCode?: string;
  details?: string;
  sizeLabel?: string;
  quantity?: number;
  selected?: boolean;
  status?: CartItemStatus;
  disableQuantityControl?: boolean;
  packaging?: CartPackagingData;
  selectedPackagingRelationIds?: string[];
  showDiscountPercent?: boolean;
}

function resolveStockFields(input: CartViewItemBuildInput): {
  status?: CartItemStatus;
  maxQuantity?: number;
  disableQuantityControl?: boolean;
} {
  const isPreOrder = input.availabilityCode === ProductAvailabilityCode.PRE_ORDER;

  if (isPreOrder) {
    const stock = input.stock ?? 0;
    return {
      status: input.status ?? {
        label: "Đặt trước",
        tone: "warning",
        textColor: PRE_ORDER_BADGE_COLORS.color,
        backgroundColor: PRE_ORDER_BADGE_COLORS.backgroundColor,
      },
      maxQuantity: input.maxQuantity ?? Math.max(stock, PRE_ORDER_MAX_QUANTITY),
      disableQuantityControl: input.disableQuantityControl ?? false,
    };
  }

  if (input.status !== undefined || input.maxQuantity !== undefined || input.disableQuantityControl !== undefined) {
    return {
      status: input.status,
      maxQuantity: input.maxQuantity,
      disableQuantityControl: input.disableQuantityControl,
    };
  }

  if (input.inStock !== undefined) {
    const inStock = input.inStock;
    return {
      status: {
        label: inStock ? "Đang có hàng" : "Hết hàng",
        tone: inStock ? "success" : "error",
      },
      maxQuantity: input.maxQuantity ?? (inStock ? 999 : 0),
      disableQuantityControl: !inStock,
    };
  }

  if (input.stock === undefined) {
    return {};
  }

  const stock = input.stock;
  const inStock = stock > 0;
  return {
    status: {
      label: inStock ? "Đang có hàng" : "Hết hàng",
      tone: inStock ? "success" : "error",
    },
    maxQuantity: stock,
    disableQuantityControl: stock <= 0,
  };
}

export function buildCartViewItem(input: CartViewItemBuildInput): CartViewItem {
  const customerDisplayPrice = resolveCustomerDisplayPrice(input.customerDisplayPrice ?? input);
  const stockFields = resolveStockFields(input);

  return {
    id: input.variationId,
    variationId: input.variationId,
    productId: input.productId ? String(input.productId) : undefined,
    productSlug: input.productSlug,
    image: {
      src: input.imageSrc || productDefaultImage(),
      alt: input.imageAlt ?? input.name,
    },
    name: input.name,
    details: input.details,
    sizeLabel: input.sizeLabel,
    quantity: input.quantity ?? 1,
    minQuantity: 1,
    maxQuantity: stockFields.maxQuantity,
    disableQuantityControl: stockFields.disableQuantityControl,
    availabilityCode: input.availabilityCode,
    status: stockFields.status,
    price: {
      current: formatCurrency(customerDisplayPrice.sellingPriceAfterTaxMinor),
      original: customerDisplayPrice.compareAtPriceAfterTaxMinor
        ? formatCurrency(customerDisplayPrice.compareAtPriceAfterTaxMinor)
        : undefined,
      discountLabel:
        customerDisplayPrice.hasDiscount && customerDisplayPrice.discountPercent != null
          ? `-${customerDisplayPrice.discountPercent}%`
          : undefined,
      discountPercent:
        customerDisplayPrice.hasDiscount && customerDisplayPrice.discountPercent != null ? customerDisplayPrice.discountPercent : undefined,
      hasDiscount: customerDisplayPrice.hasDiscount,
      showDiscountPercent: input.showDiscountPercent,
    },
    customerDisplayPrice,
    unitPrice: customerDisplayPrice.sellingPriceAfterTaxMinor,
    originalUnitPrice: customerDisplayPrice.compareAtPriceAfterTaxMinor ?? undefined,
    gifts: [],
    selected: input.selected ?? true,
    ...(input.selectedPackagingRelationIds ? { selectedPackagingRelationIds: input.selectedPackagingRelationIds } : {}),
    ...(input.packaging ? { packaging: input.packaging } : {}),
  };
}

export interface ProductCardCartSource {
  id: string;
  productId?: string;
  slug?: string;
  name: string;
  images?: string[];
  compareAtPriceAfterTaxMinor?: number | null;
  sellingPriceAfterTaxMinor?: number;
  customerDisplayPrice?: CustomerDisplayPriceSource;
  stock?: number;
  stockStatus?: string;
  preOrderCampaignId?: string | null;
}

export function buildCartViewItemFromProductCard(product: ProductCardCartSource): CartViewItem {
  const isPreOrder = Boolean(product.preOrderCampaignId?.trim());

  return buildCartViewItem({
    variationId: product.id,
    productId: product.productId ? String(product.productId) : String(product.id),
    productSlug: product.slug || product.id,
    name: product.name,
    imageSrc: product.images?.[0] || productDefaultImage(),
    imageAlt: product.name,
    sellingPriceAfterTaxMinor: Number(product.sellingPriceAfterTaxMinor ?? product.compareAtPriceAfterTaxMinor ?? 0),
    compareAtPriceAfterTaxMinor: Number(product.compareAtPriceAfterTaxMinor ?? 0),
    customerDisplayPrice: product.customerDisplayPrice,
    ...(isPreOrder
      ? {
          availabilityCode: ProductAvailabilityCode.PRE_ORDER,
          stock: Number(product.stock ?? 0),
        }
      : product.stock !== undefined
        ? { stock: Number(product.stock) }
        : {}),
  });
}

export function buildCartViewItemFromProductSkuCard(product: IProductSkuCardItem, skuId?: string): CartViewItem {
  const sku =
    skuId && String(product.selectedSku.id) !== String(skuId)
      ? (product.visualSwitch?.options?.find((option) => String(option.sku.id) === String(skuId))?.sku ?? product.selectedSku)
      : product.selectedSku;

  return buildCartViewItemFromProductCard({
    id: sku.id,
    productId: product.productId,
    slug: product.slug,
    name: product.name,
    images: [sku.image, sku.imageHover].filter((image): image is string => Boolean(image)),
    customerDisplayPrice: sku.customerDisplayPrice,
    sellingPriceAfterTaxMinor: sku.customerDisplayPrice.sellingPriceAfterTaxMinor ?? 0,
    compareAtPriceAfterTaxMinor: sku.customerDisplayPrice.compareAtPriceAfterTaxMinor ?? 0,
    stockStatus: sku.stockStatus,
    preOrderCampaignId: sku.preOrderCampaignId,
  });
}

export interface ProductSwatchCartSource {
  variationId: string;
  name: string;
  slug: string;
  productId: string;
  images: string[];
  label: string;
  image: string;
  compareAtPriceAfterTaxMinor?: number;
  sellingPriceAfterTaxMinor?: number;
  customerDisplayPrice?: CustomerDisplayPriceSource;
  stockStatus?: string;
  preOrderCampaignId?: string | null;
  showDiscountPercent?: boolean;
}

export function buildCartViewItemFromProductSwatchCard(source: ProductSwatchCartSource): CartViewItem {
  const isPreOrder = Boolean(source.preOrderCampaignId?.trim());
  const inStock = source.stockStatus !== ProductStockStatus.OUT_OF_STOCK;

  return buildCartViewItem({
    variationId: source.variationId,
    productId: String(source.productId),
    productSlug: source.slug,
    name: source.name,
    imageSrc: source.image || source.images[0] || "",
    imageAlt: source.name,
    sellingPriceAfterTaxMinor: Number(source.sellingPriceAfterTaxMinor ?? source.compareAtPriceAfterTaxMinor ?? 0),
    compareAtPriceAfterTaxMinor: Number(source.compareAtPriceAfterTaxMinor ?? 0),
    customerDisplayPrice: source.customerDisplayPrice,
    showDiscountPercent: source.showDiscountPercent,
    ...(isPreOrder
      ? {
          availabilityCode: ProductAvailabilityCode.PRE_ORDER,
          stock: 0,
        }
      : { inStock }),
    details: source.label,
  });
}

export function buildCartViewItemFromRecommendation(product: CartRecommendationProduct): CartViewItem {
  const stock = Number(product.stock || 0);

  return buildCartViewItem({
    variationId: product.id,
    productId: String(product.productId || product.product?.id || ""),
    productSlug: product.product?.id ?? product.productId ?? product.id,
    name: product.product?.name ?? product.name,
    imageSrc: product.product?.image ?? productDefaultImage(),
    imageAlt: product.product?.name ?? product.name,
    sellingPriceAfterTaxMinor: Number(product.sellingPriceAfterTaxMinor ?? product.compareAtPriceAfterTaxMinor ?? 0),
    compareAtPriceAfterTaxMinor: Number(product.compareAtPriceAfterTaxMinor || 0),
    customerDisplayPrice: product.customerDisplayPrice,
    stock,
    details: formatProductAttributeValues(product.attributes) || undefined,
    sizeLabel: product.size,
  });
}

function resolveVariationsAttributeDisplay(attributes: IProductVariationAttribute[], attributeCode: string, valueCode: string) {
  const matchedAttribute = attributes.find((attr) => attr.code === attributeCode);
  const matchedValue = matchedAttribute?.values.find((value) => value.code === valueCode);

  return {
    attributeName: matchedAttribute?.name ?? attributeCode,
    displayValue:
      matchedValue?.value ??
      (String(attributeCode).toUpperCase() === "SIZE" ? valueCode.split("_").pop() || valueCode : valueCode.replaceAll("_", " ")),
  };
}

export function buildCartViewItemFromVariationsApiResponse(
  slug: string,
  product: IProductVariationsResponse["product"],
  variation: IProductVariationResponse,
  attributes: IProductVariationAttribute[],
): CartViewItem {
  const sizeAttr = variation.attributeValues.find((attr) => String(attr.attributeCode).toUpperCase() === "SIZE");
  const isPreOrder = Boolean(variation.preOrderCampaignId?.trim());

  return buildCartViewItem({
    variationId: variation.id,
    productId: String(product.id),
    productSlug: product.slug || slug,
    name: product.name,
    imageSrc: variation.image || product.image,
    imageAlt: product.name,
    sellingPriceAfterTaxMinor: Number(variation.sellingPriceAfterTaxMinor ?? variation.compareAtPriceAfterTaxMinor ?? 0),
    compareAtPriceAfterTaxMinor: Number(variation.compareAtPriceAfterTaxMinor ?? 0),
    customerDisplayPrice: variation.customerDisplayPrice,
    showDiscountPercent: variation.pricePresentation?.showDiscountPercent,
    stock: Number(variation.stock ?? 0),
    ...(isPreOrder
      ? {
          availabilityCode: ProductAvailabilityCode.PRE_ORDER,
          status: {
            label: "Đặt trước",
            tone: "warning" as const,
            textColor: PRE_ORDER_BADGE_COLORS.color,
            backgroundColor: PRE_ORDER_BADGE_COLORS.backgroundColor,
          },
        }
      : {}),
    details: variation.attributeValues
      .filter((attr) => String(attr.attributeCode).toUpperCase() !== "SIZE")
      .map((attr) => resolveVariationsAttributeDisplay(attributes, attr.attributeCode, attr.valueCode).displayValue)
      .join(", "),
    sizeLabel: sizeAttr
      ? resolveVariationsAttributeDisplay(attributes, sizeAttr.attributeCode, sizeAttr.valueCode).displayValue
      : undefined,
  });
}

export function resolveCartVariantLabelsFromProductDetail(
  variation: IProductVariation,
  variantSelectors?: IVariantSelector[],
): { details?: string; sizeLabel?: string } {
  if (variantSelectors?.length && variation.attributes && Object.keys(variation.attributes).length > 0) {
    const detailParts: string[] = [];
    let sizeLabel: string | undefined;

    for (const selector of variantSelectors) {
      const valueCode = variation.attributes[selector.attribute.code];
      if (!valueCode) continue;

      const option = selector.options.find((item) => item.code === valueCode);
      const displayValue = option?.label?.trim() || option?.value?.trim();
      if (!displayValue) continue;

      if (isSizeVariantAttribute(selector.attribute)) {
        sizeLabel = displayValue;
        continue;
      }

      detailParts.push(displayValue);
    }

    if (detailParts.length > 0 || sizeLabel) {
      return {
        details: detailParts.length > 0 ? detailParts.join(", ") : undefined,
        sizeLabel,
      };
    }
  }

  const attributeValues = variation.attributeValues ?? [];
  if (attributeValues.length > 0) {
    const detailParts: string[] = [];
    let sizeLabel: string | undefined;

    for (const entry of attributeValues) {
      const value = entry.value?.trim();
      if (!value || !entry.attribute?.code) continue;

      if (isSizeVariantAttribute(entry.attribute)) {
        sizeLabel = value;
        continue;
      }

      detailParts.push(value);
    }

    return {
      details: detailParts.length > 0 ? detailParts.join(", ") : undefined,
      sizeLabel,
    };
  }

  return {};
}

export interface ProductDetailVariantCartSource {
  productId?: string;
  productSlug: string;
  productName: string;
  productImage?: string;
  variation: IProductVariation;
  variantSelectors?: IVariantSelector[];
  packagingOptions?: IProductPackagingOption[];
  selectedPackagingRelationIds?: string[];
}

export function buildCartViewItemFromProductDetailVariant({
  productId,
  productSlug,
  productName,
  productImage,
  variation,
  variantSelectors,
  packagingOptions,
  selectedPackagingRelationIds,
}: ProductDetailVariantCartSource): CartViewItem {
  const packaging = packagingOptions?.length
    ? buildPackagingDataFromProductOptions(
        resolvePackagingOptionsForVariation(packagingOptions, variation.id),
        selectedPackagingRelationIds,
      )
    : undefined;

  const { details, sizeLabel } = resolveCartVariantLabelsFromProductDetail(variation, variantSelectors);
  const isPreOrder = isPreOrderPurchaseAction(variation.purchaseAction);

  const baseItem = buildCartViewItem({
    variationId: variation.id,
    productId,
    productSlug,
    name: productName,
    imageSrc: variation.image || variation.gallery?.[0]?.url || productImage || "",
    imageAlt: productName,
    sellingPriceAfterTaxMinor: Number(variation.pricing?.sellingPriceAfterTaxMinor ?? variation.pricing?.compareAtPriceAfterTaxMinor ?? 0),
    compareAtPriceAfterTaxMinor: Number(variation.pricing?.compareAtPriceAfterTaxMinor ?? 0),
    customerDisplayPrice: variation.pricing?.customerDisplayPrice,
    showDiscountPercent: variation.pricePresentation?.showDiscountPercent,
    stock: Number(variation.stock ?? 0),
    ...(isPreOrder
      ? {
          availabilityCode: ProductAvailabilityCode.PRE_ORDER,
          status: {
            label: variation.purchaseAction?.label?.trim() || "Đặt trước",
            tone: "warning" as const,
            textColor: PRE_ORDER_BADGE_COLORS.color,
            backgroundColor: PRE_ORDER_BADGE_COLORS.backgroundColor,
          },
        }
      : {}),
    details,
    sizeLabel,
    selectedPackagingRelationIds,
  });

  return attachPackagingGiftsToCartItem(baseItem, packaging);
}
