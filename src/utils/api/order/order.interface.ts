import type {
  ErrorType,
  OrderCancellationReason,
  OrderChangedByType,
  OrderReturnReason,
  OrderReturnStatus,
  OrderReturnTimelineStatus,
  OrderReturnType,
  OrderSource,
  OrderStatus,
  OrderHistoryFilterStatus,
  PaymentMethod,
  PaymentStatus,
  ShippingMethod,
} from "./order.enum";
import type { CustomerDisplayPrice } from "@/utils/customer-display-price.util";

export interface ShippingAddress {
  /** Họ và tên đầy đủ. Không gửi lastName lên BE. */
  firstName: string;
  receiverPhone: string;
  provinceCode: number;
  provinceName: string;
  wardCode: number;
  wardName: string;
  addressLine: string;
  /** Response/legacy only — không đưa vào request payload. */
  lastName?: string | null;
}

export interface OrderShippingAddressSnapshot {
  id?: string;
  lastName: string;
  wardCode: number | null;
  wardName: string;
  firstName: string;
  addressLine: string;
  provinceCode: number | null;
  provinceName: string;
  receiverPhone: string;
}

export interface OrderListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  orderCode: string;
  status: OrderStatus;
  orderReturnCode?: string | null;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentFailedAt?: string | null;
  paymentLink?: string | null;
  paymentLinkExpiresAt?: string | null;
  paymentLinkStatus?: string | null;
  deliveredAt?: string | null;
  completedAt?: string | null;
  /** Pre-order list fields (AC1). */
  fulfillmentType?: "RETAIL" | "PRE_ORDER" | null;
  preOrderStatus?: string | null;
  /** Mã PO hiển thị trên tab Đặt trước (vd. PO_SEVARETAILB1_…). */
  preOrderCode?: string | null;
  fulfillmentSummary?: { label: string; value: string } | null;
  paymentHoldExpiresAt?: string | null;
  shippingAddressSnapshot: OrderShippingAddressSnapshot;
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  grandTotal: string;
  errorLog: Partial<Record<ErrorType, string>> | null;
  items: {
    id: string;
    orderId: string;
    variationId: string;
    variationName: string;
    categoryName?: string | null;
    productName: string;
    skuCode: string;
    image: string;
    quantity: number;
    unitPrice: string;
    salePrice: string;
    customerDisplayPrice?: CustomerDisplayPrice;
    lineType?: string;
    parentOrderItemId?: string | null;
    packagingRelationId?: string | null;
    setLineId?: string | null;
    setId?: string | null;
    setSpuId?: string | null;
  }[];
  lines?: OrderLine[];
}

export interface OrderListSummary {
  ALL: number;
  [key: string]: number;
}

export interface OrderListResponse {
  total: number;
  list: OrderListItem[];
  summary: OrderListSummary;
}

export interface GetOrdersMeParams {
  orderType?: "ASC" | "DESC";
  orderBy?: string;
  page?: number;
  take?: number;
  search?: string;
  status?: OrderHistoryFilterStatus;
  /** Filter by fulfillment type — used by "Đặt Trước" history tab. */
  fulfillmentType?: "RETAIL" | "PRE_ORDER";
}

export interface OrderDetailLineAttribute {
  variationId?: string;
  attributeCode?: string;
  attributeName?: string;
  displayType?: string;
  value?: string;
  image?: string | null;
  code?: string;
}

export interface OrderDetailItem {
  id: string;
  variationId: string;
  productId: string;
  categoryName?: string | null;
  productName: string;
  variationName: string;
  skuCode: string;
  image: string;
  unitPrice: string;
  salePrice: string;
  customerDisplayPrice?: CustomerDisplayPrice;
  quantity: number;
  lineTotal: string;
  discountAmount: string;
  finalAmount: string;
  productSlug?: string;
  stock?: number;
  attributes?: OrderDetailLineAttribute[];
  lineType?: string;
  parentOrderItemId?: string | null;
  packagingRelationId?: string | null;
  setLineId?: string | null;
  setId?: string | null;
  setSpuId?: string | null;
  isKey?: boolean;
}

export type OrderSetLineComponent = Omit<OrderDetailItem, "id"> & { id?: string };

export interface OrderSetLine {
  type: "SET";
  lineId: string;
  setLineId: string;
  setId: string;
  setSpuId?: string | null;
  code?: string | null;
  name: string;
  slug?: string | null;
  image?: string | null;
  status?: string | null;
  quantity: number;
  subtotalMinor: string | number;
  originalSubtotalMinor?: string | number | null;
  discountMinor?: string | number | null;
  customerDisplayPrice: CustomerDisplayPrice;
  components: OrderSetLineComponent[];
}

export interface OrderItemLine {
  type: "ITEM";
  id: string;
}

