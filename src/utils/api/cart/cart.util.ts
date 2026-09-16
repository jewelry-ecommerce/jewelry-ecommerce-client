import type {
  CartAttachedItem,
  CartPackagingData,
  CartPackagingOption,
  CartSetApiItem,
  CartSetViewItem,
  CartViewItem,
} from "@/utils/api/cart/cart.interface";
import { CartApi } from "..";
import type { IProductPackagingOption } from "../product/product.interface";
import { isSizeVariantAttribute } from "@/utils/product/size-variant-attribute.util";
import { ProductAvailabilityCode, ProductLifecycleStatus, ProductStockStatus } from "../product/product.enum";
import { mapAvailabilityDisplayToCartItemStatus, resolveCartExpectedStockAt, resolveLegacyCartItemStatus } from "./cart-availability.util";
import { getGuestCartId } from "./guest-cart-id.util";
import { resolveCustomerDisplayPrice, type CustomerDisplayPrice } from "@/utils/customer-display-price.util";
import {
  CartApiItem,
  CartApiResponse,
  CartItemPrice,
  CartProductAttribute,
  CartRecommendationProduct,
  ParamPostCartItem,
  ProductAttribute,
  type UtmData,
} from "./cart.interface";

export const formatProductAttributeValues = (attributes?: ProductAttribute[]) =>
  attributes
    ?.map((attr) => attr.value?.trim())
    .filter(Boolean)
    .join(", ") ?? "";

export const GUEST_CART_STORAGE_KEY = "guest_cart_items";

export type CartRequestOptions = {
  skipAuthLogout?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Gắn với lần invalidate khi user tương tác — bỏ qua sync cũ nếu đã có thao tác mới. */
  syncGeneration?: number;
};

export function withFreshGuestCartHeader(options: CartRequestOptions = {}): CartRequestOptions {
  const guestId = getGuestCartId();
  if (!guestId) {
    const { headers: _headers, ...rest } = options;
    return rest;
  }

  return {
    ...options,
    headers: {
      ...options.headers,
      "x-guest-id": guestId,
    },
  };
}

export function getCartApiOptions(isLogin: boolean): CartRequestOptions {
  return withFreshGuestCartHeader({ skipAuthLogout: !isLogin });
}

export type PostCartLine = ParamPostCartItem["items"][number];

export function buildPostCartLine({
  variationId,
  quantity,
  selectedPackagingRelationIds,
  utm_data,
}: {
  variationId: string;
  quantity: number;
  selectedPackagingRelationIds?: string[];
  utm_data?: UtmData | null;
}): PostCartLine {
  const packagingIds = selectedPackagingRelationIds?.filter(Boolean) ?? [];

  return {
    variationId: String(variationId),
    quantity,
    ...(packagingIds.length > 0 ? { selectedPackagingRelationIds: packagingIds } : {}),
    ...(utm_data !== undefined ? { utm_data } : {}),
  };
}

// set term
export function buildPostCartSetLine({
  setId,
  lineId,
  quantity,
  setComponents,
}: {
  setId: string;
  lineId?: string | null;
  quantity: number;
  setComponents: Array<{ setItemId: string; variationId: string }>;
}): PostCartLine {
  return { setId, ...(lineId ? { lineId } : {}), quantity, setComponents };
}

export function mapViewItemToPostLine(item: CartViewItem, quantity?: number): PostCartLine {
  return buildPostCartLine({
    variationId: String(item.id),
    quantity: quantity ?? item.quantity,
    selectedPackagingRelationIds: item.selectedPackagingRelationIds,
  });
}

export const CART_ITEM_INVALID_REASON = {
  OUT_OF_STOCK: "OUT_OF_STOCK",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
} as const;

/** API reasons tied to packaging/ops stock — must not block merchandise checkout on FE. */
export const CART_PACKAGING_STOCK_INVALID_REASONS = [
  "PACKAGING_OUT_OF_STOCK",
  "REQUIRED_PACKAGING_UNAVAILABLE",
  "SELECTED_PACKAGING_UNAVAILABLE",
] as const;

export const formatCurrency = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

export const isPackagingOnlyInvalidReason = (reason?: string | null): boolean =>
  Boolean(reason && (CART_PACKAGING_STOCK_INVALID_REASONS as readonly string[]).includes(reason));

