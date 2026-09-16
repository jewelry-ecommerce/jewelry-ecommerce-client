import type { OrderDetailLineAttribute, ShippingAddress } from "../order/order.interface";
import type { UtmData } from "@/utils/utm/utm.interface";
import type { CustomerDisplayPrice } from "@/utils/customer-display-price.util";

export type { ShippingAddress } from "../order/order.interface";

export enum CheckoutRequestLineType {
  SET = "SET",
  LOOSE = "LOOSE",
}

export enum AddressStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  DELETED = "Deleted",
}

export interface Province {
  id: string;
  code: number;
  name: string;
  codename: string;
  divisionType: string;
  phoneCode: number;
}

export interface Ward {
  id: string;
  code: number;
  name: string;
  codename: string;
  divisionType: string;
  shortCodename: string;
  provinceCode: number;
}

export interface Address {
  id: string;
  lastName: string;
  firstName: string;
  receiverPhone: string;
  receiverEmail?: string | null;
  addressLine: string;
  wardCode: number;
  wardName: string;
  provinceCode: number;
  provinceName: string;
  isDefault?: boolean;
}

export interface AddressListResponse {
  total: number;
  list: Address[];
}

export interface VatInvoice {
  companyName: string;
  companyAddress: string;
  taxCode: string;
  email: string;
}

export interface Gift {
  id: string;
  name: string;
  image: string;
  quantityLabel: string | number;
  subInfo?: string;
  price?: {
    current: number;
    original: number;
  };
}

export interface CheckoutSessionItem {
  type?: CheckoutRequestLineType.LOOSE;
  id?: string;
  variationId: string;
  productId: string;
  categoryName?: string | null;
  productName: string;
  variationName: string;
  skuCode: string;
  image: string;
  unitPrice: string | number;
  salePrice: string | number;
  customerDisplayPrice?: CustomerDisplayPrice;
  categoryIds?: string[];
  collectionIds?: string[];
  quantity: number;
  lineTotal: string | number;
  discountAmount: string | number;
  finalAmount: string | number;
  appliedQuantity?: number | null;
  regularQuantity?: number | null;
  quotaExceededQuantity?: number | null;
  promotionUnitPriceMinor?: string | number | null;
  regularUnitPriceMinor?: string | number | null;
  quotaPolicyId?: string | null;
  quotaPolicyType?: string | null;
  quotaRemainingBefore?: number | null;
  quotaRemainingAfter?: number | null;
  hasExistingPromotion?: boolean;
  hasExistingDiscount?: boolean;
  attributes?: OrderDetailLineAttribute[];
  lineType?: string;
  pricingMode?: string;
  parentCheckoutItemId?: string | null;
  packagingRelationId?: string | null;
  sourceVariationId?: string | null;
  isKey?: boolean;
  weightGram?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  packaging?: CheckoutSessionItem[];
}

export interface CheckoutSessionSetItem {
  type: CheckoutRequestLineType.SET;
  lineId: string;
  setId: string;
  code?: string;
  name?: string;
  slug?: string | null;
  image?: string | null;
  status?: string | null;
  quantity: number;
  subtotalMinor?: string | number;
  compareAtSubtotalMinor?: string | number | null;
  components: CheckoutSessionItem[];
}

export type CheckoutSessionLine = CheckoutSessionItem | CheckoutSessionSetItem;

export interface CheckoutSessionPricing {
  subtotal: string | number;
  shippingFee: string | number;
  declaredValueFee?: string | number;
  discountTotal: string | number;
  taxTotal: string | number;
  grandTotal: string | number;
  linePromotionSpend?: string | number;
  cartPromotionSpend?: string | number;
  totalPromotionSpend?: string | number;
}

/** Banner ETA pre-order (BE tính max ngày có hàng). FE chỉ render label + value. */
export interface CheckoutFulfillmentSummary {
  label: string;
  value: string;
}

export interface CheckoutSession {
  checkoutSessionId?: string;
  status?: string;
  orderCode?: string;
  contactEmail?: string;
  subscribeToNewsletter?: boolean;
  shippingAddress?: ShippingAddress;
  vatInvoice?: VatInvoice;
  note?: string;
  paymentMethod?: string;
  couponCodes?: string[];
  consentThirdPartySharing: boolean;
  /** Pre-order lần 1 — chia sẻ thông tin với đối tác BST Collab (Đất Việt VAC). */
  consentCollabPartnerSharing?: boolean;
  totalAmount: number;
  expiresAt?: string;
  shippingMethod?: string;
  items?: CheckoutSessionLine[];
  pricing?: CheckoutSessionPricing;
  fulfillmentSummary?: CheckoutFulfillmentSummary;
  /**
   * AC1 pre-order reserve checkout (lần 1).
   * `PRE_ORDER` + `paymentRequired === false` → ẩn PTTT, không gửi paymentMethod.
   * Lần 2: cùng `/thanh-toan` với session `paymentRequired === true` (từ pre-order checkout API).
   */
  checkoutType?: "RETAIL" | "PRE_ORDER" | string;
  paymentRequired?: boolean;
}

export interface CheckoutLooseInitiateLine {
  type: CheckoutRequestLineType.LOOSE;
  variationId: string;
  quantity: number;
  selectedPackagingRelationIds?: string[];
  utm_data?: UtmData | null;
}