export type OrderLine = OrderItemLine | OrderSetLine;

export interface OrderStatusHistoryItem {
  id?: string;
  audience?: string | null;
  fromStatus?: OrderStatus | string | null;
  toStatus: OrderStatus | string;
  title?: string | null;
  subtitle?: string | null;
  trackingStatus?: string | null;
  changedById: string | null;
  changedByType: OrderChangedByType | null;
  note: string;
  createdAt: string;
}

export interface OrderVatInvoice {
  email: string;
  taxCode: string;
  companyName: string;
  companyAddress: string;
}

export interface OrderLookupRequest {
  phone: string;
  orderCode?: string;
  otp?: string;
}

export interface GetOrderDetailParams {
  includePackaging?: boolean;
}

export interface OrderDetailResponse {
  id: string;
  createdAt: string;
  orderCode: string;
  customerId: string;
  contactEmail?: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentFailedAt?: string | null;
  paymentLink?: string | null;
  paymentLinkExpiresAt?: string | null;
  paymentLinkStatus?: string | null;
  deliveredAt?: string | null;
  completedAt?: string | null;
  source: OrderSource;
  shippingMethod: ShippingMethod;
  shippingAddressSnapshot: OrderShippingAddressSnapshot;
  shippingFee: string;
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  grandTotal: string;
  note: string;
  notePayment: string | null;
  errorLog: Partial<Record<ErrorType, string>> | null;
  /** Đồng kiểm/check hàng đã được xác nhận khi tạo đơn. */
  isAllowCheck?: boolean;
  items: OrderDetailItem[];
  lines?: OrderLine[];
  statusHistory: OrderStatusHistoryItem[];
  vatInvoice?: OrderVatInvoice | null;
  paymentRetryCount?: number | null;
  maxPaymentRetries?: number | null;
  displayState?: string | null;
  /** Order-hold deadline (ISO) — countdown khi chưa có / hết payment link active. */
  orderExpiresAt?: string | null;
  orderRemainingSeconds?: number | null;
  orderReturnCode?: string | null;
  /** Pre-order: RETAIL | PRE_ORDER. When PRE_ORDER, use preOrderStatus for UI. */
  fulfillmentType?: "RETAIL" | "PRE_ORDER" | null;
  /** OMS pre-order status (BR-01). */
  preOrderStatus?: string | null;
  /** Mã PO (hiển thị); `orderCode` vẫn dùng cho API/route. */
  preOrderCode?: string | null;
  /** Session-level ETA banner, same shape as checkout. */
  fulfillmentSummary?: { label: string; value: string } | null;
  /** 48h payment hold end (ISO) when preOrderStatus = AwaitingPayment. */
  paymentHoldExpiresAt?: string | null;
}

export type GuestOrderDetailResponse = Omit<
  OrderDetailResponse,
  | "id"
  | "customerId"
  | "contactEmail"
  | "paymentLink"
  | "paymentLinkExpiresAt"
  | "paymentLinkStatus"
  | "errorLog"
  | "paymentRetryCount"
  | "maxPaymentRetries"
  | "displayState"
  | "orderReturnCode"
  | "source"
  | "shippingAddressSnapshot"
  | "items"
  | "statusHistory"
> & {
  id?: never;
  customerId?: never;
  accessExpiresAt: string;
  shippingAddressSnapshot: OrderShippingAddressSnapshot | null;
  items: Array<Omit<OrderDetailItem, "id" | "productSlug" | "stock">>;
  statusHistory: Array<
    Pick<OrderStatusHistoryItem, "fromStatus" | "toStatus" | "title" | "subtitle" | "trackingStatus" | "note" | "createdAt">
  >;
  shippingCarrier?: string | null;
  trackingCode?: string | null;
  estimatedDeliveryAt?: string | null;
  /** Guest access vẫn có thể trả payment link Payoo để FE đếm ngược / mở lại thanh toán. */
  paymentLink?: string | null;
  paymentLinkStatus?: string | null;
  /** Timing countdown — chỉ dùng khi BE trả; FE không invent duration. */
  paymentLinkExpiresAt?: string | null;
  orderExpiresAt?: string | null;
  orderRemainingSeconds?: number | null;
  paymentRetryCount?: number | null;
  maxPaymentRetries?: number | null;
  displayState?: string | null;
};

export interface OrderStatusByOrderCodeResponse {
  orderCode: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  grandTotal: string;
  orderExpiresAt: string | null;
  orderRemainingSeconds: number | null;
  paymentLink: string | null;
  paymentLinkExpiresAt: string | null;
  paymentLinkStatus: string | null;
  paymentRetryCount?: number | null;
  maxPaymentRetries?: number | null;
  displayState: string;
}

export interface NearestWarehouseRequestItem {
  variationId: string;
  sku: string;
  quantity: number;
}