export const isCartItemInvalidOutOfStock = (item: Pick<CartViewItem, "isValid" | "reason">) =>
  item.isValid === false && item.reason === CART_ITEM_INVALID_REASON.OUT_OF_STOCK;

export const isCartItemInvalidInsufficientStock = (item: Pick<CartViewItem, "isValid" | "reason">) =>
  item.isValid === false && item.reason === CART_ITEM_INVALID_REASON.INSUFFICIENT_STOCK;

export const isCartItemCheckoutEligible = (
  item: Pick<
    CartViewItem,
    "disableSelection" | "disableQuantityControl" | "isValid" | "reason" | "maxQuantity" | "status" | "availabilityCode"
  >,
) => {
  const isPreOrder = item.availabilityCode === ProductAvailabilityCode.PRE_ORDER;
  // BE may flag pre-order lines as OUT_OF_STOCK (qty 0) while still sellable as pre-order.
  if (item.isValid === false && !isPackagingOnlyInvalidReason(item.reason) && !isPreOrder) return false;
  if (item.disableSelection || item.disableQuantityControl) return false;
  if (!isPreOrder && typeof item.maxQuantity === "number" && item.maxQuantity <= 0) return false;
  if (item.status?.tone === "error") return false;
  return true;
};

export const computeGuestCartSummary = (items: CartViewItem[]) => {
  const subTotal = items.reduce((sum, item) => {
    const packagingTotal = [
      ...(item.packaging?.requiredIncludedPackaging ?? []),
      ...(item.packaging?.selectedOptionalPackaging ?? []),
    ].reduce((packagingSum, option) => {
      const includedPrice = Number(option.includedPriceAfterTax ?? option.packaging?.includedPriceAfterTax ?? 0);
      return packagingSum + includedPrice * item.quantity;
    }, 0);
    return sum + item.unitPrice * item.quantity + packagingTotal;
  }, 0);
  const discountTotal = 0;
  const totalAmount = Math.max(subTotal - discountTotal, 0);

  return {
    subTotal,
    discountTotal,
    discounts: discountTotal > 0 ? [{ label: "Giảm giá sản phẩm", value: 0 }] : [],
    shippingFee: 0,
    totalAmount,
    // rewardPoints: Math.floor(totalAmount / 1000),
    // BA kêu để 0
    rewardPoints: 0,
  };
};

const parseMoney = (v: string | number | undefined) => {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number(String(v).replace(/[^\d.-]/g, "") || 0);
  return Number.isFinite(n) ? n : 0;
};

const resolveCartCustomerDisplayPrice = (item: CartApiItem, variation?: CartApiItem["variation"]): CustomerDisplayPrice =>
  item.customerDisplayPrice ??
  resolveCustomerDisplayPrice({
    displayPriceAfterTaxMinor: item.displayPriceAfterTaxMinor ?? item.discountedSellingPriceAfterTaxMinor,
    sellingPriceAfterTaxMinor: item.sellingPriceAfterTaxMinor ?? variation?.sellingPriceAfterTaxMinor,
    compareAtPriceAfterTaxMinor: item.compareAtPriceAfterTaxMinor ?? variation?.compareAtPriceAfterTaxMinor,
  });

const getDiscountPercentage = (compareAtPriceAfterTaxMinor: number, sellingPriceAfterTaxMinor: number): string => {
  if (!compareAtPriceAfterTaxMinor || !sellingPriceAfterTaxMinor || sellingPriceAfterTaxMinor >= compareAtPriceAfterTaxMinor) return "";
  const discount = Math.round(((compareAtPriceAfterTaxMinor - sellingPriceAfterTaxMinor) / compareAtPriceAfterTaxMinor) * 100);
  return discount > 0 ? `-${discount}%` : "";
};

const getDiscountPercentValue = (compareAtPriceAfterTaxMinor: number, sellingPriceAfterTaxMinor: number): number | undefined => {
  if (!compareAtPriceAfterTaxMinor || !sellingPriceAfterTaxMinor || sellingPriceAfterTaxMinor >= compareAtPriceAfterTaxMinor) {
    return undefined;
  }

  const discount = Math.round(((compareAtPriceAfterTaxMinor - sellingPriceAfterTaxMinor) / compareAtPriceAfterTaxMinor) * 100);
  return discount > 0 ? discount : undefined;
};

