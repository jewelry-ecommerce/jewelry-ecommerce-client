export const GTM_EVENTS = {
  webVital: "web_vital",
  addToCart: "add_to_cart",
  beginCheckout: "begin_checkout",
  removeFromCart: "remove_from_cart",
  viewItem: "view_item",
  purchase: "purchase",
} as const;

export const GTM_ECOMMERCE_CURRENCY = "VND" as const;

export type GtmEcommerceItem = {
  item_id: string;
  item_name: string;
  item_brand: string;
  item_category: string;
  price: number;
  quantity: number;
  index?: number;
};

export type GtmEcommercePayload = {
  currency: typeof GTM_ECOMMERCE_CURRENCY;
  value: number;
  items: GtmEcommerceItem[];
};

/** @deprecated Alias — dùng `GtmEcommercePayload`. */
export type GtmAddToCartEcommerce = GtmEcommercePayload;

export type GtmAddToCartPayload = {
  event: typeof GTM_EVENTS.addToCart;
  ecommerce: GtmEcommercePayload;
};

export type GtmBeginCheckoutPayload = {
  event: typeof GTM_EVENTS.beginCheckout;
  ecommerce: GtmEcommercePayload;
};

export type GtmRemoveFromCartPayload = {
  event: typeof GTM_EVENTS.removeFromCart;
  ecommerce: GtmEcommercePayload;
};

export type GtmViewItemPayload = {
  event: typeof GTM_EVENTS.viewItem;
  ecommerce: GtmEcommercePayload;
};

export type GtmPurchaseEcommerce = {
  transaction_id: string;
  value: number;
  currency: typeof GTM_ECOMMERCE_CURRENCY;
  shipping?: number;
  coupon?: string;
  items: GtmEcommerceItem[];
};

export type GtmPurchasePayload = {
  event: typeof GTM_EVENTS.purchase;
  ecommerce: GtmPurchaseEcommerce;
};

export type GtmEventName = (typeof GTM_EVENTS)[keyof typeof GTM_EVENTS];

export type GtmWebVitalPayload = {
  event: typeof GTM_EVENTS.webVital;
  metric_id: string;
  metric_name: string;
  value: number;
  delta: number;
  rating: "good" | "needs-improvement" | "poor" | string;
  navigation_type?: string;
};

/** Cho phép payload tùy ý khi các module nghiệp vụ gọi `pushToDataLayer`. */
export type GtmDataLayerPayload =
  | GtmWebVitalPayload
  | GtmAddToCartPayload
  | GtmBeginCheckoutPayload
  | GtmRemoveFromCartPayload
  | GtmViewItemPayload
  | GtmPurchasePayload
  | Record<string, unknown>;