export interface NearestWarehouseRequest {
  items: NearestWarehouseRequestItem[];
  shippingAddress: {
    phone?: string;
    wardCode: number;
    wardName: string;
    addressLine: string;
    provinceCode: number;
    provinceName: string;
  };
}

export interface NearestWarehouseResponse {
  phone: string;
  wardCode: number;
  wardName: string;
  addressLine: string;
  warehouseId: string;
  provinceCode: number;
  provinceName: string;
  warehouseName: string;
}

export interface OrderShippingLeadtimeRequest {
  shopId?: number;
  fromWardIdV2?: number;
  fromAddressV2?: string;
  toWardIdV2?: number;
  toAddressV2?: string;
  totalWeightGrams: number;
  fromDistrictId?: number;
  fromWardCode?: string;
  toDistrictId?: number;
  toWardCode?: string;
}

export interface IOrderShippingServiceItem {
  carrier?: string;
  carrierCode?: string;
  shippingMethod?: string;
  serviceId?: number;
  serviceTypeId?: number;
  shortName?: string;
  serviceName?: string;
  service_id?: number;
  service_type_id?: number;
  short_name?: string;
  service_name?: string;
  expectedDeliveryTime?: string;
  leadtime?:
    | number
    | {
        leadtime?: number;
        leadtime_order?: {
          from_estimate_date?: string;
          to_estimate_date?: string;
        };
      };
  expected_delivery_time?: string;
  totalFee?: number;
  fee?: number;
  total_fee?: number;
}

export interface GhnFeeCalculateItem {
  id: number;
  name: string;
  code: string;
  quantity: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  convert_weight: number;
  calculate_weight: number;
  image_ids: string[];
}

export interface GhnFeeCalculateRequest {
  shopId: number;
  serviceId: number;
  serviceTypeId: number;
  fromWardIdV2: number;
  fromAddressV2: string;
  toWardIdV2: number;
  toAddressV2: string;
  height: number;
  length: number;
  width: number;
  weight: number;
  insuranceValue: number;
  coupon: string;
  items: GhnFeeCalculateItem[];
}

export interface IGhnFeeCalculateResponse {
  total?: number;
  totalFee?: number;
  total_fee?: number;
  fee?: number;
  service_fee?: number;
  serviceFee?: number;
}

export interface StoreNearestItem {
  variationId: string;
  sku?: string;
  quantity?: number;
}

export interface StoreNearestPayload {
  items: StoreNearestItem[];
  shippingAddress: ShippingAddress;
}

export interface StoreNearestResponse {
  phone: string;
  wardCode: number;
  wardName: string;
  addressLine: string;
  warehouseId: string;
  warehouseName: string;
  provinceCode: number;
  provinceName: string;
}

export interface GetShippingFeePayload {
  variationId: string;
  quantity: number;
  wardCode: number;
  wardName: string;
  addressLine: string;
  provinceCode: number;
  provinceName: string;
}

export interface ShippingFeeItem {
  id: string;
  name: string;
  code: string;
  quantity: number;
  length: number;
  width: number;
  height: number;
  weight: number;
  convert_weight?: number;
  calculate_weight?: number;
}

