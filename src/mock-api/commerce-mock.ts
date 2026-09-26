import type { CartApiItem, CartCalculateTotalResponse, ParamPostCartItem } from "@/utils/api/cart/cart.interface";
import type {
  CheckoutSession,
  CheckoutSessionItem,
  InitiateCheckoutPayload,
  PlaceOrderPayload,
} from "@/utils/api/checkout/checkout.interface";
import type { OrderDetailResponse, OrderListItem, OrderListResponse, ShippingAddress } from "@/utils/api/order/order.interface";
import { OrderSource, OrderStatus, PaymentMethod, PaymentStatus, ShippingMethod } from "@/utils/api/order/order.enum";
import { findMockProduct } from "./catalog-mock";

export const MOCK_STATE_COOKIE = "jewelry_demo_state";
export const MOCK_SHIPPING_FEE = 30_000;

export interface MockLine {
  variationId: string;
  quantity: number;
}
export interface MockSession {
  id: string;
  lines: MockLine[];
  address?: ShippingAddress;
  shippingFee: number;
  paymentMethod: PaymentMethod;
}
export interface MockOrder {
  code: string;
  createdAt: string;
  lines: MockLine[];
  address: ShippingAddress;
  shippingFee: number;
  note: string;
}
export interface MockState {
  cart: MockLine[];
  session?: MockSession;
  orders: MockOrder[];
  wishlist: string[];
}

export const readMockState = (value?: string): MockState => {
  if (!value) return { cart: [], orders: [], wishlist: [] };
  try {
    const parsed: Partial<MockState> = JSON.parse(value);
    return { cart: parsed.cart ?? [], session: parsed.session, orders: parsed.orders ?? [], wishlist: parsed.wishlist ?? [] };
  } catch {
    return { cart: [], orders: [], wishlist: [] };
  }
};

export const getMockPrice = (variationId: string): number =>
  findMockProduct(variationId)?.selectedSku.customerDisplayPrice.sellingPriceAfterTaxMinor ?? 0;

export const getMockCartItems = (lines: MockLine[]): CartApiItem[] =>
  lines.flatMap(({ variationId, quantity }) => {
    const product = findMockProduct(variationId);
    if (!product || quantity <= 0) return [];
    const sku = product.selectedSku;
    const price = sku.customerDisplayPrice;
    return [
      {
        id: sku.id,
        found: true,
        name: product.name,
        slug: product.slug,
        skuCode: sku.skuCode,
        status: "ACTIVE",
        productId: product.productId,
        compareAtPriceAfterTaxMinor: price.compareAtPriceAfterTaxMinor ?? price.sellingPriceAfterTaxMinor,
        sellingPriceAfterTaxMinor: price.sellingPriceAfterTaxMinor,
        customerDisplayPrice: price,
        stock: 20,
        availableStock: 20,
        stockStatus: "IN_STOCK",
        product: {
          id: product.productId,
          name: product.name,
          slug: product.slug,
          image: sku.image ?? "",
          imageHover: sku.imageHover ?? "",
          status: "ACTIVE",
          categoryId: "jewelry",
          categoryName: "Trang sức",
          brandName: product.brandName ?? "Jewelry Ecommerce",
        },
        variationId: sku.id,
        media: [{ url: sku.image ?? "", sortOrder: 0 }],
        variation: {
          id: sku.id,
          name: product.name,
          skuCode: sku.skuCode,
          slug: product.slug,
          compareAtPriceAfterTaxMinor: price.compareAtPriceAfterTaxMinor ?? price.sellingPriceAfterTaxMinor,
          sellingPriceAfterTaxMinor: price.sellingPriceAfterTaxMinor,
          customerDisplayPrice: price,
          stock: 20,
          availableStock: 20,
          status: "ACTIVE",
          image: sku.image ?? "",
          attributes: [],
          stockStatus: "IN_STOCK",
        },
        quantity,
      },
    ];
  });

export const updateMockCart = (state: MockState, payload: ParamPostCartItem): MockState => {
  const next = new Map((payload.clearAll ? [] : state.cart).map((line) => [line.variationId, line.quantity]));
  for (const line of payload.items) {
    if (!line.variationId || !findMockProduct(line.variationId)) continue;
    if (line.quantity > 0) next.set(line.variationId, line.quantity);
    else next.delete(line.variationId);
  }
  return { ...state, cart: [...next].map(([variationId, quantity]) => ({ variationId, quantity })) };
};

export const getMockCartTotal = (lines: MockLine[]): CartCalculateTotalResponse => {
  const subTotal = lines.reduce((sum, line) => sum + getMockPrice(line.variationId) * line.quantity, 0);
  return { subTotal, discountTotal: 0, discounts: [], shippingFee: 0, totalAmount: subTotal, rewardPoints: 0 };
};

