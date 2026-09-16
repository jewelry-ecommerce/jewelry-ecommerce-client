export const VIETNAMESE_ROUTE_MAP = {
  "/home": "/trang-chu",
  "/products": "/san-pham",
  "/cart": "/gio-hang",
  "/checkout": "/thanh-toan",
  "/account": "/tai-khoan",
  "/categories": "/danh-muc",
  "/order-tracking": "/theo-doi-don-hang",
  "/about-us": "/ve-chung-toi",
  "/register": "/dang-ky",
  "/login": "/dang-nhap",
} as const;

export const APP_STATIC_PATHS = [
  "/",
  "/trang-chu",
  "/san-pham",
  "/danh-muc",
  "/gio-hang",
  "/thanh-toan",
  "/tai-khoan",
  "/dang-ky",
  "/dang-nhap",
  "/email-giao-dich",
  "/quen-mat-khau",
  "/san-pham-yeu-thich",
  "/tim-kiem",
  "/tra-cuu-don-hang",
  "/trang-thai-thanh-toan",
  "/ve-chung-toi",
  "/xac-nhan-thanh-toan",
] as const;

const EXTRA_RESERVED_SLUGS = ["transaction-email"] as const;

export const CMS_RESERVED_SLUGS = new Set(
  [...APP_STATIC_PATHS, ...Object.keys(VIETNAMESE_ROUTE_MAP), ...EXTRA_RESERVED_SLUGS.map((slug) => `/${slug}`)]
    .filter((path) => path !== "/")
    .map((path) => path.replace(/^\//, "")),
);

export const ROBOTS_ALLOWED_PATHS = [
  ...APP_STATIC_PATHS,
  ...Object.values(VIETNAMESE_ROUTE_MAP),
  ...Object.keys(VIETNAMESE_ROUTE_MAP),
  "/san-pham/*",
  "/danh-muc/*",
  "/products/*",
  "/categories/*",
] as const;

export const ROBOTS_DISALLOW_PATHS = [
  "/api",
  "/_next",
  "/admin",
  "/email-giao-dich",
  "/transaction-email",
  "/theo-doi-don-hang",
  "/order-tracking",
] as const;