export const buildAttachedPackagingItem = (option: CartPackagingOption, lineQuantity = 1): CartAttachedItem => {
  const packagingName = option.packaging?.name ?? option.name ?? "Packaging";
  const packagingSkuCode = option.packaging?.skuCode ?? option.skuCode;
  const packagingImage = option.packaging?.image ?? option.image;
  const includedPrice = parseMoney(option.includedPriceAfterTax ?? option.packaging?.includedPriceAfterTax ?? 0);
  const originalPrice = parseMoney(option.packaging?.basePriceAfterTax ?? includedPrice);
  return {
    id: option.relationId,
    badge: option.isRequired ? "Bao bì/ hộp đựng" : "Bao bì/ hộp đựng (tùy chọn)",
    image: {
      src: packagingImage || "/image/product/product-default.jpg",
      alt: packagingName,
    },
    name: packagingName,
    subInfo: packagingSkuCode ? `SKU: ${packagingSkuCode}` : undefined,
    quantityLabel: String(lineQuantity),
    price: {
      current: formatCurrency(includedPrice),
      original: originalPrice > includedPrice ? formatCurrency(originalPrice) : undefined,
      discountLabel: getDiscountPercentage(originalPrice, includedPrice) || undefined,
      discountPercent: getDiscountPercentValue(originalPrice, includedPrice),
    },
  };
};

const mapProductPackagingOptionToCartOption = (option: IProductPackagingOption): CartPackagingOption => ({
  relationId: option.relationId,
  quantity: option.quantity,
  includedPriceAfterTax: option.includedPriceAfterTax,
  isRequired: option.isRequired,
  isDefault: option.isDefault,
  canCustomerChoose: option.canCustomerChoose,
  isVisibleOnProduct: option.isVisibleOnProduct,
  sortOrder: option.sortOrder,
  packaging: {
    variationId: option.packaging.variationId,
    productId: option.packaging.productId,
    name: option.packaging.name,
    skuCode: option.packaging.skuCode,
    image: option.packaging.image,
    basePriceAfterTax: option.packaging.basePriceAfterTax,
    includedPriceAfterTax: option.packaging.includedPriceAfterTax,
    isVisible: option.packaging.isVisible,
    canBeSold: option.packaging.canBeSold,
    packagingType: option.packaging.packagingType,
    status: option.packaging.status,
  },
});

const buildPackagingOptionsFromPackagingData = (packaging?: CartPackagingData): CartPackagingOption[] | undefined => {
  if (!packaging) return undefined;

  const optionMap = new Map<string, CartPackagingOption>();
  [
    ...(packaging.requiredIncludedPackaging ?? []),
    ...(packaging.optionalPackagingOptions ?? []),
    ...(packaging.selectedOptionalPackaging ?? []),
  ].forEach((option) => {
    optionMap.set(option.relationId, option);
  });

  const packagingOptions = Array.from(optionMap.values());
  return packagingOptions.length > 0 ? packagingOptions : undefined;
};

const isPackagingOptionEligibleForGuestCart = (option: IProductPackagingOption): boolean => {
  if (option.status !== "ACTIVE" || !option.isVisibleOnProduct) {
    return false;
  }

  // Required included packaging is bundled with the product (PDP "Đi kèm")
  // even when the packaging SKU profile is not visible/sellable in catalog.
  if (option.isRequired) {
    return true;
  }

  return option.packaging?.isVisible !== false;
};

export const resolvePackagingOptionsForVariation = (
  options: IProductPackagingOption[],
  variationId?: string,
): IProductPackagingOption[] => {
  const filtered = options.filter(isPackagingOptionEligibleForGuestCart).sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
    return left.packaging.name.localeCompare(right.packaging.name);
  });

  if (!variationId) {
    return filtered.filter((option) => !option.sourceVariationId);
  }

  const variationLevel = filtered.filter((option) => option.sourceVariationId === variationId);
  if (variationLevel.length > 0) {
    return variationLevel;
  }

  return filtered.filter((option) => !option.sourceVariationId);
};

