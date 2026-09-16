import { CartItemType } from "./cart.enum";
import type { AttributeDisplayType } from "@/utils/constants/attribute-display-type.enum";
import type { UtmData } from "@/utils/utm/utm.interface";
import type { CustomerDisplayPrice, PricePresentation } from "@/utils/customer-display-price.util";

export type { UtmData };

export type CartItemStatusTone = "success" | "warning" | "error" | "neutral";

export type CartItemStatusNote = {
  label: string;
  value: string;
};

export type CartAvailabilityDisplayBadge = {
  text: string;
  textColor: string;
  backgroundColor: string;
};

export type CartAvailabilityDisplay = {
  badge: CartAvailabilityDisplayBadge;
  notes?: CartItemStatusNote[];
  /** ISO expected stock — ưu tiên hơn notes.value khi format giờ VN */
  expectedStockAt?: string | null;
};

export type CartPreOrderInfo = {
  campaignId?: string | null;
  expectedStockAt?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  maxPurchaseQty?: number | null;
  paymentTimeoutHours?: number | null;
};

export type CartItemStatus = {
  label: string;
  tone: CartItemStatusTone;
  helperText?: string;
  textColor?: string;
  backgroundColor?: string;
  notes?: CartItemStatusNote[];
};

export type CartItemImage = {
  src: string;
  alt: string;
};

export type CartItemPrice = {
  current: string;
  original?: string;
  discountLabel?: string;
  discountPercent?: number;
  hasDiscount?: boolean;
  showDiscountPercent?: boolean;
};

export type PromotionSnapshot = Record<string, unknown> | null;

export type CartAttachedItem = {
  id: string | number;
  badge?: string;
  image: CartItemImage;
  name: string;
  subInfo?: string;
  quantityLabel: string;
  price: CartItemPrice;
  actionLabel?: string;
  size?: string;
  onActionClick?: () => void;
};

export type CartPackagingOption = {
  relationId: string;
  quantity: number;
  includedPriceAfterTax?: number | string | null;
  isRequired: boolean;
  isDefault?: boolean;
  canCustomerChoose?: boolean;
  isVisibleOnProduct?: boolean;
  sortOrder?: number;
  name?: string;
  skuCode?: string;
  image?: string | null;
  packaging?: {
    variationId: string;
    productId?: string;
    name: string;
    skuCode?: string;
    image?: string | null;
    basePriceAfterTax?: number | string | null;
    includedPriceAfterTax?: number | string | null;
    isVisible?: boolean | null;
    canBeSold?: boolean | null;
    packagingType?: string | null;
    status?: string | null;
  };
};

export type CartPackagingData = {
  requiredIncludedPackaging: CartPackagingOption[];
  optionalPackagingOptions: CartPackagingOption[];
  selectedOptionalPackagingRelationIds?: string[];
  selectedOptionalPackaging?: CartPackagingOption[];
};

export type CartItemData = {
  productSlug: string;
  id: string;
  // set term
  isKey?: boolean;
  /** Mã sản phẩm (wishlist, API) — khác variation `id` */
  productId?: string;
  categoryName?: string;
  image: CartItemImage;
  name: string;
  details?: string;
  sizeLabel?: string;
  /** Machine code: IN_STOCK | OUT_OF_STOCK | PRE_ORDER | DISCONTINUED */
  availabilityCode?: string;
  status?: CartItemStatus;
  isValid?: boolean;
  reason?: string | null;
  quantity: number;
  stock?: number;
  minQuantity?: number;
  maxQuantity?: number;
  disableQuantityControl?: boolean;
  disableSelection?: boolean;
  price: CartItemPrice;
  stockStatus?: string;
  customerDisplayPrice?: CustomerDisplayPrice;
  gifts?: CartAttachedItem[];
  packaging?: CartPackagingData;
  packagingOptions?: CartPackagingOption[];
  editLabel?: React.ReactNode;
  wishlistLabel?: React.ReactNode;
  variationId?: string;
  /** Identity của component trong Product Set, khác variationId/SKU. */
  setItemId?: string;
  onQuantityChange?: (id: CartItemData["id"], nextQuantity: number) => void;
  onPackagingSelectionChange?: (id: CartItemData["id"], relationId: string, selected: boolean) => void;
  onRemove?: (id: CartItemData["id"]) => void;
  onEdit?: (productSlug: CartItemData["productSlug"], variationId: CartItemData["variationId"]) => void;
  onAddToWishlist?: () => void;
  onclose?: () => void;
  /** Real promotion discount amount for this line (minor units), 0 when no discount */
  lineItemDiscountAmount?: number;
  pricingWarning?: string | null;
  promotionWarnings?: string[];
};

export type CartViewItem = Omit<CartItemData, "onQuantityChange" | "onRemove" | "onEdit" | "onAddToWishlist"> & {
  selected?: boolean;
  unitPrice: number;
  originalUnitPrice?: number;
  unitPromotionDiscount?: number;
  lineSellingSubtotalMinor?: number;
  lineDisplaySubtotalMinor?: number;
  selectedPackagingRelationIds?: string[];
  utmData?: UtmData | null;
  // set term
  setId?: string;
  setComponents?: CartViewItem[];
  isSet?: boolean;
};

// ============ API Response Types ============
export type CartProductAttribute = {
  attributeId: string;
  attributeName: string;
  attributeCode: string;
  value: string;
  valueCode: string;
};

export type CartProductVariation = {
  id: string;
  name: string;
  skuCode: string;
  slug: string;
  compareAtPriceAfterTaxMinor: number;
  sellingPriceAfterTaxMinor: number;
  customerDisplayPrice?: CustomerDisplayPrice;
  stock: number;
  availableStock?: number;
  status: string;
  image: string;
  attributes: CartProductAttribute[];
  stockStatus: string;
  preOrder?: CartPreOrderInfo | null;
  expectedStockAt?: string | null;
};

