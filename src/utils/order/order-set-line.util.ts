import { CheckoutRequestLineType, type CheckoutSessionItem, type CheckoutSessionSetItem } from "@/utils/api/checkout/checkout.interface";
import type { OrderDetailItem, OrderLine, OrderSetLine, OrderSetLineComponent } from "@/utils/api/order/order.interface";

type OrderWithLines = {
  lines?: OrderLine[];
};

export function isOrderSetLine(line: OrderLine): line is OrderSetLine {
  return line.type === CheckoutRequestLineType.SET;
}

export function getOrderSetLines(order: OrderWithLines): OrderSetLine[] {
  return (order.lines ?? []).filter(isOrderSetLine);
}

export function getOrderLooseItems(order: OrderWithLines & { items: OrderDetailItem[] }): OrderDetailItem[] {
  const setLineIds = new Set(getOrderSetLines(order).map((line) => line.setLineId));
  return order.items.filter((item) => !item.setLineId || !setLineIds.has(item.setLineId));
}

function mapOrderComponent(component: OrderSetLineComponent): CheckoutSessionItem {
  return {
    id: component.id,
    variationId: component.variationId,
    productId: component.productId,
    categoryName: component.categoryName,
    productName: component.productName,
    variationName: component.variationName,
    skuCode: component.skuCode,
    image: component.image,
    unitPrice: component.unitPrice,
    salePrice: component.salePrice,
    customerDisplayPrice: component.customerDisplayPrice,
    quantity: component.quantity,
    lineTotal: component.lineTotal,
    discountAmount: component.discountAmount,
    finalAmount: component.finalAmount,
    attributes: component.attributes,
    lineType: component.lineType,
    parentCheckoutItemId: component.parentOrderItemId,
    packagingRelationId: component.packagingRelationId,
    isKey: component.isKey,
  };
}

export function mapOrderSetLineToCheckoutItem(line: OrderSetLine): CheckoutSessionSetItem {
  return {
    type: CheckoutRequestLineType.SET,
    lineId: line.lineId,
    setId: line.setId,
    code: line.code ?? undefined,
    name: line.name,
    slug: line.slug,
    image: line.image,
    status: line.status,
    quantity: line.quantity,
    subtotalMinor: line.customerDisplayPrice.sellingPriceAfterTaxMinor ?? line.subtotalMinor,
    compareAtSubtotalMinor: line.customerDisplayPrice.compareAtPriceAfterTaxMinor ?? line.originalSubtotalMinor,
    components: line.components.map(mapOrderComponent),
  };
}
