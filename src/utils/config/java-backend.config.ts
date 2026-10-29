
export const isJavaBackend = (): boolean => process.env.NEXT_PUBLIC_BACKEND_PROVIDER?.toUpperCase() === 'JAVA';
export function getJavaHttpStatus(payload: unknown, httpStatus: number): number {
  if (!payload || typeof payload !== 'object' || !('status' in payload)) return httpStatus;
  return typeof payload.status === 'number' && payload.status >= 400 && payload.status <= 599
    ? payload.status : httpStatus;
}
export function javaApiPath(path: string): string {
  const normalized = path.replace(/^\//, '');
  const aliases: Record<string, string> = {
    'iam/customer/login': 'auth/login', 'iam/customer/refresh': 'auth/refresh',
    'iam/customer/profile': 'storefront/me', 'iam/customer/check-phone': 'storefront/auth/resolve-phone',
    'iam/customer/send-otp': 'storefront/auth/register/send-otp',
    'iam/customer/verify-otp-register': 'storefront/auth/register/verify-otp',
    'iam/customer/complete-otp-login-profile': 'storefront/auth/register/complete',
    'iam/customer/forgot-password': 'storefront/auth/forgot-password',
    'iam/customer/reset-password': 'storefront/auth/reset-password',
    'catalog/categories': 'storefront/product/categories', 'catalog/products': 'storefront/product',
    'catalog/search': 'storefront/product', 'iam/addresses': 'storefront/me/addresses',
    'catalog/search/trending': 'storefront/product/search/trending',
    'catalog/search/suggestions': 'storefront/product/search/suggestions',
    'catalog/search/history': 'storefront/product/search/history',
    'catalog/search/history/keyword': 'storefront/product/search/history/keyword',
    'order/orders/me': 'storefront/order'
  };
  if (aliases[normalized]) return aliases[normalized];
  for (const [prefix, target] of [
    ['cart/cart', 'storefront/cart/cart'], ['product/customer/wishlist', 'storefront/product/customer/wishlist'],
    ['order/orders/me/', 'storefront/order/'], ['iam/addresses/', 'storefront/me/addresses/'],
    ['catalog/products/', 'storefront/product/'], ['cms/storefront/pages/', 'storefront/cms/pages/'],
    ['banner/storefront/placements/', 'storefront/banner/placements/'], ['customer-requests/', 'storefront/customer-request/']
  ]) if (normalized.startsWith(prefix)) return target + normalized.slice(prefix.length);
  return normalized;
}
export function unwrapJavaResponse(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object' || !('status' in payload)) return payload;
  if (typeof payload.status !== 'number' || payload.status < 200 || payload.status >= 300) return payload;
  return normalizeJavaPage('data' in payload ? payload.data : null);
}
export function normalizeJavaPage(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object' || !('content' in payload) || !Array.isArray(payload.content)) return payload;
  if (!('page' in payload) || !('totalElements' in payload) || !('totalPages' in payload)) return payload;
  const currentPage = Number(payload.page), total = Number(payload.totalElements), totalPage = Number(payload.totalPages);
  return { list: payload.content, total, pagination: { total, currentPage, totalPage,
    hasNextPage: currentPage < totalPage, hasPreviousPage: currentPage > 1,
    nextPage: currentPage < totalPage, previousPage: currentPage > 1 } };
}