export interface CheckoutSetInitiateLine {
  type: CheckoutRequestLineType.SET;
  lineId: string;
  setId: string;
  quantity: number;
  components: Array<{
    variationId: string;
    utm_data?: UtmData | null;
  }>;
}

export type CheckoutInitiateLine = CheckoutLooseInitiateLine | CheckoutSetInitiateLine;

export interface InitiateCheckoutPayload {
  items?: CheckoutInitiateLine[];
  /**
   * Pre-order lần 2: tạo phiên `/thanh-toan` từ đơn đặt trước hiện có
   * (thay vì gửi `items` từ cart như đơn thường).
   */
  orderCode?: string;
}

export interface UpdatePricingContextPayload {
  couponCodes?: string[];
  paymentMethod?: string;
  shippingFee?: number;
  shippingCarrier?: string;
  carrierServiceId?: number;
  segmentIds?: string[];
  acceptPriceChanges?: boolean;
}

export interface UpdateShippingAddressPayload {
  addressId?: string;
  shippingAddress?: ShippingAddress;
  acceptPriceChanges?: boolean;
}

export interface CheckoutPriceChangeTotals {
  subtotalAfterLinePromotionMinor?: number;
  cartPromotionDiscountMinor?: number;
  finalShippingFeeMinor?: number;
  taxAndFeeMinor?: number;
  amountPayableMinor?: number;
}

export interface CheckoutPriceChangedItem {
  variationId?: string;
  productName?: string;
  variationName?: string;
  previousFinalAmountMinor?: number;
  currentFinalAmountMinor?: number;
}

export interface CheckoutPriceChangeAction {
  id: string;
  action_type: string;
  action_target?: string;
  cta_text: string;
  cta_bg?: string;
  cta_color?: string;
  cta_variant?: string;
  cta_border_color?: string;
  action_payload?: {
    request_patch?: {
      acceptPriceChanges?: boolean;
    };
  };
}

export interface CheckoutPriceChangePopup {
  title?: string;
  text?: string;
  actions_layout?: string;
  actions?: CheckoutPriceChangeAction[];
}

export interface CheckoutPriceChangeDetails {
  priceChangedItems?: CheckoutPriceChangedItem[];
  previousTotals?: CheckoutPriceChangeTotals;
  currentTotals?: CheckoutPriceChangeTotals;
  popup?: CheckoutPriceChangePopup;
}

export interface PlaceOrderPayload {
  /** Omit on pre-order lần 1 (`paymentRequired === false`). */
  paymentMethod?: string;
  consent: boolean;
  /** Pre-order lần 1 only — optional share with Đất Việt VAC for BST Collab. */
  consentCollabPartnerSharing?: boolean;
  /** Omit on pre-order lần 1 — no Payoo redirect. */
  returnUrl?: string;
  /**
   * Pre-order lần 1 only — URL chi tiết cho ZNS/email (`/don-hang/dat-truoc`).
   * Không kèm orderCode; BE gắn `#access=<token>`.
   */
  detailUrlTemplate?: string;
  note?: string;
  /** Pre-order lần 1 only — email khách nhập trên form giao hàng. */
  email?: string;
  contactEmail?: string;
  subscribeToNewsletter?: boolean;
  vatInvoice?: VatInvoice;
  recaptchaToken?: string;
  shippingMethod?: string;
  shippingFee?: number;
  shippingCarrier?: string;
  carrierServiceId?: number;
  acceptPriceChanges?: boolean;
  isAllowCheck?: boolean;
  estimatedDeliveryAt?: string;
  pickupAddress?: {
    warehouseId?: string;
    warehouseName?: string;
    addressLine?: string;
    provinceCode?: number;
    provinceName?: string;
    phone?: string;
    wardCode?: number;
    wardName?: string;
  };
}

export interface LocationApiResponse<T> {
  list: T[];
}

export interface PlaceOrderResponse {
  orderId?: string;
  orderCode?: string;
  status?: string;
  paymentMethod?: string;
  paymentUrl?: string;
  guestOrderAccess?: {
    token: string;
    expiresAt: string;
  };
}

export interface PayooRedirectParams {
  order_no: string;
  status: string;
  checksum: string;
  token?: string;
  errorcode?: string;
  errormsg?: string;
  paymentFee?: string;
  totalAmount?: string;
  [key: string]: string | undefined;
}

export interface VerifyPaymentRedirectResponse {
  checksumVerified?: boolean;
  orderCode?: string;
}

export type {
  OrderDetailLineAttribute,
  OrderDetailItem,
  OrderDetailResponse,
  OrderListItem,
  OrderListResponse,
  OrderListSummary,
  OrderLookupRequest,
  OrderShippingAddressSnapshot,
  GuestOrderDetailResponse,
  OrderStatusByOrderCodeResponse,
  OrderStatusHistoryItem,
  OrderVatInvoice,
  GetOrdersMeParams,
  GetOrderDetailParams,
  NearestWarehouseRequest,
  NearestWarehouseResponse,
  OrderShippingLeadtimeRequest,
  IOrderShippingServiceItem,
  GhnFeeCalculateRequest,
  IGhnFeeCalculateResponse,
  StoreNearestItem,
  StoreNearestPayload,
  StoreNearestResponse,
  GetShippingFeePayload,
  ShippingFeeItem,
  ShippingFeePayload,
  ShippingFeeResponse,
} from "../order/order.interface";