export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  image: string;
  imageHover: string;
  status: string;
  categoryId: string;
  categoryName: string;
  brandName: string;
};
export type GiftItem = {
  id: string;
  image: string;
  name: string;
  compareAtPriceAfterTaxMinor: number;
  quantity: number;
  sellingPriceAfterTaxMinor: number;
  attributes: CartProductAttribute[];
};
export type CartMediaItem = {
  url: string;
  sortOrder: number;
};

export type CartApiItem = {
  id: string;
  found: boolean;
  // set term
  isKey?: boolean;
  setItemId?: string;
  isValid?: boolean;
  reason?: string | null;
  name: string;
  slug: string;
  skuCode: string;
  status: string;
  productId: string;
  compareAtPriceAfterTaxMinor: number;
  sellingPriceAfterTaxMinor: number;
  customerDisplayPrice?: CustomerDisplayPrice;
  displayPriceAfterTaxMinor?: number;
  discountedSellingPriceAfterTaxMinor?: number | null;
  unitPromotionDiscountMinor?: number;
  lineSellingSubtotalMinor?: number;
  lineDisplaySubtotalMinor?: number;
  lineItemDiscountAmountMinor?: number;
  promotion?: PromotionSnapshot;
  promotionWarnings?: string[];
  pricingWarning?: string | null;
  stock: number;
  availableStock?: number;
  stockStatus: string;
  availabilityCode?: string;
  availabilityDisplay?: CartAvailabilityDisplay;
  /** ISO — ưu tiên khi format "Thời gian mở bán dự kiến" theo giờ VN */
  expectedStockAt?: string | null;
  preOrder?: CartPreOrderInfo | null;
  product: CartProduct;
  variation?: CartProductVariation;
  variationId?: string;
  media?: CartMediaItem[];
  attributes?: CartProductAttribute[];
  quantity: number;
  gifts?: GiftItem[];
  packaging?: CartPackagingData;
  utm_data?: UtmData | null;
  pricePresentation?: PricePresentation;
};

// set term
export type CartSetApiItem = {
  lineId?: string | null;
  setId: string;
  code: string;
  name: string;
  slug?: string | null;
  image?: string | null;
  status?: string | null;
  quantity: number;
  subtotalMinor: number;
  customerDisplayPrice: CustomerDisplayPrice;
  isValid: boolean;
  components: CartApiItem[];
};

export type CartSummary = {
  subTotal: number;
  discountTotal: number;
  shippingFee: number;
  totalAmount: number;
  rewardPoints: number;
  appliedPromotions: unknown[];
};

export type CartApiResponse = Array<CartApiItem | CartSetApiItem>;

export type CartApiResponseUpdate = {
  success: boolean;
  item: CartApiItem;
  reason?: string;
};

export type ParamUpdateCartItem = {
  variationId: string;
  quantity: number;
  selectedPackagingRelationIds?: string[];
};

export type CartSetComponentPayload = {
  setItemId?: string;
  variationId: string;
};

export type PostCartLinePayload = {
  variationId?: string;
  setId?: string;
  setComponents?: CartSetComponentPayload[];
  quantity: number;
  selectedPackagingRelationIds?: string[];
  utm_data?: UtmData | null;
};

// set term
export type CartSetViewItem = CartViewItem & {
  lineId: string | null;
  setId: string;
  setComponents: CartViewItem[];
  isSet: true;
};

export type ParamPostCartItem = {
  clearAll?: boolean;
  items: PostCartLinePayload[];
};

export type CartApiResponsePost = {
  guestId?: string;
  success: boolean;
  items: CartApiItem[];
  reason?: string;
  message?: string;
};

export type CartCalculateTotalProductItem = {
  variationId: string;
  quantity: number;
  selectedPackagingRelationIds?: string[];
};

// set term
export type CartCalculateTotalSetItem = {
  setId: string;
  quantity: number;
  setComponents: CartSetComponentPayload[];
  selectedPackagingRelationIds?: string[];
};

export type CartCalculateTotalItem = CartCalculateTotalProductItem | CartCalculateTotalSetItem;

export type ParamCalculateTotal = {
  items: CartCalculateTotalItem[];
};

export type CartCalculateTotalResponse = {
  subTotal: number;
  discountTotal: number;
  discounts: { label: string; value: number }[];
  shippingFee: number;
  totalAmount: number;
  rewardPoints: number;
};

export type ParamRemoveCartItem = {
  type: CartItemType;
  variationId?: string;
};

export interface ProductAttribute {
  id: string;
  value: string;
  image: string | null;
  displayType: AttributeDisplayType | string;
  name: string;
  code: string;
}

export type CartRecommendationProduct = {
  id: string;
  slug?: string;
  compareAtPriceAfterTaxMinor: string;
  sellingPriceAfterTaxMinor: string;
  customerDisplayPrice?: CustomerDisplayPrice;
  name: string;
  productId: string;
  stock: number;
  status: string;
  size?: string;
  product: {
    id: string;
    name: string;
    image: string;
  };
  attributes: ProductAttribute[];
};

export type CartRecommendationPagination = {
  total: number;
  currentPage: number;
  nextPage: number | false;
  previousPage: number | false;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPage: number;
};

export type CartRecommendationResponse = {
  total: number;
  list: CartRecommendationProduct[];
  pagination: CartRecommendationPagination;
};

export type CartRecommendationParams = {
  page?: number;
  take?: number;
};
