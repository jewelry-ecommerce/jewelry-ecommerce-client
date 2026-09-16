import type { OrderProductItemData } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-product-item.interface";
import type {
  ClientOrderReturnDetailResponse,
  OrderDetailItem,
  OrderDetailResponse,
  OrderReturnItemResponse,
  OrderReturnLineDetail,
  OrderReturnShippingAddressPayload,
  OrderReturnStatusHistoryItem,
} from "@/utils/api/order/order.interface";
import {
  getOrderReturnReasonLabel,
  getOrderReturnStatusInfo,
  getOrderReturnTimelineStatusCopy,
  getOrderReturnTypeLabel,
  OrderReturnStatus,
  timelineStatusTitle,
} from "@/utils/api/order/order.enum";
import {
  computeExchangePriceDifferenceSigned,
  computeTotalReplacementSaleValue,
  computeTotalReturnSaleValue,
  exchangeLineUnitCompareAtPrice,
  exchangeLineUnitSalePrice,
} from "./order-return-pricing.util";
import type { OrderTimelineItem } from "@/components/order/order-timeline/order-timeline.component";
import type { OrderProductItem } from "@/components/order/order-product-list/order-product-list.component";
import dayjs from "dayjs";
import { formatDate } from "@/utils/format";

export interface OrderReturnDetailViewModel {
  orderReturnId: string;
  returnCode: string;
  orderCode: string;
  orderId: string;
  status: string;
  statusInfo: ReturnType<typeof getOrderReturnStatusInfo>;
  canWithdraw: boolean;
  type: string;
  reasonLabel: string;
  note?: string;
  evidenceImageUrls: string[];
  pickupFullName: string;
  pickupPhone: string;
  withdrawalAddressLine: string;
  createdAtLabel: string;
  returnProducts: OrderProductItemData[];
  exchangeProducts: OrderProductItemData[];
  returnQuantities: Record<string, number>;
  replacementQuantities: Record<string, number>;
  selectedReturnItemIds: string[];
  totalReturnValue: number;
  totalExchangeValue: number;
  priceDifference: number;
  refundedLoyaltyPoints: number;
  returnShippingFee: number;
  exchangeShippingFee: number;
  paymentMethod?: string | null;
  refundBankAccountHolder?: string | null;
  refundBankAccountNumber?: string | null;
  refundBankName?: string | null;
  refundBankBranch?: string | null;
  timelineItems: OrderTimelineItem[];
}

