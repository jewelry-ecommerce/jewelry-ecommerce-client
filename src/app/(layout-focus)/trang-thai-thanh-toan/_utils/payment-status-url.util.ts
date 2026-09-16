export const PAYMENT_STATUS_PATH = "/trang-thai-thanh-toan" as const;

export const CONFIRM_PAYMENT_PATH = "/xac-nhan-thanh-toan" as const;

const ORDER_CODE_QUERY_KEY = "orderCode";

/**
 * URL trang xác nhận / đổi phương thức thanh toán — không đưa mã đơn lên query.
 * orderCode phải được persist vào sessionStorage (`latest_order`) trước khi điều hướng.
 */
export function buildChangePaymentMethodUrl(): string {
  return `${CONFIRM_PAYMENT_PATH}?from=update-payment-method`;
}

/**
 * Build URL trang trạng thái thanh toán — không đưa mã đơn lên query.
 * orderCode phải nằm trong sessionStorage (`latest_order`).
 */
export function buildPaymentStatusUrl(params: Record<string, string | null | undefined> = {}): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === ORDER_CODE_QUERY_KEY) continue;
    if (value == null) continue;

    const trimmed = String(value).trim();
    if (!trimmed) continue;

    search.set(key, trimmed);
  }

  const qs = search.toString();
  return qs ? `${PAYMENT_STATUS_PATH}?${qs}` : PAYMENT_STATUS_PATH;
}

export function stripOrderCodeFromPaymentStatusHref(pathnameWithSearch: string): string {
  if (typeof window === "undefined") return pathnameWithSearch;

  try {
    const url = new URL(pathnameWithSearch, window.location.origin);
    if (!url.searchParams.has(ORDER_CODE_QUERY_KEY)) return `${url.pathname}${url.search}${url.hash}`;

    url.searchParams.delete(ORDER_CODE_QUERY_KEY);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return pathnameWithSearch;
  }
}