const getSessionItems = (lines: MockLine[]): CheckoutSessionItem[] =>
  lines.flatMap((line) => {
    const product = findMockProduct(line.variationId);
    if (!product) return [];
    const unitPrice = getMockPrice(line.variationId);
    return [
      {
        id: product.selectedSku.id,
        variationId: product.selectedSku.id,
        productId: product.productId,
        productName: product.name,
        variationName: product.name,
        skuCode: product.selectedSku.skuCode,
        image: product.selectedSku.image ?? "",
        unitPrice,
        salePrice: unitPrice,
        customerDisplayPrice: product.selectedSku.customerDisplayPrice,
        quantity: line.quantity,
        lineTotal: unitPrice * line.quantity,
        discountAmount: 0,
        finalAmount: unitPrice * line.quantity,
        weightGram: 100,
        lengthCm: 10,
        widthCm: 10,
        heightCm: 5,
      },
    ];
  });

export const getMockCheckoutSession = (session: MockSession): CheckoutSession => {
  const items = getSessionItems(session.lines);
  const subtotal = items.reduce((sum, item) => sum + Number(item.finalAmount), 0);
  return {
    checkoutSessionId: session.id,
    status: "DRAFT",
    consentThirdPartySharing: false,
    shippingAddress: session.address,
    paymentMethod: session.paymentMethod,
    shippingMethod: ShippingMethod.STANDARD,
    totalAmount: subtotal + session.shippingFee,
    items,
    pricing: { subtotal, shippingFee: session.shippingFee, discountTotal: 0, taxTotal: 0, grandTotal: subtotal + session.shippingFee },
    checkoutType: "RETAIL",
    paymentRequired: true,
  };
};

export const initiateMockCheckout = (payload: InitiateCheckoutPayload): MockSession => ({
  id: crypto.randomUUID(),
  lines: (payload.items ?? []).flatMap((line) =>
    line.type === "LOOSE" ? [{ variationId: line.variationId, quantity: line.quantity }] : [],
  ),
  shippingFee: MOCK_SHIPPING_FEE,
  paymentMethod: PaymentMethod.COD,
});

export const placeMockOrder = (session: MockSession, payload: PlaceOrderPayload): MockOrder | null => {
  if (!session.address || !session.lines.length || payload.paymentMethod !== PaymentMethod.COD) return null;
  return {
    code: `JWL-${Date.now().toString().slice(-9)}`,
    createdAt: new Date().toISOString(),
    lines: session.lines,
    address: session.address,
    shippingFee: session.shippingFee,
    note: payload.note ?? "",
  };
};

export const getMockOrderDetail = (order: MockOrder): OrderDetailResponse => {
  const checkoutItems = getSessionItems(order.lines);
  const subtotal = checkoutItems.reduce((sum, item) => sum + Number(item.finalAmount), 0);
  return {
    id: order.code,
    createdAt: order.createdAt,
    orderCode: order.code,
    customerId: "demo-customer",
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID,
    paymentMethod: PaymentMethod.COD,
    source: OrderSource.WEBSITE,
    shippingMethod: ShippingMethod.STANDARD,
    shippingAddressSnapshot: {
      ...order.address,
      lastName: order.address.lastName ?? "",
      wardCode: order.address.wardCode,
      provinceCode: order.address.provinceCode,
    },
    shippingFee: String(order.shippingFee),
    subtotal: String(subtotal),
    discountTotal: "0",
    taxTotal: "0",
    grandTotal: String(subtotal + order.shippingFee),
    note: order.note,
    notePayment: null,
    errorLog: null,
    items: checkoutItems.map((item) => ({
      id: item.variationId,
      variationId: item.variationId,
      productId: item.productId,
      productName: item.productName,
      variationName: item.variationName,
      skuCode: item.skuCode,
      image: item.image,
      unitPrice: String(item.unitPrice),
      salePrice: String(item.salePrice),
      customerDisplayPrice: item.customerDisplayPrice,
      quantity: item.quantity,
      lineTotal: String(item.lineTotal),
      discountAmount: "0",
      finalAmount: String(item.finalAmount),
      productSlug: findMockProduct(item.variationId)?.slug,
    })),
    statusHistory: [
      {
        toStatus: OrderStatus.PENDING,
        changedById: null,
        changedByType: null,
        note: "Đơn hàng COD đã được tạo",
        createdAt: order.createdAt,
      },
    ],
  };
};

export const getMockOrderList = (orders: MockOrder[]): OrderListResponse => {
  const list: OrderListItem[] = orders.map((order) => {
    const detail = getMockOrderDetail(order);
    return {
      id: detail.id,
      createdAt: detail.createdAt,
      updatedAt: detail.createdAt,
      orderCode: detail.orderCode,
      status: detail.status,
      paymentStatus: detail.paymentStatus,
      paymentMethod: detail.paymentMethod,
      shippingAddressSnapshot: detail.shippingAddressSnapshot,
      subtotal: detail.subtotal,
      discountTotal: detail.discountTotal,
      taxTotal: detail.taxTotal,
      grandTotal: detail.grandTotal,
      errorLog: null,
      items: detail.items.map((item) => ({ ...item, orderId: detail.id })),
    };
  });
  return { total: list.length, list, summary: { ALL: list.length, Pending: list.length } };
};