function parseMoney(value: string | number | null | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function formatShippingAddress(addr?: OrderReturnShippingAddressPayload): string {
  if (!addr) return "—";
  const parts = [addr.addressLine, addr.wardName, addr.provinceName].filter(Boolean);
  return parts.join(", ") || "—";
}

function resolveContact(orderReturn: ClientOrderReturnDetailResponse): {
  fullName: string;
  phone: string;
} {
  const shipping = orderReturn.shippingAddressSnapshot ?? orderReturn.shippingAddress;
  const pickup = orderReturn.pickupAddressSnapshot;

  const nameFromRoot = [orderReturn.lastName, orderReturn.firstName]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(" ")
    .trim();
  const nameFromShipping = shipping
    ? [shipping.lastName, shipping.firstName]
        .map((s) => s?.trim())
        .filter(Boolean)
        .join(" ")
        .trim()
    : "";
  const fullName = nameFromRoot || nameFromShipping || "—";

  const phone = orderReturn.receiverPhone?.trim() || shipping?.receiverPhone?.trim() || pickup?.phone?.trim() || "—";

  return { fullName: fullName || "—", phone };
}

function apiItemToLineDetail(item: OrderReturnItemResponse): OrderReturnLineDetail {
  return {
    orderItemId: item.orderItemId,
    variationId: item.variationId,
    productId: item.productId,
    productName: item.productName,
    variationName: item.variationName,
    image: item.image,
    skuCode: item.skuCode,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    salePrice: item.salePrice ?? item.lineTotal,
    customerDisplayPrice: item.customerDisplayPrice,
    attributes: item.attributes,
  };
}

function orderItemToLineDetail(item: OrderDetailItem, quantity: number): OrderReturnLineDetail {
  return {
    orderItemId: item.id,
    variationId: item.variationId,
    productId: item.productId,
    productName: item.productName,
    variationName: item.variationName,
    image: item.image,
    skuCode: item.skuCode,
    quantity,
    unitPrice: item.unitPrice,
    salePrice: item.salePrice,
    customerDisplayPrice: item.customerDisplayPrice,
    attributes: item.attributes,
  };
}

function isEnrichedReturnItem(item: OrderReturnItemResponse): boolean {
  return Boolean(item.productName);
}

function resolveReturnLineDetails(
  orderReturn: ClientOrderReturnDetailResponse,
  order?: OrderDetailResponse | null,
): OrderReturnLineDetail[] {
  if (orderReturn.returnItems.every(isEnrichedReturnItem)) {
    return orderReturn.returnItems.map(apiItemToLineDetail);
  }

  return orderReturn.returnItems
    .map((line) => {
      if (isEnrichedReturnItem(line)) return apiItemToLineDetail(line);
      const item = order?.items?.find((i) => i.id === line.orderItemId);
      if (!item) return null;
      return orderItemToLineDetail(item, line.quantity);
    })
    .filter((line): line is OrderReturnLineDetail => line != null);
}

function resolveExchangeLineDetails(
  orderReturn: ClientOrderReturnDetailResponse,
  order?: OrderDetailResponse | null,
): OrderReturnLineDetail[] {
  const exchangeItems = orderReturn.exchangeItems ?? [];
  if (exchangeItems.length === 0) return [];

  if (exchangeItems.every(isEnrichedReturnItem)) {
    return exchangeItems.map(apiItemToLineDetail);
  }

  return exchangeItems
    .map((line) => {
      if (isEnrichedReturnItem(line)) return apiItemToLineDetail(line);
      const byVariation = order?.items?.find((i) => i.variationId === line.variationId);
      if (byVariation) {
        return { ...orderItemToLineDetail(byVariation, line.quantity), variationId: line.variationId };
      }
      return {
        variationId: line.variationId,
        productId: line.variationId,
        productName: "Sản phẩm đổi",
        quantity: line.quantity,
        salePrice: 0,
      } satisfies OrderReturnLineDetail;
    })
    .filter(Boolean);
}

function lineDetailToProductItem(line: OrderReturnLineDetail, key: string): OrderProductItemData {
  return {
    productId: key,
    variationId: line.variationId,
    productName: line.productName,
    image: line.image ?? "",
    slug: "",
    sellingPriceAfterTaxMinor: line.customerDisplayPrice?.sellingPriceAfterTaxMinor ?? line.salePrice ?? 0,
    compareAtPriceAfterTaxMinor: line.customerDisplayPrice?.compareAtPriceAfterTaxMinor ?? line.unitPrice ?? line.salePrice ?? 0,
    customerDisplayPrice: line.customerDisplayPrice,
    stockStatus: "",
    attributes: line.attributes?.map((attr) => ({
      attributeCode: attr.attributeCode ?? "",
      attributeName: attr.attributeName ?? "",
      value: attr.value ?? "",
    })),
  };
}

function formatTimelineParts(iso: string): { time: string; date: string } {
  const d = dayjs(iso);
  return d.isValid() ? { time: d.format("HH:mm"), date: d.format("DD/MM/YYYY") } : { time: "", date: "" };
}

/** Timeline chi tiết đổi trả/hoàn tiền: có trackingStatus → title + subtitle; không có → chỉ toStatus làm title. */
function mapReturnDetailTimelineEntry(entry: OrderReturnStatusHistoryItem, index: number): OrderTimelineItem {
  const { time, date } = formatTimelineParts(entry.createdAt);
  const trackingStatus = entry.trackingStatus?.trim();

  if (trackingStatus) {
    const copy = getOrderReturnTimelineStatusCopy(trackingStatus);
    return {
      id: entry.id ?? `${trackingStatus}-${entry.createdAt}`,
      time,
      date,
      title: copy?.title ?? timelineStatusTitle(trackingStatus),
      description: copy?.subtitle ?? "",
      isActive: index === 0,
    };
  }

  const toStatus = entry.toStatus?.trim();
  return {
    id: entry.id ?? `${toStatus ?? "status"}-${entry.createdAt}`,
    time,
    date,
    title: timelineStatusTitle(toStatus),
    description: "",
    isActive: index === 0,
  };
}

function buildTimeline(orderReturn: ClientOrderReturnDetailResponse): OrderTimelineItem[] {
  const history = orderReturn.orderReturnStatusHistory ?? orderReturn.statusHistory;
  if (history?.length) {
    return [...history]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((entry, index) => mapReturnDetailTimelineEntry(entry, index));
  }

  if (!orderReturn.createdAt) return [];

  const { time, date } = formatTimelineParts(orderReturn.createdAt);
  return [
    {
      id: "created",
      time,
      date,
      title: getOrderReturnStatusInfo(orderReturn.status ?? OrderReturnStatus.PENDING).label,
      description: "Yêu cầu đổi / trả đã được gửi",
      isActive: true,
    },
  ];
}

export function mapReturnProductsToOrderListItems(
  products: OrderProductItemData[],
  quantities: Record<string, number>,
): OrderProductItem[] {
  return products.map((product) => {
    const qty = quantities[product.productId] ?? 1;
    const sale = exchangeLineUnitSalePrice(product);
    const compareAt = exchangeLineUnitCompareAtPrice(product);
    return {
      id: product.productId,
      image: product.image ?? "",
      name: product.productName,
      attributes: product.attributes,
      quantity: qty,
      price: `${(sale * qty).toLocaleString("vi-VN")}đ`,
      originalPrice: compareAt > 0 && compareAt !== sale ? `${(compareAt * qty).toLocaleString("vi-VN")}đ` : undefined,
    };
  });
}

export function mapOrderReturnDetailViewModel(
  orderReturn: ClientOrderReturnDetailResponse,
  order?: OrderDetailResponse | null,
): OrderReturnDetailViewModel {
  const orderForFallback = order?.items?.length ? order : null;
  const returnLines = resolveReturnLineDetails(orderReturn, orderForFallback);
  const exchangeLines = resolveExchangeLineDetails(orderReturn, orderForFallback);

  const returnProducts = returnLines.map((line, i) => lineDetailToProductItem(line, line.orderItemId ?? line.variationId ?? `return-${i}`));
  const exchangeProducts = exchangeLines.map((line, i) =>
    lineDetailToProductItem(line, line.variationId ?? line.productId ?? `exchange-${i}`),
  );

  const returnQuantities: Record<string, number> = {};
  const selectedReturnItemIds: string[] = [];
  returnLines.forEach((line, i) => {
    const key = line.orderItemId ?? line.variationId ?? `return-${i}`;
    returnQuantities[key] = line.quantity;
    if (line.orderItemId) selectedReturnItemIds.push(line.orderItemId);
  });

  const replacementQuantities: Record<string, number> = {};
  exchangeLines.forEach((line, i) => {
    const key = line.variationId ?? line.productId ?? `exchange-${i}`;
    replacementQuantities[key] = line.quantity;
  });

  const totalReturnValue =
    parseMoney(orderReturn.returnTotal) ||
    parseMoney(orderReturn.originalOrderAmountReceived) ||
    (orderForFallback && selectedReturnItemIds.length
      ? computeTotalReturnSaleValue(orderForFallback, selectedReturnItemIds, returnQuantities)
      : returnLines.reduce((sum, line) => sum + parseMoney(line.salePrice) * line.quantity, 0));

  const totalExchangeValue =
    parseMoney(orderReturn.exchangeTotal) || computeTotalReplacementSaleValue(exchangeProducts, replacementQuantities);

  const priceDifference =
    parseMoney(orderReturn.priceDifference) ||
    (orderForFallback
      ? computeExchangePriceDifferenceSigned(
          orderForFallback,
          selectedReturnItemIds,
          returnQuantities,
          exchangeProducts,
          replacementQuantities,
        )
      : totalExchangeValue - totalReturnValue);

  const contact = resolveContact(orderReturn);
  const shipping = orderReturn.shippingAddressSnapshot ?? orderReturn.shippingAddress;
  const withdrawalAddressLine = formatShippingAddress(shipping);
  const status = orderReturn.status ?? OrderReturnStatus.PENDING;

  const orderId = orderReturn.originalOrderId ?? orderReturn.orderId ?? "";
  const orderCode = orderReturn.originalOrderCode ?? orderReturn.orderCode ?? "";

  return {
    orderReturnId: orderReturn.id,
    returnCode: orderReturn.returnCode ?? orderCode,
    orderId,
    orderCode,
    status,
    statusInfo: getOrderReturnStatusInfo(status),
    canWithdraw: false,
    type: getOrderReturnTypeLabel(orderReturn.type),
    reasonLabel: getOrderReturnReasonLabel(orderReturn.reason),
    note: orderReturn.note ?? undefined,
    evidenceImageUrls: orderReturn.evidenceImageUrls ?? [],
    pickupFullName: contact.fullName,
    pickupPhone: contact.phone,
    withdrawalAddressLine,
    createdAtLabel: orderReturn.createdAt ? formatDate(orderReturn.createdAt) : "—",
    returnProducts,
    exchangeProducts,
    returnQuantities,
    replacementQuantities,
    selectedReturnItemIds,
    totalReturnValue,
    totalExchangeValue,
    priceDifference,
    refundedLoyaltyPoints: orderReturn.loyaltyPointsReceived ?? 0,
    returnShippingFee:
      parseMoney(orderReturn.returnInboundShippingFee) ||
      parseMoney(orderReturn.returnInboundShippingFeeNominal) ||
      parseMoney(orderReturn.returnPickupCodTotal),
    exchangeShippingFee: parseMoney(orderReturn.exchangeOutboundShippingFee),
    paymentMethod: orderReturn.paymentMethod ?? null,
    refundBankAccountHolder: orderReturn.refundBankAccountHolder ?? null,
    refundBankAccountNumber: orderReturn.refundBankAccountNumber ?? null,
    refundBankName: orderReturn.refundBankName ?? null,
    refundBankBranch: orderReturn.refundBankBranch ?? null,
    timelineItems: buildTimeline(orderReturn),
  };
}
