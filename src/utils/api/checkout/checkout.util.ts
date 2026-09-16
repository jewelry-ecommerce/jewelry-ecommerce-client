import {
  CheckoutRequestLineType,
  type CheckoutSessionItem,
  type CheckoutSessionLine,
  type CheckoutSessionSetItem,
} from "./checkout.interface";

export const isCheckoutSessionSetItem = (item: CheckoutSessionLine): item is CheckoutSessionSetItem =>
  item.type === CheckoutRequestLineType.SET;

export const flattenCheckoutSessionItems = (items: CheckoutSessionLine[]): CheckoutSessionItem[] =>
  items.flatMap((item) => {
    const merchandiseItems = isCheckoutSessionSetItem(item) ? item.components : [item];
    return merchandiseItems.flatMap((merchandiseItem) => [merchandiseItem, ...(merchandiseItem.packaging ?? [])]);
  });

export const flattenLooseCheckoutSessionItems = (items: CheckoutSessionLine[]): CheckoutSessionItem[] =>
  flattenCheckoutSessionItems(items.filter((item) => !isCheckoutSessionSetItem(item)));
