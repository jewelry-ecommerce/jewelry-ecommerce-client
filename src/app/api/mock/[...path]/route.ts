import { NextRequest, NextResponse } from "next/server";
import {
  getMockStorefrontGlobalConfig,
  getMockStorefrontLogos,
  getMockStorefrontNavigation,
  getMockStorefrontPage,
} from "@/mock-api/storefront-mock";
import { findMockProduct, getMockLegacyProduct, getMockProductCards, getMockProductDetail, MOCK_PRODUCTS } from "@/mock-api/catalog-mock";
import { getMockBannerPlacement } from "@/mock-api/banner-mock";
import {
  getMockCartItems,
  getMockCartTotal,
  getMockCheckoutSession,
  getMockOrderDetail,
  getMockOrderList,
  initiateMockCheckout,
  MOCK_SHIPPING_FEE,
  MOCK_STATE_COOKIE,
  placeMockOrder,
  readMockState,
  updateMockCart,
  type MockState,
} from "@/mock-api/commerce-mock";
import type {
  InitiateCheckoutPayload,
  PlaceOrderPayload,
  UpdatePricingContextPayload,
  UpdateShippingAddressPayload,
} from "@/utils/api/checkout/checkout.interface";
import type { ParamCalculateTotal, ParamPostCartItem } from "@/utils/api/cart/cart.interface";
import { DEMO_AUTH_COOKIE_NAME, DEMO_CUSTOMER, isDemoSession } from "@/mock-api/demo-account";

type RouteContext = { params: Promise<{ path: string[] }> };
type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type MockResult = { data: unknown; state?: MockState; status?: number };
const notFound = (): MockResult => ({ data: { code: "NOT_FOUND", message: "Không tìm thấy dữ liệu demo" }, status: 404 });
const badRequest = (message: string): MockResult => ({ data: { code: "INVALID_DEMO_REQUEST", message }, status: 400 });
const getState = (request: NextRequest): MockState => readMockState(request.cookies.get(MOCK_STATE_COOKIE)?.value);

const getCatalogCards = (request: NextRequest): ReturnType<typeof getMockProductCards> => {
  const params = request.nextUrl.searchParams;
  const query = params.get("search")?.toLocaleLowerCase("vi") ?? "";
  const selectedIds = params.get("productIds")?.split(",").filter(Boolean) ?? [];
  const category = params.get("categorySlug")?.toLocaleLowerCase("vi") ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const take = Math.max(1, Number(params.get("take")) || MOCK_PRODUCTS.length);
  let list = MOCK_PRODUCTS.filter((product) => product.name.toLocaleLowerCase("vi").includes(query));
  if (selectedIds.length) list = list.filter((product) => selectedIds.includes(product.productId));
  if (category.includes("charm")) list = list.filter((product) => product.name.toLowerCase().includes("charm"));
  if (category.includes("hoa-tai")) list = list.filter((product) => product.name.toLowerCase().includes("hoa tai"));
  if (category.includes("day-chuyen")) list = list.filter((product) => product.name.toLowerCase().includes("chuyền"));
  if (selectedIds.length) list.sort((left, right) => selectedIds.indexOf(left.productId) - selectedIds.indexOf(right.productId));
  const total = list.length;
  const totalPage = Math.max(1, Math.ceil(total / take));
  return {
    total,
    list: list.slice((page - 1) * take, page * take),
    pagination: {
      total,
      currentPage: page,
      nextPage: page < totalPage,
      previousPage: page > 1,
      hasNextPage: page < totalPage,
      hasPreviousPage: page > 1,
      totalPage,
    },
    pricePresentation: { showDiscountPercent: true },
  };
};