export const attachPackagingGiftsToCartItem = (item: CartViewItem, packaging?: CartPackagingData): CartViewItem => {
  if (!packaging) {
    return {
      ...item,
      packaging: undefined,
      packagingOptions: undefined,
      selectedPackagingRelationIds: undefined,
      gifts: [],
    };
  }

  return {
    ...item,
    packaging,
    packagingOptions: buildPackagingOptionsFromPackagingData(packaging),
    selectedPackagingRelationIds: packaging.selectedOptionalPackagingRelationIds ?? item.selectedPackagingRelationIds,
    gifts: [...(packaging.requiredIncludedPackaging ?? []), ...(packaging.selectedOptionalPackaging ?? [])].map((option) =>
      buildAttachedPackagingItem(option, item.quantity),
    ),
  };
};

const buildPackagingDataFromCartOptions = (
  options: CartPackagingOption[],
  selectedRelationIds?: string[],
): CartPackagingData | undefined => {
  if (!options.length) {
    return undefined;
  }

  const requiredIncludedPackaging = options.filter((option) => option.isRequired);
  const optionalSelectableOptions = options.filter((option) => !option.isRequired && option.canCustomerChoose !== false);

  const selectedIds =
    selectedRelationIds && selectedRelationIds.length > 0
      ? selectedRelationIds
      : options
          .filter((option) => !option.isRequired && (option.isDefault || option.canCustomerChoose === false))
          .map((option) => option.relationId);

  const selectedOptionalPackaging = options.filter((option) => !option.isRequired && selectedIds.includes(option.relationId));

  if (requiredIncludedPackaging.length === 0 && optionalSelectableOptions.length === 0 && selectedOptionalPackaging.length === 0) {
    return undefined;
  }

  return {
    requiredIncludedPackaging,
    optionalPackagingOptions: optionalSelectableOptions,
    selectedOptionalPackagingRelationIds: selectedIds,
    selectedOptionalPackaging,
  };
};

export const buildPackagingDataFromProductOptions = (
  options: IProductPackagingOption[],
  selectedRelationIds?: string[],
): CartPackagingData | undefined =>
  buildPackagingDataFromCartOptions(options.map(mapProductPackagingOptionToCartOption), selectedRelationIds);

export const normalizePackagingData = (packaging?: CartPackagingData): CartPackagingData | undefined => {
  if (!packaging) return undefined;
  const requiredIncludedPackaging = packaging.requiredIncludedPackaging ?? [];
  const optionalPackagingOptions = packaging.optionalPackagingOptions ?? [];
  const selectedOptionalPackagingRelationIds = packaging.selectedOptionalPackagingRelationIds ?? [];
  const selectedOptionalPackaging =
    packaging.selectedOptionalPackaging ??
    optionalPackagingOptions.filter((option) => selectedOptionalPackagingRelationIds.includes(option.relationId));

  if (requiredIncludedPackaging.length === 0 && optionalPackagingOptions.length === 0 && selectedOptionalPackaging.length === 0) {
    return undefined;
  }

  return {
    requiredIncludedPackaging,
    optionalPackagingOptions,
    selectedOptionalPackagingRelationIds,
    selectedOptionalPackaging,
  };
};

export const buildCartItemWithPackagingSelection = (
  currentItem: CartViewItem,
  relationId: string,
  selected: boolean,
): CartViewItem | null => {
  const packaging = normalizePackagingData(currentItem.packaging);
  if (!packaging) return null;

  const selectedIds = new Set(packaging.selectedOptionalPackagingRelationIds ?? []);
  if (selected) {
    selectedIds.add(relationId);
  } else {
    selectedIds.delete(relationId);
  }

  const selectedOptionalPackaging = (packaging.optionalPackagingOptions ?? []).filter((option) => selectedIds.has(option.relationId));

  return {
    ...currentItem,
    selectedPackagingRelationIds: Array.from(selectedIds),
    packaging: {
      ...packaging,
      selectedOptionalPackagingRelationIds: Array.from(selectedIds),
      selectedOptionalPackaging,
    },
    gifts: [...(packaging.requiredIncludedPackaging ?? []), ...selectedOptionalPackaging].map((option) =>
      buildAttachedPackagingItem(option, currentItem.quantity),
    ),
  };
};

