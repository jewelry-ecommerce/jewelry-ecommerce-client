const USER_SCOPED_SWR_KEY_PREFIXES = ["orders-me-infinite", "orders-me", "header-user-orders-count", "customer-profile"] as const;

const ORDERS_ME_KEY_SCOPES = new Set(["orders-me", "orders-me-infinite"]);

export function isUserScopedSwrKey(key: unknown): boolean {
  if (key === "customer-profile") {
    return true;
  }

  if (typeof key === "string") {
    return USER_SCOPED_SWR_KEY_PREFIXES.some((prefix) => key === prefix || key.startsWith(`${prefix}/`));
  }

  if (!Array.isArray(key) || key.length === 0) {
    return false;
  }

  const scope = key[0];
  return typeof scope === "string" && USER_SCOPED_SWR_KEY_PREFIXES.includes(scope as (typeof USER_SCOPED_SWR_KEY_PREFIXES)[number]);
}

/**
 * Match keys của list lịch sử đơn (useSWRInfinite) — gồm page keys và meta `$inf$` của SWR.
 * Không match `$inf$` → hủy đơn xong back list vẫn đọc cache cũ.
 */
export function isOrdersMeSwrKey(key: unknown): boolean {
  if (typeof key === "string") {
    if (key.includes("orders-me-infinite") || key.startsWith("orders-me")) return true;
    return false;
  }

  if (!Array.isArray(key) || key.length === 0) return false;

  const scope = key[0];
  if (typeof scope === "string" && ORDERS_ME_KEY_SCOPES.has(scope)) return true;

  // SWR Infinite meta: ["$inf$", firstPageKey] hoặc serialize string chứa scope
  if (scope === "$inf$") return isOrdersMeSwrKey(key[1]);

  return false;
}

export function isOrderDetailSwrKey(key: unknown, orderCode: string): boolean {
  const normalized = orderCode.trim();
  if (!normalized || typeof key !== "string") return false;
  return key.startsWith(`order/${normalized}`);
}

/** Guest retail (`guest-order-access:…`) + guest pre-order (`pre-order-guest-access:…`). */
export function isGuestOrderAccessSwrKey(key: unknown): boolean {
  if (typeof key !== "string") return false;
  return key.startsWith("guest-order-access:") || key.startsWith("pre-order-guest-access:");
}

/** Invalidate list lịch sử + chi tiết đơn + guest-access sau hủy / thanh toán / đổi trạng thái. */
export function revalidateOrderRelatedCaches(
  mutateSwr: (filter: (key: unknown) => boolean, data?: unknown, opts?: { revalidate?: boolean }) => Promise<unknown>,
  orderCode: string,
) {
  const normalized = orderCode.trim();
  return mutateSwr(
    (key) => isOrdersMeSwrKey(key) || Boolean(normalized && isOrderDetailSwrKey(key, normalized)) || isGuestOrderAccessSwrKey(key),
    undefined,
    { revalidate: true },
  );
}

/**
 * Drop cached customer data so the next login cannot reuse another account's responses.
 * No-op on server: SWR `react-server` export has no `mutate`, and cache only exists in the browser.
 */
export async function clearUserScopedSwrCache() {
  if (typeof window === "undefined") return;
  const { mutate } = await import("swr");
  return mutate(isUserScopedSwrKey, undefined, { revalidate: false });
}