const getCatalog = (path: string, request: NextRequest): MockResult | null => {
  if (path === "review/product-reviews") return { data: { total: 0, list: [], pagination: getMockProductCards().pagination } };
  if (path.startsWith("review/product-reviews/stats/")) return { data: { totalReviews: 0, averageRating: 0, ratingBreakdown: {} } };
  if (["catalog/products", "catalog/products/recently-viewed", "catalog/products/related"].includes(path))
    return { data: getCatalogCards(request) };
  if (path === "catalog/products/filters") return { data: [] };
  if (path === "catalog/search") {
    const query = request.nextUrl.searchParams.get("search")?.toLocaleLowerCase("vi") ?? "";
    const list = MOCK_PRODUCTS.filter((product) => product.name.toLocaleLowerCase("vi").includes(query)).map(getMockLegacyProduct);
    return {
      data: {
        total: list.length,
        list,
        pagination: {
          total: list.length,
          currentPage: 1,
          nextPage: false,
          previousPage: false,
          hasNextPage: false,
          hasPreviousPage: false,
          totalPage: 1,
        },
      },
    };
  }
  if (path === "catalog/search/landing") return { data: MOCK_PRODUCTS.slice(0, 6).map(getMockLegacyProduct) };
  if (path === "catalog/search/trending") return { data: ["charm", "dây chuyền", "hoa tai"] };
  if (path === "catalog/search/history" || path === "catalog/search/suggestions") return { data: [] };
  if (path.startsWith("catalog/product-info/")) return { data: [] };
  if (!path.startsWith("catalog/products/")) return null;
  const product = getMockProductDetail(path.split("/")[2] ?? "");
  if (!product) return notFound();
  const base = { productId: product.id, productSlug: product.slug, source: "MOCK" };
  if (path.endsWith("/variations"))
    return {
      data: {
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          status: product.status,
          isPurchasable: true,
          image: product.gallery[0]?.url ?? "",
          imageHover: product.gallery[0]?.url ?? "",
          brandName: product.brand.name,
          categoryName: product.category.name,
        },
        attributes: [],
        variations: product.variants.map((variant) => ({
          id: variant.id,
          skuCode: variant.sku,
          name: variant.name,
          slug: variant.slug,
          sellingPriceAfterTaxMinor: String(variant.pricing?.sellingPriceAfterTaxMinor ?? 0),
          compareAtPriceAfterTaxMinor: String(variant.pricing?.compareAtPriceAfterTaxMinor ?? 0),
          customerDisplayPrice: variant.pricing?.customerDisplayPrice,
          stock: variant.stock,
          stockStatus: variant.stockStatus,
          status: "ACTIVE",
          image: variant.image,
          imageHover: variant.image,
          attributeValues: [],
        })),
      },
    };
  if (path.endsWith("/gifts")) return { data: { ...base, items: [] } };
  if (path.endsWith("/promotions")) return { data: { ...base, vouchers: [] } };
  if (path.endsWith("/related") || path.endsWith("/mix-match")) return { data: { ...base, items: [] } };
  if (path.endsWith("/reviews-summary")) return { data: { ...base, averageRating: 0, reviewCount: 0, breakdown: {} } };
  return { data: product };
};