type CartQuantityLimitSource = Pick<CartViewItem, "quantity" | "maxQuantity" | "availabilityCode">;

export const isCartRecommendationOutOfStock = (product: Pick<CartRecommendationProduct, "stock" | "status">): boolean => {
  const stock = Number(product.stock ?? 0);
  return stock <= 0 || product.status === ProductStockStatus.OUT_OF_STOCK;
};

export const getCartAddLimitError = (
  existingItem?: CartQuantityLimitSource,
  addQuantity = 1,
  incomingItem?: Pick<CartViewItem, "maxQuantity" | "availabilityCode">,
) => {
  const currentQuantity = existingItem?.quantity ?? 0;
  const availabilityCode = existingItem?.availabilityCode ?? incomingItem?.availabilityCode;
  const isPreOrder = availabilityCode === ProductAvailabilityCode.PRE_ORDER;
  const rawMaxQuantity = existingItem?.maxQuantity ?? incomingItem?.maxQuantity;
  const maxQuantity = isPreOrder && (rawMaxQuantity === undefined || rawMaxQuantity === null || rawMaxQuantity <= 0) ? 999 : rawMaxQuantity;

  if (maxQuantity === undefined || maxQuantity === null) {
    return null;
  }

  if (maxQuantity <= 0) {
    return {
      toastMessage: "Sản phẩm này hiện đã hết hàng.",
    };
  }

  if (currentQuantity + addQuantity > maxQuantity) {
    return {
      toastMessage: `Bạn đã có tối đa ${currentQuantity} sản phẩm trong giỏ hàng. Không thể thêm số lượng đã chọn vào giỏ hàng vì sẽ vượt qua giới hạn mua hàng của bạn.`,
    };
  }

  return null;
};

export const getCartVariationMergeLimitError = (
  targetStock: number,
  targetExistingQuantity: number,
  incomingQuantity: number,
  options?: Pick<CartViewItem, "availabilityCode" | "maxQuantity">,
) => {
  const isPreOrder = options?.availabilityCode === ProductAvailabilityCode.PRE_ORDER;
  // Retail: targetStock is the live destination SKU ceiling (cart maxQuantity can be stale / from another variant).
  // Pre-order: stock is often 0 on BE — use cart maxQuantity instead.
  const rawMaxQuantity = isPreOrder ? (options?.maxQuantity ?? targetStock) : targetStock;
  // Pre-order thường stock = 0 trên BE; không dùng stock làm trần khi đổi variant.
  const maxQuantity =
    isPreOrder && (rawMaxQuantity === undefined || rawMaxQuantity === null || rawMaxQuantity <= 0) ? 999 : (rawMaxQuantity ?? 0);
  const currentQuantity = targetExistingQuantity ?? 0;
  const addQuantity = incomingQuantity ?? 0;

  if (maxQuantity <= 0 || currentQuantity + addQuantity > maxQuantity) {
    return {
      // popupMessage: "Số lượng bạn chọn đã đạt mức tối đa của sản phẩm này.",
      toastMessage: `Bạn đã có tối đa ${currentQuantity} sản phẩm trong giỏ hàng. Không thể đổi sang sản phẩm này vì sẽ vượt qua giới hạn mua hàng của bạn.`,
    };
  }

  return null;
};

export const mergeCartViewItemsByVariationId = (existing: CartViewItem[], additions: CartViewItem[]): CartViewItem[] => {
  const map = new Map(existing.map((item) => [String(item.id), { ...item }]));
  for (const add of additions) {
    const key = String(add.id);
    const prev = map.get(key);
    if (prev) {
      map.set(key, {
        ...prev,
        ...add,
        status: add.status ?? prev.status,
        maxQuantity: add.maxQuantity ?? prev.maxQuantity,
        quantity: prev.quantity + add.quantity,
        selected: prev.selected ?? add.selected ?? true,
      });
    } else {
      map.set(key, { ...add, selected: add.selected ?? true });
    }
  }
  return Array.from(map.values());
};

