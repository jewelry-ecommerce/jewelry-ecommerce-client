export const ORDER_DETAIL_CONTEXT_STORAGE_KEY = "order_detail_context_v1";
export const ORDER_DETAIL_BASE_PATH = "/don-hang/chi-tiet";

export interface OrderDetailContext {
  orderCode: string;
  source?: "tracking";
  trackingPhone?: string;
  orderId?: string;
}

export interface BuildOrderDetailPathOptions {
  source?: string | null;
  from?: string | null;
  searchQuery?: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function persistOrderDetailContext(context: OrderDetailContext): void {
  if (!isBrowser() || !context.orderCode.trim()) return;

  try {
    sessionStorage.setItem(
      ORDER_DETAIL_CONTEXT_STORAGE_KEY,
      JSON.stringify({
        orderCode: context.orderCode.trim(),
        ...(context.source === "tracking" ? { source: "tracking" as const } : {}),
        ...(context.trackingPhone?.trim() ? { trackingPhone: context.trackingPhone.trim() } : {}),
        ...(context.orderId?.trim() ? { orderId: context.orderId.trim() } : {}),
      }),
    );
  } catch {
    // sessionStorage may be unavailable in private browsing
  }
}

export function readOrderDetailContext(): OrderDetailContext | null {
  if (!isBrowser()) return null;

  try {
    const raw = sessionStorage.getItem(ORDER_DETAIL_CONTEXT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<OrderDetailContext>;
    const orderCode = typeof parsed.orderCode === "string" ? parsed.orderCode.trim() : "";
    if (!orderCode) return null;

    return {
      orderCode,
      ...(parsed.source === "tracking" ? { source: "tracking" as const } : {}),
      ...(typeof parsed.trackingPhone === "string" && parsed.trackingPhone.trim() ? { trackingPhone: parsed.trackingPhone.trim() } : {}),
      ...(typeof parsed.orderId === "string" && parsed.orderId.trim() ? { orderId: parsed.orderId.trim() } : {}),
    };
  } catch {
    return null;
  }
}

export function clearOrderDetailContext(): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.removeItem(ORDER_DETAIL_CONTEXT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function buildOrderDetailPath(options?: BuildOrderDetailPathOptions): string {
  const params = new URLSearchParams();
  if (options?.source === "tracking") params.set("source", "tracking");
  if (options?.from?.trim()) params.set("from", options.from.trim());

  const extraQuery = options?.searchQuery?.replace(/^\?/, "").trim();
  if (extraQuery) {
    const extra = new URLSearchParams(extraQuery);
    extra.forEach((value, key) => params.set(key, value));
  }

  const query = params.toString();
  return query ? `${ORDER_DETAIL_BASE_PATH}?${query}` : ORDER_DETAIL_BASE_PATH;
}

export function buildOrderDetailNavigation(context: OrderDetailContext, options?: BuildOrderDetailPathOptions): string {
  persistOrderDetailContext(context);
  return buildOrderDetailPath({
    ...options,
    source: options?.source ?? context.source ?? null,
  });
}