export interface ShippingFeePayload {
  items: ShippingFeeItem[];
  shippingAddress: ShippingAddress;
  fromWardIdV2: number;
  fromAddressV2: string;
  toWardIdV2: number;
  toAddressV2: string;
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface ShippingFeeResponse {
  total: number;
  service_fee: number;
}

// ── Order return / exchange ──

export interface OrderReturnShippingAddressPayload {
  /** Họ và tên đầy đủ — không gửi lastName lên BE. */
  firstName: string;
  receiverPhone: string;
  wardCode: number;
  wardName: string;
  addressLine: string;
  provinceCode: number;
  provinceName: string;
  /** Response/legacy only — không đưa vào request payload. */
  lastName?: string | null;
}

export interface OrderReturnLineItemPayload {
  orderItemId: string;
  quantity: number;
}

export interface OrderExchangeLineItemPayload {
  variationId: string;
  quantity: number;
}

export interface OrderReturnItemResponse {
  id?: string;
  orderItemId?: string;
  variationId?: string;
  productId?: string;
  productName: string;
  variationName?: string;
  skuCode?: string;
  image?: string;
  salePrice?: string | number;
  unitPrice?: string | number;
  customerDisplayPrice?: CustomerDisplayPrice;
  quantity: number;
  lineTotal?: string | number;
  attributes?: OrderDetailLineAttribute[];
}

export interface OrderReturnPickupAddressSnapshot {
  phone?: string;
  wardCode?: number;
  wardName?: string;
  addressLine?: string;
  provinceCode?: number;
  provinceName?: string;
  warehouseId?: string;
  warehouseName?: string;
}

export interface CreateClientOrderReturnRequest {
  orderId: string;
  type: OrderReturnType;
  reason: OrderReturnReason;
  returnItems: OrderReturnLineItemPayload[];
  exchangeItems: OrderExchangeLineItemPayload[];
  shippingAddress: OrderReturnShippingAddressPayload;
  note?: string;
  /** Thông tin hoàn tiền (multipart) — optional theo type/BE. */
  refundBankAccountNumber?: string;
  refundBankAccountHolder?: string;
  refundBankName?: string;
  refundBankBranch?: string;
}

export interface CreateClientOrderReturnResponse {
  id: string;
  returnCode?: string;
  orderReturnCode?: string;
  orderId?: string;
  type?: OrderReturnType;
  status?: string;
  createdAt?: string;
}

export interface OrderReturnStatusHistoryItem {
  id?: string;
  orderReturnId?: string;
  fromStatus?: OrderReturnStatus | string | null;
  toStatus: OrderReturnStatus | string;
  trackingStatus?: OrderReturnTimelineStatus | string | null;
  note?: string | null;
  createdAt: string;
  changedById?: string | null;
  changedByType?: string | null;
}

export interface OrderReturnLineDetail {
  orderItemId?: string;
  variationId?: string;
  productId?: string;
  productName: string;
  variationName?: string;
  image?: string;
  skuCode?: string;
  quantity: number;
  unitPrice?: string | number;
  salePrice?: string | number;
  customerDisplayPrice?: CustomerDisplayPrice;
  attributes?: OrderDetailLineAttribute[];
}

export interface ClientOrderReturnDetailResponse {
  id: string;
  tenantCode?: string | null;
  customerId?: string | null;
  returnCode?: string;
  originalOrderId: string;
  originalOrderCode: string;
  originalOrderTrackingCode?: string | null;
  type: OrderReturnType | string;
  reason: OrderReturnReason | string;
  reasonCategory?: string | null;
  status?: OrderReturnStatus | string;
  note?: string | null;
  evidenceImageUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;

  returnShippingFeePayer?: string | null;
  exchangeShippingFeePayer?: string | null;
  returnFaultParty?: string | null;
  source?: string | null;

  originalOrderAmountReceived?: string | number | null;
  returnTotal?: string | number | null;
  exchangeTotal?: string | number | null;
  priceDifference?: string | number | null;
  otherRevenueNoRefund?: string | number | null;
  loyaltyPointsReceived?: number | null;
  returnPickupCodTotal?: string | number | null;
  returnPickupTrackingCode?: string | null;

  returnInboundShippingFee?: string | number | null;
  returnInboundShippingFeeNominal?: string | number | null;
  returnInboundShippingMethod?: string | null;
  returnInboundShippingCarrier?: string | null;
  returnInboundCarrierServiceId?: number | null;
  returnInboundShipperNote?: string | null;

  exchangeOutboundShippingFee?: string | number | null;
  exchangeMerchandiseTopUpAmount?: string | number | null;
  exchangeDeliveryCodTotal?: string | number | null;
  exchangeFulfillmentOrderId?: string | null;
  exchangeShipmentTrackingCode?: string | null;
  exchangeOutboundShippingMethod?: string | null;
  exchangeOutboundShippingCarrier?: string | null;
  exchangeOutboundCarrierServiceId?: number | null;
  exchangeOutboundShipperNote?: string | null;

  totalRefundAmount?: string | number | null;
  paymentMethod?: string | null;

  refundBankAccountHolder?: string | null;
  refundBankAccountNumber?: string | null;
  refundBankName?: string | null;
  refundBankBranch?: string | null;

  receiverPhone?: string | null;
  lastName?: string | null;
  firstName?: string | null;

  resolvedById?: string | null;
  resolvedAt?: string | null;
  resolvedNote?: string | null;
  reasonReject?: string | null;

  pickupAddressSnapshot?: OrderReturnPickupAddressSnapshot;
  shippingAddressSnapshot?: OrderReturnShippingAddressPayload;
  shippingAddress?: OrderReturnShippingAddressPayload;

  returnItems: OrderReturnItemResponse[];
  exchangeItems?: OrderReturnItemResponse[];
  orderReturnStatusHistory?: OrderReturnStatusHistoryItem[];
  statusHistory?: OrderReturnStatusHistoryItem[];
  originalOrder?: Partial<OrderDetailResponse>;

  orderId?: string;
  orderCode?: string;

  createdByType?: string | null;
  updatedByType?: string | null;
  deletedByType?: string | null;
  createdById?: string | null;
  updatedById?: string | null;
  deletedById?: string | null;
}

export interface CancelOrderRequest {
  cancellationReason: OrderCancellationReason;
  note?: string;
}
