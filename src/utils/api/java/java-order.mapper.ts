import { OrderStatus, PaymentStatus, PaymentMethod, ShippingMethod, OrderSource } from "../order/order.enum";
import type { OrderDetailResponse, OrderListItem } from "../order/order.interface";
import type { JavaOrder, JavaOrderLine } from "./java-commerce.types";

function enumValue<T extends string>(values: T[], value: string): T {
  const result = values.find(candidate => candidate.replaceAll("_", "").toUpperCase() === value.replaceAll("_", "").toUpperCase());
  if (!result) throw new Error("Trạng thái Java chưa được hỗ trợ: " + value);
  return result;
}
export function javaOrderItem(item: JavaOrderLine) {
  return { id: String(item.id), productId: String(item.productId), variationId: String(item.skuId),
    productName: item.name, variationName: item.name, skuCode: "", image: item.imageUrl ?? "",
    quantity: item.quantity, unitPrice: String(item.unitPrice), salePrice: String(item.unitPrice),
    lineTotal: String(item.lineTotal), discountAmount: "0", finalAmount: String(item.lineTotal) };
}
export function javaOrderView(order: JavaOrder): OrderDetailResponse {
  return { id: String(order.id), orderCode: order.code, customerId: "", createdAt: order.createdAt ?? order.placedAt,
    status: enumValue(Object.values(OrderStatus), order.status), paymentStatus: enumValue(Object.values(PaymentStatus), order.paymentStatus),
    paymentMethod: enumValue(Object.values(PaymentMethod), order.paymentMethod),
    shippingMethod: enumValue(Object.values(ShippingMethod), order.shippingMethod), source: OrderSource.WEBSITE,
    shippingAddressSnapshot: { firstName: order.shipRecipientName, lastName: "", receiverPhone: order.shipPhone,
      provinceName: order.shipProvince, wardName: order.shipWard, addressLine: order.shipAddressLine,
      provinceCode: null, wardCode: null },
    subtotal: String(order.subtotal), discountTotal: String(Number(order.productDiscount) + Number(order.voucherDiscount)),
    taxTotal: "0", shippingFee: String(order.shippingFee), grandTotal: String(order.grandTotal),
    note: order.note ?? "", notePayment: null, errorLog: null, items: order.items.map(javaOrderItem),
    statusHistory: (order.timeline ?? []).map(event => ({ toStatus: enumValue(Object.values(OrderStatus), event.status),
      note: event.note ?? "", createdAt: event.occurredAt, changedById: null, changedByType: null })) };
}
export function javaOrderListItem(order: JavaOrder): OrderListItem {
  const detail = javaOrderView(order);
  return { ...detail, updatedAt: order.updatedAt ?? detail.createdAt,
    items: detail.items.map(item => ({ ...item, orderId: detail.id })) };
}
