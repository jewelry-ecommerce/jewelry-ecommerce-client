/**
 * Mọi response phụ thuộc cookie / phiên phải gửi header này.
 * Nếu không, reverse proxy (nginx proxy_cache, v.v.) có thể cache theo URL-only
 * và máy khác nhận JSON profile của user vừa gọi trước đó.
 */
export const SESSION_SENSITIVE_HEADERS: Record<string, string> = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  Vary: "Cookie, Authorization",
};