const getCommerce = (path: string, state: MockState, request: NextRequest): MockResult | null => {
  if (path === "iam/customer/profile") {
    return isDemoSession(request.cookies.get(DEMO_AUTH_COOKIE_NAME)?.value)
      ? { data: DEMO_CUSTOMER }
      : { data: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" }, status: 401 };
  }
  if (path === "cart/cart") return { data: getMockCartItems(state.cart) };
  if (path === "cart/cart/recommendation") return { data: { total: 0, list: [], pagination: getMockProductCards().pagination } };
  if (path === "iam/addresses") return { data: { total: 0, list: [] } };
  if (path === "iam/location/provinces")
    return {
      data: {
        list: [
          {
            id: "79",
            code: 79,
            name: "Thành phố Hồ Chí Minh",
            codename: "thanh_pho_ho_chi_minh",
            divisionType: "thành phố",
            phoneCode: 28,
          },
        ],
      },
    };
  if (/^iam\/location\/provinces\/\d+\/wards$/.test(path))
    return {
      data: {
        list: [
          {
            id: "26734",
            code: 26734,
            name: "Phường Bến Thành",
            codename: "phuong_ben_thanh",
            divisionType: "phường",
            shortCodename: "ben_thanh",
            provinceCode: 79,
          },
        ],
      },
    };
  if (path.startsWith("order/checkout/") && state.session?.id === path.split("/")[2])
    return { data: getMockCheckoutSession(state.session) };
  if (path === "order/orders/me") {
    const allOrders = getMockOrderList(state.orders);
    const filter = request.nextUrl.searchParams.get("status");
    const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase();
    const list = allOrders.list.filter(
      (order) => (!filter || order.status === filter) && (!search || order.orderCode.toLowerCase().includes(search)),
    );
    return { data: { ...allOrders, total: list.length, list } };
  }
  if (path.startsWith("order/orders/me/")) {
    const order = state.orders.find((item) => item.code === path.split("/")[3]);
    return order ? { data: getMockOrderDetail(order) } : notFound();
  }
  if (path.startsWith("order/orders/") && path.endsWith("/payment-status")) {
    const order = state.orders.find((item) => item.code === path.split("/")[2]);
    return order
      ? {
          data: {
            orderCode: order.code,
            orderStatus: "Pending",
            paymentStatus: "Unpaid",
            paymentMethod: "COD",
            grandTotal: getMockOrderDetail(order).grandTotal,
            orderExpiresAt: null,
            orderRemainingSeconds: null,
            paymentLink: null,
            paymentLinkExpiresAt: null,
            paymentLinkStatus: null,
            displayState: "COD_CONFIRMED",
          },
        }
      : notFound();
  }
  if (path === "product/customer/wishlist/product-ids") return { data: { productIds: state.wishlist } };
  if (path === "product/customer/wishlist")
    return {
      data: {
        total: state.wishlist.length,
        list: state.wishlist.flatMap((id) => {
          const product = findMockProduct(id);
          return product ? [getMockLegacyProduct(product)] : [];
        }),
      },
    };
  if (path.startsWith("product/customer/wishlist/")) return { data: { isWished: state.wishlist.includes(path.split("/")[3] ?? "") } };
  return null;
};

const getContent = (path: string): MockResult | null => {
  if (path.startsWith("cms/storefront/pages/")) return { data: getMockStorefrontPage(path.replace("cms/storefront/pages/", "")) };
  if (path.startsWith("banner/storefront/placements/code/"))
    return { data: getMockBannerPlacement(path.replace("banner/storefront/placements/code/", "").replace("/render", "")) };
  if (path === "cms/storefront/navigation" || path === "cms/storefront/navigation/plp-rail") return { data: getMockStorefrontNavigation() };
  if (path === "cms/storefront/global-config") return { data: getMockStorefrontGlobalConfig() };
  if (path === "cms/storefront/logo/v2") return { data: getMockStorefrontLogos() };
  return null;
};

const handleGet = (request: NextRequest, path: string, state: MockState): MockResult =>
  getCatalog(path, request) ?? getCommerce(path, state, request) ?? getContent(path) ?? notFound();

const handleCheckoutPost = (path: string, body: unknown, state: MockState): MockResult | null => {
  if (path === "order/checkout/initiate") {
    const session = initiateMockCheckout(body as InitiateCheckoutPayload);
    return session.lines.length
      ? { data: getMockCheckoutSession(session), state: { ...state, session } }
      : badRequest("Giỏ hàng chưa có sản phẩm");
  }
  if (path.endsWith("/place-order") && state.session?.id === path.split("/")[2]) {
    const order = placeMockOrder(state.session, body as PlaceOrderPayload);
    if (!order) return badRequest("Vui lòng nhập địa chỉ và chọn thanh toán khi nhận hàng");
    return {
      data: {
        orderId: order.code,
        orderCode: order.code,
        status: "success",
        paymentMethod: "COD",
        guestOrderAccess: { token: `demo_${order.code}`, expiresAt: "2099-12-31T00:00:00.000Z" },
      },
      state: { ...state, cart: [], session: undefined, orders: [order, ...state.orders].slice(0, 5) },
    };
  }
  return null;
};

const handlePost = (path: string, body: unknown, state: MockState): MockResult => {
  if (path === "cart/cart") {
    const nextState = updateMockCart(state, body as ParamPostCartItem);
    return { data: { success: true, items: getMockCartItems(nextState.cart) }, state: nextState };
  }
  if (path === "cart/cart/merge") return { data: { success: true, items: getMockCartItems(state.cart) } };
  if (path === "cart/cart/calculate-total")
    return {
      data: getMockCartTotal(
        (body as ParamCalculateTotal).items.flatMap((item) =>
          "variationId" in item ? [{ variationId: item.variationId, quantity: item.quantity }] : [],
        ),
      ),
    };
  if (path === "order/orders/guest-access") {
    const token = (body as { token?: string }).token ?? "";
    const order = state.orders.find((item) => token === `demo_${item.code}`);
    if (!order) return notFound();
    const detail = getMockOrderDetail(order);
    return {
      data: {
        ...detail,
        id: undefined,
        customerId: undefined,
        source: undefined,
        errorLog: undefined,
        accessExpiresAt: "2099-12-31T00:00:00.000Z",
      },
    };
  }
  if (path === "order/orders/lookup") {
    const order = state.orders.find((item) => item.code === (body as { orderCode?: string }).orderCode);
    return order ? { data: getMockOrderDetail(order) } : notFound();
  }
  if (path === "order/orders/warehouses/nearest")
    return {
      data: {
        phone: "0280000000",
        wardCode: 26734,
        wardName: "Phường Bến Thành",
        addressLine: "Quận 1",
        warehouseId: "demo-warehouse",
        provinceCode: 79,
        provinceName: "Thành phố Hồ Chí Minh",
        warehouseName: "Kho demo",
      },
    };
  if (path === "order/orders/services/with-leadtime")
    return {
      data: [
        {
          carrier: "DEMO",
          carrierCode: "DEMO",
          serviceId: 1,
          serviceTypeId: 1,
          shortName: "Giao hàng tiêu chuẩn",
          totalFee: MOCK_SHIPPING_FEE,
        },
      ],
    };
  if (path === "order/orders/fee/calculate") return { data: { total: MOCK_SHIPPING_FEE } };
  if (path.endsWith("/promotion-vouchers/discover")) return { data: { sections: [] } };
  if (path.endsWith("/promotion-vouchers/validate-code"))
    return { data: { valid: false, reasonCode: "NOT_FOUND", reasonCodes: ["NOT_FOUND"], message: "Mã voucher chưa có trong bản demo" } };
  if (path === "product/customer/wishlist") {
    const ids = (body as { productIds?: string[] }).productIds ?? [];
    return { data: { success: true }, state: { ...state, wishlist: [...new Set([...state.wishlist, ...ids])] } };
  }
  if (path === "catalog/products/recently-viewed") return { data: { success: true } };
  if (path === "badge/storefront/products/badges") return { data: {} };
  if (path.startsWith("badge/storefront/products/") && path.endsWith("/badges")) return { data: {} };
  if (path.startsWith("customer-request/")) return { data: { success: true } };
  return handleCheckoutPost(path, body, state) ?? notFound();
};

const handlePut = (path: string, body: unknown, state: MockState): MockResult => {
  if (!state.session || !path.startsWith(`order/checkout/${state.session.id}/`)) return notFound();
  if (path.endsWith("/shipping-address")) {
    const address = (body as UpdateShippingAddressPayload).shippingAddress;
    if (!address) return badRequest("Vui lòng nhập địa chỉ giao hàng");
    const session = { ...state.session, address };
    return { data: getMockCheckoutSession(session), state: { ...state, session } };
  }
  if (path.endsWith("/pricing-context")) {
    const context = body as UpdatePricingContextPayload;
    const session = { ...state.session, shippingFee: context.shippingFee ?? state.session.shippingFee };
    return { data: getMockCheckoutSession(session), state: { ...state, session } };
  }
  return notFound();
};

const handleDelete = (path: string, body: unknown, state: MockState): MockResult => {
  if (path === "product/customer/wishlist") {
    const ids = (body as { productIds?: string[] }).productIds ?? [];
    return { data: { success: true }, state: { ...state, wishlist: state.wishlist.filter((id) => !ids.includes(id)) } };
  }
  if (path === "catalog/search/history") return { data: { success: true } };
  return notFound();
};

const respond = (result: MockResult): NextResponse => {
  const response = NextResponse.json(result.data, { status: result.status ?? 200 });
  if (result.state)
    response.cookies.set(MOCK_STATE_COOKIE, JSON.stringify(result.state), {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    });
  return response;
};

async function dispatch(request: NextRequest, context: RouteContext, method: Method): Promise<NextResponse> {
  const path = (await context.params).path.join("/");
  const state = getState(request);
  if (method === "GET") return respond(handleGet(request, path, state));
  const body: unknown = await request.json().catch(() => ({}));
  if (method === "POST") return respond(handlePost(path, body, state));
  if (method === "PUT") return respond(handlePut(path, body, state));
  if (method === "DELETE") return respond(handleDelete(path, body, state));
  return respond(notFound());
}

export const GET = (request: NextRequest, context: RouteContext) => dispatch(request, context, "GET");
export const POST = (request: NextRequest, context: RouteContext) => dispatch(request, context, "POST");
export const PUT = (request: NextRequest, context: RouteContext) => dispatch(request, context, "PUT");
export const PATCH = (request: NextRequest, context: RouteContext) => dispatch(request, context, "PATCH");
export const DELETE = (request: NextRequest, context: RouteContext) => dispatch(request, context, "DELETE");