const resolveCartApiItemAttributeLabels = (attributes?: CartProductAttribute[], variationAttributes?: CartProductAttribute[]) => {
  const detailParts =
    attributes
      ?.filter((attr) => !isSizeVariantAttribute({ code: attr.attributeCode, name: attr.attributeName }))
      .map((attr) => attr.value?.trim())
      .filter(Boolean) ?? [];

  const sizeAttribute =
    attributes?.find((attr) => isSizeVariantAttribute({ code: attr.attributeCode, name: attr.attributeName })) ??
    variationAttributes?.find((attr) => isSizeVariantAttribute({ code: attr.attributeCode, name: attr.attributeName }));

  return {
    details: detailParts.length > 0 ? detailParts.join(", ") : "",
    sizeLabel: sizeAttribute?.value?.trim() ?? "",
  };
};

const isCartSetApiItem = (item: CartApiResponse[number]): item is CartSetApiItem => "setId" in item && "components" in item;

const mapCartSetApiItem = (item: CartSetApiItem): CartSetViewItem => {
  const setComponents = mapCartApiResponseToViewItems(item.components);
  const { sellingPriceAfterTaxMinor, compareAtPriceAfterTaxMinor } = item.customerDisplayPrice;
  const quantity = Math.max(1, Number(item.quantity) || 1);
  const maxQuantity = setComponents.reduce<number | undefined>((lowestStock, component) => {
    const componentStock = component.stock;
    if (componentStock === undefined || !Number.isFinite(componentStock)) return lowestStock;
    return lowestStock === undefined ? componentStock : Math.min(lowestStock, componentStock);
  }, undefined);
  const unavailableComponent = setComponents.find(
    (component) => component.isValid === false || component.disableSelection || component.disableQuantityControl,
  );
  const isOutOfStock = setComponents.some((component) => component.disableQuantityControl);
  const hasInvalidSet = item.isValid === false || setComponents.some((component) => component.disableSelection);

  return {
    id: item.lineId ?? item.setId,
    lineId: item.lineId ?? null,
    setId: item.setId,
    setComponents,
    isSet: true,
    productId: item.setId,
    productSlug: item.slug ?? "",
    image: { src: item.image ?? "", alt: item.name },
    name: item.name,
    quantity,
    minQuantity: 1,
    maxQuantity,
    stockStatus: isOutOfStock ? ProductStockStatus.OUT_OF_STOCK : ProductStockStatus.IN_STOCK,
    disableQuantityControl: false,
    disableSelection: hasInvalidSet && !isOutOfStock,
    status: unavailableComponent?.status,
    isValid: item.isValid,
    reason: unavailableComponent?.reason ?? null,
    price: {
      current: formatCurrency(sellingPriceAfterTaxMinor),
      original: compareAtPriceAfterTaxMinor == null ? undefined : formatCurrency(compareAtPriceAfterTaxMinor),
      discountLabel:
        item.customerDisplayPrice.hasDiscount && item.customerDisplayPrice.discountPercent != null
          ? `-${item.customerDisplayPrice.discountPercent}%`
          : undefined,
      discountPercent:
        item.customerDisplayPrice.hasDiscount && item.customerDisplayPrice.discountPercent != null
          ? item.customerDisplayPrice.discountPercent
          : undefined,
      hasDiscount: item.customerDisplayPrice.hasDiscount,
      showDiscountPercent: true,
    },
    unitPrice: sellingPriceAfterTaxMinor,
    customerDisplayPrice: item.customerDisplayPrice,
    utmData: setComponents[0]?.utmData ?? null,
  };
};

export const isCartSetViewItem = (item: CartViewItem): item is CartSetViewItem => Boolean(item.setId && item.isSet);

