import {
  ORDER_DETAIL_BASE_PATH,
  buildOrderDetailPath,
  persistOrderDetailContext,
  type OrderDetailContext,
} from "@/utils/order/order-detail-context.util";

export type OrderReturnRequestFlow = "refund" | "exchange";

function appendSearchQuery(path: string, searchQuery?: string): string {
  const query = searchQuery?.replace(/^\?/, "").trim();
  if (!query) return path;
  return path.includes("?") ? `${path}&${query}` : `${path}?${query}`;
}

function persistContextForNavigation(orderCode: string, options?: { source?: string | null; trackingPhone?: string | null }): void {
  const context: OrderDetailContext = {
    orderCode,
    ...(options?.source === "tracking" ? { source: "tracking" } : {}),
    ...(options?.trackingPhone?.trim() ? { trackingPhone: options.trackingPhone.trim() } : {}),
  };
  persistOrderDetailContext(context);
}

/** Form tạo yêu cầu đổi hàng / hoàn tiền. */
export function buildOrderReturnRequestHref(
  orderCode: string,
  flow: OrderReturnRequestFlow,
  searchQuery?: string,
  options?: { source?: string | null; trackingPhone?: string | null },
): string {
  persistContextForNavigation(orderCode, options);
  const path = flow === "exchange" ? `${ORDER_DETAIL_BASE_PATH}/yeu-cau-doi-hang` : `${ORDER_DETAIL_BASE_PATH}/yeu-cau-hoan-tien`;
  return appendSearchQuery(path, searchQuery);
}

/** Chi tiết đơn hàng gốc (sau khi gửi yêu cầu đổi/trả hoặc breadcrumb). */
export function buildOrderDetailHref(
  orderCode: string,
  options?: { source?: string | null; trackingPhone?: string | null; searchQuery?: string },
): string {
  persistContextForNavigation(orderCode, options);
  return buildOrderDetailPath({
    source: options?.source,
    searchQuery: options?.searchQuery,
  });
}

export interface BuildOrderReturnDetailHrefOptions {
  orderReturnCode?: string | null;
  orderReturnId?: string | null;
}

/** Đường dẫn xem chi tiết yêu cầu đổi / trả. */
export function buildOrderReturnExchangeDetailHref(
  orderCode: string,
  searchQuery?: string,
  ref?: string | null | BuildOrderReturnDetailHrefOptions,
  options?: { source?: string | null; trackingPhone?: string | null },
): string {
  persistContextForNavigation(orderCode, options);
  const base = `${ORDER_DETAIL_BASE_PATH}/chi-tiet-doi-tra-hoan-tien`;
  const parts: string[] = [];
  const query = searchQuery?.replace(/^\?/, "").trim();
  if (query) parts.push(query);

  const opts: BuildOrderReturnDetailHrefOptions = ref != null && typeof ref === "object" ? ref : { orderReturnCode: ref ?? undefined };

  if (opts.orderReturnCode) {
    parts.push(`orderReturnCode=${encodeURIComponent(opts.orderReturnCode)}`);
  } else if (opts.orderReturnId) {
    parts.push(`orderReturnId=${encodeURIComponent(opts.orderReturnId)}`);
  }

  return parts.length ? `${base}?${parts.join("&")}` : base;
}

/** Sau khi tạo yêu cầu: ưu tiên returnCode, không có thì dùng id. */
export function buildOrderReturnDetailHrefAfterCreate(
  orderCode: string,
  searchQuery: string | undefined,
  created: { id: string; returnCode?: string | null; orderReturnCode?: string | null },
  options?: { source?: string | null; trackingPhone?: string | null },
): string {
  const returnCode = created.returnCode?.trim() || created.orderReturnCode?.trim();
  if (returnCode) {
    return buildOrderReturnExchangeDetailHref(orderCode, searchQuery, { orderReturnCode: returnCode }, options);
  }
  if (created.id) {
    return buildOrderReturnExchangeDetailHref(orderCode, searchQuery, { orderReturnId: created.id }, options);
  }
  return buildOrderReturnExchangeDetailHref(orderCode, searchQuery, undefined, options);
}