export const mapCartApiResponseToViewItems = (response: CartApiResponse): CartViewItem[] => {
  if (!response?.length) return [];

  return response.map((item) => {
    if (isCartSetApiItem(item)) return mapCartSetApiItem(item);
    const variation = item.variation;
    const product = item.product;
    const medias = item?.media;

    // Primary giá trị từ payload mới (item), fallback sang variation cũ lường trước trường hợp APi thay đổi nào chốt thì sửa tiếp
    const customerDisplayPrice = resolveCartCustomerDisplayPrice(item, variation);
    const safeQty = item.quantity ?? 1;
    // Ưu tiên giá trị tồn kho từ availableStock/variation nếu item.stock bị 0/null/undefined (tránh lỗi 0 ?? 39 = 0)
    const safeStock = item.availableStock ?? item.stock ?? variation?.stock ?? 0;
    const stockStatus = item.stockStatus ?? variation?.stockStatus ?? variation?.status ?? "INACTIVE";
    const availabilityCode = item.availabilityCode;
    const isPreOrder = availabilityCode === ProductAvailabilityCode.PRE_ORDER;
    const isDiscontinued =
      product?.status === ProductLifecycleStatus.DISCONTINUED || availabilityCode === ProductAvailabilityCode.DISCONTINUED;
    const isInvalidOutOfStock = isCartItemInvalidOutOfStock(item);
    const isPackagingOnlyInvalid = item.isValid === false && isPackagingOnlyInvalidReason(item.reason);
    const isOutOfStock =
      !isPreOrder && !isPackagingOnlyInvalid && (isInvalidOutOfStock || stockStatus === "OUT_OF_STOCK" || safeStock <= 0);
    const isInsufficientStock =
      !isPreOrder &&
      !isPackagingOnlyInvalid &&
      !isDiscontinued &&
      !isOutOfStock &&
      (item.reason === CART_ITEM_INVALID_REASON.INSUFFICIENT_STOCK || (safeStock > 0 && safeQty > safeStock));

    const price: CartItemPrice = {
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
      showDiscountPercent: item.pricePresentation?.showDiscountPercent,
    };

    const { details: attributesLabel, sizeLabel } = resolveCartApiItemAttributeLabels(item.attributes, variation?.attributes);
    const packaging = normalizePackagingData(item.packaging);
    const attachedPackagingItems = [...(packaging?.requiredIncludedPackaging ?? []), ...(packaging?.selectedOptionalPackaging ?? [])].map(
      (option) => buildAttachedPackagingItem(option, safeQty),
    );

    return {
      id: item.id ?? item.variationId ?? "",
      variationId: item.variationId ?? item.id,
      // set term
      isKey: item.isKey === true,
      setItemId: item.setItemId,
      productId: item.productId ? String(item.productId) : product?.id ? String(product.id) : undefined,
      categoryName: product?.categoryName ?? "",
      image: {
        src: medias?.[0]?.url ?? "",
        alt: product?.name ?? "",
      },
      name: product?.name ?? "",
      details: attributesLabel,
      quantity: safeQty,
      stock: safeStock,
      minQuantity: 1,
      maxQuantity: isDiscontinued ? 0 : isPreOrder ? Math.max(safeStock, 999) : safeStock,
      disableQuantityControl: isDiscontinued || isOutOfStock,
      // Pre-order can be isValid=false + OUT_OF_STOCK from BE (stock 0) but must stay selectable.
      disableSelection:
        isDiscontinued || (!isPreOrder && !isPackagingOnlyInvalid && ((item.isValid === false && !isOutOfStock) || isInsufficientStock)),
      price,
      stockStatus,
      availabilityCode,
      status:
        mapAvailabilityDisplayToCartItemStatus(availabilityCode, item.availabilityDisplay, resolveCartExpectedStockAt(item)) ??
        resolveLegacyCartItemStatus({ isDiscontinued, isOutOfStock, isInsufficientStock, availableStock: safeStock }),
      selected: false,
      isValid: item.isValid ?? true,
      reason: item.reason ?? null,
      customerDisplayPrice,
      unitPrice: customerDisplayPrice.sellingPriceAfterTaxMinor,
      originalUnitPrice: customerDisplayPrice.compareAtPriceAfterTaxMinor ?? undefined,
      unitPromotionDiscount: item.unitPromotionDiscountMinor ?? 0,
      lineItemDiscountAmount: item.lineItemDiscountAmountMinor,
      lineSellingSubtotalMinor: item.lineSellingSubtotalMinor,
      lineDisplaySubtotalMinor: item.lineDisplaySubtotalMinor,
      promotionWarnings: item.promotionWarnings,
      pricingWarning: item.pricingWarning ?? null,
      selectedPackagingRelationIds: packaging?.selectedOptionalPackagingRelationIds ?? [],
      productSlug: product?.slug ?? item.slug ?? "",
      sizeLabel: sizeLabel,
      packaging,
      gifts: attachedPackagingItems,
      utmData: item.utm_data ?? null,
    };
  });
};
