# 📡 API Documentation — `src/utils/api`

## Tổng quan

Thư mục này chứa tất cả các hàm gọi API từ phía client (browser) sử dụng **Axios**. Dự án sử dụng 2 axios instance:

- **`commonAxios`**: Không cần xác thực, dùng cho các API public. Base URL: `API_BE_URL` (env).
- **`authAxios`**: Yêu cầu `Bearer accessToken` trong header, có cơ chế **auto-refresh token** khi nhận `statusCode: 777`. Base URL: `API_BE_URL` (env).

---

## 📁 Cấu trúc thư mục

```
src/utils/api/
├── index.ts                    # Re-export tất cả API modules
├── filter.mock.ts              # Mock data cho sort options
├── auth/                       # Xác thực & quản lý user
│   ├── auth.api.ts
│   ├── auth.enum.ts
│   ├── auth.interface.ts
│   ├── index.ts
│   └── readme.md
├── banner/                     # Banner & placement
│   ├── banner.api.ts
│   ├── banner.enum.ts
│   ├── banner.interface.ts
│   └── index.ts
├── cart/                        # Giỏ hàng — chi tiết: docs/cart-architecture.md
│   ├── cart.api.ts
│   ├── cart-mutation.util.ts    # persistCartLines (POST + sync)
│   ├── cart-view-item-builder.util.ts
│   ├── guest-cart-id.util.ts
│   ├── cart.enum.ts
│   ├── cart.interface.ts
│   ├── cart.util.ts
│   └── index.ts
├── category/                    # Danh mục sản phẩm
│   ├── category.api.ts
│   └── category.interface.ts
├── checkout/                    # Thanh toán & địa chỉ
│   ├── checkout.api.ts
│   └── checkout.interface.ts
├── cms/                         # Quản lý nội dung
│   ├── cms.api.ts
│   ├── cms.enum.ts
│   ├── cms.interface.ts
│   └── index.ts
├── promotion/                   # Khuyến mãi & voucher
│   ├── promotion.api.ts
│   ├── promotion.enum.ts
│   ├── promotion.interface.ts
│   └── index.ts
└── product/                     # Sản phẩm
    ├── product.api.ts
    ├── product.enum.ts
    └── product.interface.ts
```

---

## 0. Promotion API (`promotion/promotion.api.ts`)

Voucher khuyến mãi tại trang checkout — yêu cầu Bearer token (`authAxios`), chỉ dùng khi user đã đăng nhập.

| Hàm                            | Method | Endpoint                                     | Auth | Request Type                          | Response Type                          | Mô tả                                                         |
| ------------------------------ | ------ | -------------------------------------------- | ---- | ------------------------------------- | -------------------------------------- | ------------------------------------------------------------- |
| `discoverPromotionVouchers`    | POST   | `promotion/promotion-vouchers/discover`      | ✅   | —                                     | `DiscoverPromotionVouchersResponse`    | Lấy danh sách voucher khả dụng, phân nhóm theo `sections`     |
| `validatePromotionVoucherCode` | POST   | `promotion/promotion-vouchers/validate-code` | ✅   | `ValidatePromotionVoucherCodeRequest` | `ValidatePromotionVoucherCodeResponse` | Kiểm tra mã voucher nhập tay; trả `valid` + `card` khi hợp lệ |

### Enums (`promotion.enum.ts`)

- `PromotionVoucherSchemaType`: `MARKDOWN`
- `PromotionVoucherStatus`: `ACTIVE`
- `PromotionVoucherDisabledReason`: `PROMOTION_VOUCHER_CODE_DISABLED`
- `PromotionVoucherReasonCode`: `PROMOTION_VOUCHER_VALID`
- `PromotionVoucherGroupType`: `PROMOTION`

---

## 1. 🔐 Auth API (`auth/auth.api.ts`)

Quản lý xác thực người dùng (đăng ký, đăng nhập, quên mật khẩu, đổi mật khẩu, đổi SĐT...).

| Hàm                             | Method | Endpoint                                 | Auth | Request Type                       | Response Type                     | Mô tả                                       |
| ------------------------------- | ------ | ---------------------------------------- | ---- | ---------------------------------- | --------------------------------- | ------------------------------------------- |
| `sendOtpRegister`               | POST   | `iam/customer/send-otp`                  | ❌   | `SendOtpRegisterRequest`           | `SendOtpRegisterResponse`         | Gửi OTP đăng ký (phone + type)              |
| `verifyOtpRegister`             | POST   | `iam/customer/verify-otp-register`       | ❌   | `VerifyOtpRegisterRequest`         | `VerifyOtpRegisterResponse`       | Xác thực OTP đăng ký, trả về user + tokens  |
| `login`                         | POST   | `iam/customer/login`                     | ❌   | `LoginRequest`                     | `LoginResponse`                   | Đăng nhập (phone + password), trả về tokens |
| `logout`                        | POST   | `iam/customer/logout`                    | ❌   | —                                  | `LogoutResponse`                  | Đăng xuất session hiện tại                  |
| `logoutAll`                     | POST   | `iam/customer/logout-all`                | ❌   | —                                  | `LogoutResponse`                  | Đăng xuất tất cả session                    |
| `changePassword`                | POST   | `iam/customer/change-password`           | ❌   | `ChangePasswordRequest`            | `LogoutResponse`                  | Đổi mật khẩu (cần current + new password)   |
| `forgotPassword`                | POST   | `iam/customer/forgot-password`           | ❌   | `ForgotPasswordRequest`            | `SendOtpRegisterResponse`         | Gửi OTP quên mật khẩu                       |
| `verifyOtpForgotPassword`       | POST   | `iam/customer/verify-otp-reset-password` | ❌   | `VerifyOtpForgotPasswordRequest`   | `VerifyOtpForgotPasswordResponse` | Xác thực OTP quên MK, trả resetToken        |
| `resetPassword`                 | POST   | `iam/customer/reset-password`            | ❌   | `ResetPasswordRequest`             | `ResetPasswordResponse`           | Reset mật khẩu bằng resetToken              |
| `getCustomerProfile`            | GET    | `iam/customer/profile`                   | ✅   | —                                  | `AuthUser`                        | Lấy thông tin profile                       |
| `postCustomerRefresh`           | POST   | `iam/customer/refresh`                   | ❌   | `RefreshTokenRequest`              | `RefreshTokenResponse`            | Refresh accessToken                         |
| `patchCustomerProfile`          | PATCH  | `iam/customer/profile`                   | ✅   | `AuthUserRequest`                  | `void`                            | Cập nhật profile                            |
| `postCustomerChangePassword`    | POST   | `iam/customer/change-password`           | ✅   | `AuthUserChangePasswordRequest`    | `void`                            | Đổi mật khẩu (auth)                         |
| `postCustomerChangePhone`       | POST   | `iam/customer/change-phone`              | ✅   | `{ newPhone: string }`             | `void`                            | Yêu cầu đổi SĐT                             |
| `postCustomerVerifyChangePhone` | POST   | `iam/customer/verify-change-phone`       | ✅   | `AuthUserVerifyChangePhoneRequest` | `void`                            | Xác nhận OTP đổi SĐT                        |

### Enums

- **`AuthApiPath`**: `REGISTER`, `FORGOT`, `CHANGE_PHONE`
- **`PhoneChangeStatus`**: `PENDING`, `APPROVED`, `REJECTED`
- **`OtpMethod`**: `SMS`, `ZNS`
- **`Gender`**: `MALE` ("Nam"), `FEMALE` ("Nữ"), `OTHER` ("Khác")

### Interfaces chính

- **`AuthUser`**: id, phone, firstName, lastName, email, birthday, gender, status, pendingPhoneChange...
- **`LoginResponse`**: user, tokenId, accessToken, refreshToken
- **`RefreshTokenResponse`**: accessToken, refreshToken, tokenId

---

## 2. 🖼️ Banner API (`banner/banner.api.ts`)

Quản lý banner hiển thị trên các trang.

| Hàm                     | Method | Endpoint                               | Auth | Request                     | Response          | Mô tả                          |
| ----------------------- | ------ | -------------------------------------- | ---- | --------------------------- | ----------------- | ------------------------------ |
| `getPlacementByCodeApi` | GET    | `banner/placements/code/{code}/render` | ❌   | `code: string` (path param) | `BannerPlacement` | Lấy banner placement theo code |

### Enums

- **`BannerLayout`**: `RIGHT_TOP`, `CENTER_TOP`, `LEFT_TOP`, `RIGHT_CENTER`, `CENTER`, `LEFT_CENTER`, `RIGHT_BOTTOM`, `CENTER_BOTTOM`, `LEFT_BOTTOM`

### Interfaces chính

- **`BannerPlacement<T>`**: id, code, name, type, slots[]
- **`BannerSlot<T>`**: id, slot_key, slot_type (`SINGLE_IMAGE` | `MULTIPLE_IMAGE`), banners[]
- **`BannerCollectionItem`**: title, subtitle, title_color, layout, actions, duration
- **`RegularBannerItem`**: title, subtitle, action_type, action_target, cta_text...
- **`MediaType`**: `IMAGE` | `VIDEO` | `GIF`

---

## 3. 🛒 Cart API (`cart/cart.api.ts`)

Server-backed cart: Redux cache UI, **không** persist lines trên client. Mutation luôn `POST cart/cart` (absolute quantity); xóa dòng = `quantity: 0`. Guest session: `localStorage.guest_cart_id` + header `x-guest-id`.

> Kiến trúc đầy đủ: [`docs/cart-architecture.md`](../../docs/cart-architecture.md)

Browser gọi `/api/proxy/{path}`; tất cả endpoint cart dùng prefix **`cart/cart/…`**.

| Hàm                      | Method | Endpoint (BE)               | Auth | Request               | Response                     | Mô tả                                  |
| ------------------------ | ------ | --------------------------- | ---- | --------------------- | ---------------------------- | -------------------------------------- |
| `getCart`                | GET    | `cart/cart`                 | ⚡   | —                     | `CartApiResponse`            | Lấy giỏ; envelope `{ guestId, items }` |
| `postCart`               | POST   | `cart/cart`                 | ⚡   | `ParamPostCartItem`   | `CartApiResponsePost`        | Ghi lines (add/update/delete via qty)  |
| `mergeCart`              | POST   | `cart/cart/merge`           | ✅   | `{}`                  | `CartApiResponsePost`        | Gộp guest cart → user (sau login)      |
| `calculateCartTotal`     | POST   | `cart/cart/calculate-total` | ⚡   | `ParamCalculateTotal` | `CartCalculateTotalResponse` | Tính tổng giỏ hàng                     |
| `getCartRecommendations` | GET    | `cart/cart/recommendation`  | ⚡   | —                     | `CartRecommendationResponse` | Gợi ý sản phẩm                         |

> ⚡ = Guest (`skipAuthLogout`) hoặc logged-in. `mergeCart` **bắt buộc** đã login + có `guest_cart_id`.

### Mutation layer (`cart-mutation.util.ts`)

- **`persistCartLines(dispatch, lines, options?)`** — `postCart` → `syncCartFromServer`; hooks cart dùng helper này thay vì gọi API trực tiếp

### Interfaces chính

- **`CartApiItem`**: id, productId, prices, stock, quantity, product, variation, packaging, `isValid`, `reason`...
- **`ParamPostCartItem`**: `{ items: PostCartLine[] }` — `PostCartLine`: `{ variationId, quantity, selectedPackagingRelationIds? }`
- **`CartViewItem`**: view model Redux + UI (map từ GET qua `mapCartApiResponseToViewItems`)
- **`CartCalculateTotalResponse`**: subTotal, discountTotal, discounts[], shippingFee, totalAmount, rewardPoints

### Utility Functions (`cart.util.ts`)

- `getCartApiOptions(isLogin)` / `withFreshGuestCartHeader()` — header `x-guest-id` + `skipAuthLogout`
- `buildPostCartLine` / `mapViewItemToPostLine` — body POST
- `getCartAddLimitError(existing, addQty, incoming?)` — guard trước add (kể cả `optimisticItem.maxQuantity`)
- `getCartVariationMergeLimitError(...)` — guard đổi variation
- `isCartRecommendationOutOfStock(product)` — recommendation UI
- `mapCartApiResponseToViewItems(response)` — GET → `CartViewItem[]`

### Guest ID (`guest-cart-id.util.ts`)

- `getGuestCartId` / `setGuestCartId` / `clearGuestCartId` — key `guest_cart_id`; clear chỉ khi `logOut`

### Optimistic cart builders (`cart-view-item-builder.util.ts`)

- `buildCartViewItem(input)` — Core builder từ `CartViewItemBuildInput`
- `buildCartViewItemFromProductCard(product)` — Listing / product card
- `buildCartViewItemFromProductSwatchCard(source)` — Swatch card (màu đang chọn)
- `buildCartViewItemFromVariationsApiResponse(...)` — Variations API
- `buildCartViewItemFromProductDetailVariant(...)` — PDP variant + packaging
- `buildCartViewItemFromRecommendation(product)` — Cart recommendations

---

## 4. 📂 Category API (`category/category.api.ts`)

Quản lý danh mục sản phẩm.

| Hàm                   | Method | Endpoint                                   | Auth | Request                              | Response                    | Mô tả                             |
| --------------------- | ------ | ------------------------------------------ | ---- | ------------------------------------ | --------------------------- | --------------------------------- |
| `getCategories`       | GET    | `catalog/categories`                       | ❌   | —                                    | `ApiCategory[]`             | Lấy tất cả danh mục (nested tree) |
| `getCategoryProducts` | GET    | `catalog/categories/{categoryId}/products` | ❌   | `IParamsGetCategoryProducts` (query) | `ICategoryProductsResponse` | Lấy sản phẩm theo danh mục        |

### Interfaces chính

- **`ApiCategory`**: id, name, slug, code, logo, image, level, parentId, children[], productCount, allowedFilterAttributes...
- **`IParamsGetCategoryProducts`**: orderType, orderBy, page, take, search, categorySlug, minPrice, maxPrice, inStock, attributes, sort
- **`ICategoryProductsResponse`**: total, list[], pagination

---

## 5. 💳 Checkout API (`checkout/checkout.api.ts`)

Quản lý thanh toán, địa chỉ giao hàng, đặt hàng.

| Hàm                     | Method | Endpoint                                      | Auth | Request                           | Response                        | Mô tả                      |
| ----------------------- | ------ | --------------------------------------------- | ---- | --------------------------------- | ------------------------------- | -------------------------- |
| `getProvinces`          | GET    | `iam/location/provinces`                      | ❌   | —                                 | `LocationApiResponse<Province>` | Lấy danh sách tỉnh/thành   |
| `getWards`              | GET    | `iam/location/provinces/{provinceCode}/wards` | ❌   | `provinceCode` (path)             | `LocationApiResponse<Ward>`     | Lấy danh sách phường/xã    |
| `initiateCheckout`      | POST   | `order/checkout/initiate`                     | ⚡   | `InitiateCheckoutPayload`         | `CheckoutSession`               | Tạo checkout session       |
| `getCheckoutSession`    | GET    | `order/checkout/{id}`                         | ⚡   | `id` (path)                       | `CheckoutSession`               | Lấy checkout session       |
| `updateShippingAddress` | PUT    | `order/checkout/{id}/shipping-address`        | ⚡   | `{ addressId?, shippingAddress }` | `CheckoutSession`               | Cập nhật địa chỉ giao hàng |
| `getUserAddresses`      | GET    | `iam/addresses`                               | ✅   | query params (page, take...)      | `AddressListResponse`           | Lấy danh sách địa chỉ user |
| `placeOrder`            | POST   | `order/checkout/{id}/place-order`             | ⚡   | `PlaceOrderPayload`               | `PlaceOrderResponse`            | Đặt hàng                   |
| `addUserAddress`        | POST   | `iam/addresses`                               | ✅   | `Partial<Address>`                | `any`                           | Thêm địa chỉ mới           |
| `updateUserAddress`     | PATCH  | `iam/addresses/{id}`                          | ✅   | `Partial<Address>`                | `any`                           | Cập nhật địa chỉ           |

> ⚡ = Dynamic auth: dùng `authAxios` nếu có token, ngược lại dùng `commonAxios`

### Interfaces chính

- **`Province`**: id, code, name, codename, divisionType, phoneCode
- **`Ward`**: id, code, name, codename, provinceCode
- **`Address`**: id, firstName, lastName, receiverPhone, addressLine, wardCode/Name, provinceCode/Name, isDefault
- **`ShippingAddress`**: firstName, lastName, receiverPhone, provinceCode/Name, wardCode/Name, addressLine
- **`CheckoutSession`**: checkoutSessionId, status, shippingAddress, paymentMethod, totalAmount, items[], pricing
- **`InitiateCheckoutPayload`**: `{ items: [{ variationId, quantity }] }`
- **`PlaceOrderPayload`**: paymentMethod, consent, consentCollabPartnerSharing? (pre-order lần 1), returnUrl, note?, contactEmail?, subscribeToNewsletter, acceptPriceChanges, recaptchaToken?, shippingMethod, shippingFee, shippingCarrier, carrierServiceId?, vatInvoice?, pickupAddress?
- **`PlaceOrderResponse`**: orderId, orderCode, paymentMethod, paymentUrl

---

## 6. 📝 CMS API (`cms/cms.api.ts`)

Quản lý nội dung trang (CMS storefront).

| Hàm                       | Method | Endpoint                      | Auth | Request            | Response       | Mô tả                   |
| ------------------------- | ------ | ----------------------------- | ---- | ------------------ | -------------- | ----------------------- |
| `getStorefrontPageBySlug` | GET    | `cms/storefront/pages/{slug}` | ❌   | `slug` (path)      | `PageResponse` | Lấy trang CMS theo slug |
| `subscribeEmail`          | POST   | `/cms/subscribers`            | ❌   | `SubscribePayload` | `void`         | Đăng ký nhận email      |

### Enums

- **`PlacementDisplayType`**: `DOUBLE_BANNER`, `CAROUSEL`, `SLIDER`, `POPUP`, `GRID`
- **`BlockTypeCode`**: `BANNER`, `PRODUCT_CAROUSEL`, `INFO_CARDS`, `IMAGE_GALLERY`, `NEWSLETTER_SIGNUP`
- **`ActionType`**: `NONE`, `LINK`
- **`AnimationType`**: `STATIC`, `MARQUEE`

### Interfaces chính

- **`PageResponse`**: page, layout, blocks[]
- **`Page`**: id, name, slug, locale, seo
- **`Block`**: id, blockTypeCode, sortOrder, config, targetSegment
- **`BlockConfig`**: settings, items[], header, display, dataSource, placementCode
- **`SubscribePayload`**: email, privacyPolicyAccepted

---

## 7. 📦 Product API (`product/product.api.ts`)

Quản lý sản phẩm (listing, detail, filters, variations, gifts, promotions, reviews, related).

| Hàm                             | Method | Endpoint                                  | Auth | Request                            | Response                        | Mô tả                                 |
| ------------------------------- | ------ | ----------------------------------------- | ---- | ---------------------------------- | ------------------------------- | ------------------------------------- |
| `getFiltersByProduct`           | GET    | `catalog/products/filters`                | ❌   | `IParamsGetProductFilters` (query) | `IProductFiltersResponse`       | Lấy bộ lọc sản phẩm                   |
| `getProducts`                   | GET    | `catalog/products`                        | ❌   | `IParamsGetProducts` (query)       | `IProductsResponse`             | Lấy danh sách sản phẩm                |
| `getProductBySlug`              | GET    | `catalog/products/{slug}`                 | ❌   | `slug` (path)                      | `IProductBySlugResponse`        | Lấy chi tiết sản phẩm                 |
| `getProductGiftsBySlug`         | GET    | `catalog/products/{slug}/gifts`           | ❌   | `slug` (path)                      | `IProductGiftsResponse`         | Lấy quà tặng kèm                      |
| `getProductPromotionsBySlug`    | GET    | `catalog/products/{slug}/promotions`      | ❌   | `slug` (path)                      | `IProductPromotionsResponse`    | Lấy khuyến mãi (flash sale, vouchers) |
| `getProductReviewSummaryBySlug` | GET    | `catalog/products/{slug}/reviews-summary` | ❌   | `slug` (path)                      | `IProductReviewSummaryResponse` | Tóm tắt đánh giá                      |
| `getProductRelatedBySlug`       | GET    | `catalog/products/{slug}/related`         | ❌   | `slug` (path)                      | `IProductRelatedResponse`       | Sản phẩm liên quan                    |
| `getProductVariationsBySlug`    | GET    | `catalog/products/{slug}/variations`      | ❌   | `slug` (path)                      | `IProductVariationsResponse`    | Lấy variations sản phẩm               |

### Enums

- **`CatalogSortType`**: `PRICE_ASC`, `PRICE_DESC`, `NEWEST`, `NAME`, `BEST_SELLING`
- **`ProductStockStatus`**: `IN_STOCK`, `OUT_OF_STOCK`

### Interfaces chính

- **`ApiProduct`**: productId, productName, productSlug, image, brandName, pricing, defaultDisplay, visualSwitch, stockStatus
- **`IParamsGetProducts`**: orderType, orderBy, page, take, search, categorySlug, minPrice, maxPrice, inStock, attributes, sort
- **`IProductBySlugResponse`**: id, slug, name, sku, brand, category, breadcrumbs, gallery, pricing, availability, variants, variantSelectors, productInfos...
- **`IProductVariation`**: id, slug, name, sku, stock, stockStatus, image, gallery, attributeValues, pricing
- **`IProductVariationsResponse`**: product, attributes[], variations[]
- **`IProductPromotionsResponse`**: flashSale, vouchers
- **`IProductReviewSummaryResponse`**: averageRating, reviewCount, breakdown

---

## 🔧 Axios Configuration

### `commonAxios` (Public)

- Base URL: `API_BE_URL` (env variable)
- Header mặc định: `Language: en_US`
- Error handling: hiển thị toast, xử lý 401

### `authAxios` (Authenticated)

- Base URL: `API_BE_URL` (env variable)
- Timeout: 10000ms
- Request: tự động gắn `Authorization: Bearer {access_token}` từ localStorage
- Auto-refresh: khi nhận `statusCode: 777` → gọi `iam/customer/refresh` → retry request
- Queue mechanism: các request đang pending sẽ chờ refresh xong rồi retry
- Error handling: 401 (hết phiên), 403 (không có quyền), hiển thị toast

---

## 🔑 Tổng hợp Endpoints

### IAM Service (`iam/`)

| Endpoint                                 | Method    | Auth  |
| ---------------------------------------- | --------- | ----- |
| `iam/customer/send-otp`                  | POST      | ❌    |
| `iam/customer/verify-otp-register`       | POST      | ❌    |
| `iam/customer/login`                     | POST      | ❌    |
| `iam/customer/logout`                    | POST      | ❌    |
| `iam/customer/logout-all`                | POST      | ❌    |
| `iam/customer/change-password`           | POST      | ❌/✅ |
| `iam/customer/forgot-password`           | POST      | ❌    |
| `iam/customer/verify-otp-reset-password` | POST      | ❌    |
| `iam/customer/reset-password`            | POST      | ❌    |
| `iam/customer/profile`                   | GET/PATCH | ✅    |
| `iam/customer/refresh`                   | POST      | ❌    |
| `iam/customer/change-phone`              | POST      | ✅    |
| `iam/customer/verify-change-phone`       | POST      | ✅    |
| `iam/location/provinces`                 | GET       | ❌    |
| `iam/location/provinces/{code}/wards`    | GET       | ❌    |
| `iam/addresses`                          | GET/POST  | ✅    |
| `iam/addresses/{id}`                     | PATCH     | ✅    |

### Catalog Service (`catalog/`)

| Endpoint                                  | Method | Auth |
| ----------------------------------------- | ------ | ---- |
| `catalog/categories`                      | GET    | ❌   |
| `catalog/categories/{id}/products`        | GET    | ❌   |
| `catalog/products/filters`                | GET    | ❌   |
| `catalog/products`                        | GET    | ❌   |
| `catalog/products/{slug}`                 | GET    | ❌   |
| `catalog/products/{slug}/gifts`           | GET    | ❌   |
| `catalog/products/{slug}/promotions`      | GET    | ❌   |
| `catalog/products/{slug}/reviews-summary` | GET    | ❌   |
| `catalog/products/{slug}/related`         | GET    | ❌   |
| `catalog/products/{slug}/variations`      | GET    | ❌   |

### Cart Service (`cart/`)

| Endpoint                    | Method | Auth | Ghi chú                      |
| --------------------------- | ------ | ---- | ---------------------------- |
| `cart/cart`                 | GET    | ⚡   | Guest + user                 |
| `cart/cart`                 | POST   | ⚡   | Absolute qty; `0` = xóa dòng |
| `cart/cart/merge`           | POST   | ✅   | Login + `x-guest-id`         |
| `cart/cart/calculate-total` | POST   | ⚡   |                              |
| `cart/cart/recommendation`  | GET    | ⚡   |                              |

### Order Service (`order/`)

| Endpoint                               | Method | Auth |
| -------------------------------------- | ------ | ---- |
| `order/checkout/initiate`              | POST   | ⚡   |
| `order/checkout/{id}`                  | GET    | ⚡   |
| `order/checkout/{id}/shipping-address` | PUT    | ⚡   |
| `order/checkout/{id}/place-order`      | POST   | ⚡   |

### Banner Service (`banner/`)

| Endpoint                               | Method | Auth |
| -------------------------------------- | ------ | ---- |
| `banner/placements/code/{code}/render` | GET    | ❌   |

### CMS Service (`cms/`)

| Endpoint                      | Method | Auth |
| ----------------------------- | ------ | ---- |
| `cms/storefront/pages/{slug}` | GET    | ❌   |
| `/cms/subscribers`            | POST   | ❌   |

---

## 🤖 PROMPT CHO AI — Chuyển đổi Client-side API sang Server-side (Next.js)

> Copy prompt bên dưới và đưa cho AI để thực hiện migration.

---

### PROMPT:

```
Tôi cần chuyển toàn bộ API calls hiện tại từ client-side (Axios trên browser) sang server-side trong Next.js App Router. Dưới đây là yêu cầu chi tiết:

## BỐI CẢNH HIỆN TẠI

Dự án Next.js frontend đang gọi API trực tiếp từ browser thông qua Axios. Có 2 axios instance:
- `commonAxios`: không cần auth, base URL từ env `API_BE_URL`
- `authAxios`: tự động gắn `Bearer {accessToken}` từ localStorage, có cơ chế auto-refresh token khi nhận statusCode 777

## DANH SÁCH TẤT CẢ API CẦN CHUYỂN

### 1. Auth APIs (IAM Service)
- POST `iam/customer/send-otp` — Gửi OTP đăng ký. Body: { phone, type }
- POST `iam/customer/verify-otp-register` — Xác thực OTP đăng ký. Body: { phone, otp, firstName, lastName, password }. Response trả về accessToken, refreshToken
- POST `iam/customer/login` — Đăng nhập. Body: { phone, password }. Response trả về accessToken, refreshToken, tokenId
- POST `iam/customer/logout` — Đăng xuất. Không cần body
- POST `iam/customer/logout-all` — Đăng xuất tất cả. Không cần body
- POST `iam/customer/change-password` — Đổi mật khẩu (public). Body: { currentPassword, newPassword }
- POST `iam/customer/forgot-password` — Quên mật khẩu. Body: { phone }
- POST `iam/customer/verify-otp-reset-password` — Xác thực OTP reset MK. Body: { phone, otp }. Response: resetToken
- POST `iam/customer/reset-password` — Reset mật khẩu. Body: { resetToken, newPassword }
- GET `iam/customer/profile` — [AUTH] Lấy profile user
- PATCH `iam/customer/profile` — [AUTH] Cập nhật profile. Body: { firstName, lastName, email?, gender?, birthday? }
- POST `iam/customer/refresh` — Refresh token. Body: { refreshToken, tokenId }
- POST `iam/customer/change-password` — [AUTH] Đổi mật khẩu. Body: { currentPassword, newPassword }
- POST `iam/customer/change-phone` — [AUTH] Đổi SĐT. Body: { newPhone }
- POST `iam/customer/verify-change-phone` — [AUTH] Xác nhận đổi SĐT. Body: { newPhone, otp }

### 2. Location APIs (IAM Service)
- GET `iam/location/provinces` — Danh sách tỉnh/thành
- GET `iam/location/provinces/{provinceCode}/wards` — Danh sách phường/xã theo tỉnh

### 3. Address APIs (IAM Service)
- GET `iam/addresses` — [AUTH] Danh sách địa chỉ. Query: { orderType: DESC, orderBy: updatedAt, page, take, isPagination }
- POST `iam/addresses` — [AUTH] Thêm địa chỉ. Body: Partial<Address>
- PATCH `iam/addresses/{id}` — [AUTH] Cập nhật địa chỉ. Body: Partial<Address>

### 4. Category APIs (Catalog Service)
- GET `catalog/categories` — Danh sách tất cả danh mục (nested tree)
- GET `catalog/categories/{categoryId}/products` — Sản phẩm theo danh mục. Query: { orderType, orderBy, page, take, search, categorySlug, minPrice, maxPrice, inStock, attributes, sort }

### 5. Product APIs (Catalog Service)
- GET `catalog/products/filters` — Bộ lọc sản phẩm. Query: { categorySlug?, minPrice?, maxPrice?, inStock?, search? }
- GET `catalog/products` — Danh sách sản phẩm. Query: { orderType, orderBy, page, take, search, categorySlug, minPrice, maxPrice, inStock, attributes, sort }
- GET `catalog/products/{slug}` — Chi tiết sản phẩm theo slug
- GET `catalog/products/{slug}/gifts` — Quà tặng kèm sản phẩm
- GET `catalog/products/{slug}/promotions` — Khuyến mãi (flash sale, vouchers)
- GET `catalog/products/{slug}/reviews-summary` — Tóm tắt đánh giá
- GET `catalog/products/{slug}/related` — Sản phẩm liên quan
- GET `catalog/products/{slug}/variations` — Danh sách variations

### 6. Cart APIs (Cart Service)
- GET `cart/cart` — Lấy giỏ (guest hoặc auth; header `x-guest-id` khi có)
- POST `cart/cart` — Ghi items (absolute quantity). Body: { items: [{ variationId, quantity, selectedPackagingRelationIds? }] }; quantity 0 = xóa
- POST `cart/cart/merge` — [AUTH] Gộp guest cart vào user. Body: {}
- POST `cart/cart/calculate-total` — Tính tổng. Body: { items: [{ variationId, quantity }] }
- GET `cart/cart/recommendation` — Gợi ý sản phẩm

### 7. Checkout APIs (Order Service)
- POST `order/checkout/initiate` — [AUTH hoặc PUBLIC] Tạo checkout. Body: { items: [{ variationId, quantity }] }
- GET `order/checkout/{id}` — [AUTH hoặc PUBLIC] Lấy checkout session
- PUT `order/checkout/{id}/shipping-address` — [AUTH hoặc PUBLIC] Cập nhật địa chỉ giao. Body: { addressId?, shippingAddress }
- POST `order/checkout/{id}/place-order` — [AUTH hoặc PUBLIC] Đặt hàng. Body: { paymentMethod, consent, returnUrl, note?, contactEmail?, vatInvoice? }

### 8. Banner APIs (Banner Service)
- GET `banner/placements/code/{code}/render` — Lấy banner placement theo code

### 9. CMS APIs (CMS Service)
- GET `cms/storefront/pages/{slug}` — Lấy trang CMS theo slug
- POST `/cms/subscribers` — Đăng ký nhận email. Body: { email, privacyPolicyAccepted }

## VẤN ĐỀ BẢO MẬT HIỆN TẠI

Hiện tại, `accessToken`, `refreshToken`, `tokenId` đang được lưu trực tiếp trong **localStorage** ở browser. Điều này CỰC KỲ NGUY HIỂM vì:
- Bất kỳ đoạn JavaScript nào chạy trên trang (bao gồm XSS, third-party scripts, browser extensions) đều có thể đọc được token
- `localStorage.getItem("access_token")` → ai cũng access được
- Nếu bị XSS, hacker lấy token → toàn quyền truy cập tài khoản user

## CHIẾN LƯỢC BẢO MẬT: GIẤU TOKEN BẰNG HttpOnly COOKIES

### Nguyên tắc cốt lõi
Khi Server Next.js nhận được Token từ Backend, **PHẢI set nó vào Cookie với flag `HttpOnly`**.

Khi cookie có flag `HttpOnly`:
- ❌ JavaScript phía Client (trình duyệt) **KHÔNG BAO GIỜ** chạm được vào cookie đó
- ❌ `document.cookie` không thể đọc được
- ❌ Hacker dù XSS cũng không lấy được token
- ✅ Chỉ có các HTTP request gửi lên server mới tự động mang theo cookie
- ✅ Token chỉ tồn tại trên server-side, client không biết token là gì

### Flow hoạt động

```

[HIỆN TẠI - KHÔNG AN TOÀN]
Browser → gọi thẳng Backend API → nhận token → lưu localStorage → JS đọc được ❌

[SAU KHI CHUYỂN - AN TOÀN]
Browser → gọi Next.js API Route → Next.js gọi Backend → nhận token
→ Next.js set HttpOnly Cookie → trả response (KHÔNG có token)
→ Browser tự gửi cookie cho mọi request tới Next.js → Next.js đọc cookie → gắn token gọi Backend
→ JS ở browser KHÔNG BAO GIỜ thấy token ✅

````

### Config Cookie bắt buộc

Khi set cookie cho token, PHẢI dùng đầy đủ các flag sau:

```typescript
// lib/server/cookies.ts
import { cookies } from 'next/headers';

const COOKIE_OPTIONS = {
  httpOnly: true,      // ⚠️ BẮT BUỘC: JS client không đọc được
  secure: true,        // Chỉ gửi qua HTTPS (production)
  sameSite: 'lax' as const,  // Chống CSRF
  path: '/',           // Có hiệu lực toàn site
  maxAge: 7 * 24 * 60 * 60,  // 7 ngày (tuỳ chỉnh)
};

// Set tokens vào cookies
export async function setAuthCookies(accessToken: string, refreshToken: string, tokenId: string) {
  const cookieStore = await cookies();
  cookieStore.set('access_token', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60, // Access token: 15 phút
  });
  cookieStore.set('refresh_token', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60, // Refresh token: 7 ngày
  });
  cookieStore.set('token_id', tokenId, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60,
  });
}

// Đọc token từ cookies (chỉ server-side mới gọi được)
export async function getAuthTokens() {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get('access_token')?.value || null,
    refreshToken: cookieStore.get('refresh_token')?.value || null,
    tokenId: cookieStore.get('token_id')?.value || null,
  };
}

// Xóa cookies khi logout
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  cookieStore.delete('token_id');
}
````

### Ví dụ Login Route Handler

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/server/cookies";

const API_BE_URL = process.env.API_BE_URL; // Chỉ server biết

export async function POST(request: NextRequest) {
  const body = await request.json(); // { phone, password }

  // 1. Gọi Backend từ Server (token KHÔNG bao giờ tới browser)
  const backendResponse = await fetch(`${API_BE_URL}/iam/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Language: "en_US" },
    body: JSON.stringify(body),
  });

  const data = await backendResponse.json();

  if (!backendResponse.ok) {
    return NextResponse.json(data, { status: backendResponse.status });
  }

  // 2. GẤU TOKEN TRONG HttpOnly COOKIES — JS client méo đọc được
  await setAuthCookies(data.accessToken, data.refreshToken, data.tokenId);

  // 3. Trả về cho client CHỈ user info, KHÔNG trả token
  return NextResponse.json({
    user: data.user,
    // ❌ KHÔNG trả accessToken, refreshToken, tokenId
  });
}
```

### Ví dụ Authenticated Route Handler (đọc token từ cookie)

```typescript
// app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthTokens } from "@/lib/server/cookies";

const API_BE_URL = process.env.API_BE_URL;

export async function GET(request: NextRequest) {
  // Đọc token từ HttpOnly cookie (chỉ server làm được)
  const { accessToken } = await getAuthTokens();

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const backendResponse = await fetch(`${API_BE_URL}/cart/cart`, {
    headers: {
      Authorization: `Bearer ${accessToken}`, // Gắn token từ cookie
      Language: "en_US",
    },
  });

  const data = await backendResponse.json();
  return NextResponse.json(data, { status: backendResponse.status });
}
```

### Ví dụ Auto-Refresh Token trên Server

```typescript
// lib/server/api-client.ts
import { getAuthTokens, setAuthCookies, clearAuthCookies } from "./cookies";

const API_BE_URL = process.env.API_BE_URL;

export async function authFetch(path: string, options: RequestInit = {}) {
  const { accessToken, refreshToken, tokenId } = await getAuthTokens();

  // Lần gọi đầu tiên
  let response = await fetch(`${API_BE_URL}/${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Language: "en_US",
    },
  });

  const data = await response.json();

  // Nếu backend trả statusCode 777 → token hết hạn → auto refresh
  if (data?.statusCode === 777 && refreshToken && tokenId) {
    const refreshResponse = await fetch(`${API_BE_URL}/iam/customer/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken, tokenId }),
    });

    if (refreshResponse.ok) {
      const newTokens = await refreshResponse.json();

      // Cập nhật cookies với token mới
      await setAuthCookies(newTokens.accessToken, newTokens.refreshToken, newTokens.tokenId);

      // Retry request ban đầu với token mới
      response = await fetch(`${API_BE_URL}/${path}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newTokens.accessToken}`,
          "Content-Type": "application/json",
          Language: "en_US",
        },
      });

      return response.json();
    } else {
      // Refresh failed → xóa cookies, user phải login lại
      await clearAuthCookies();
      throw new Error("Session expired");
    }
  }

  return data;
}
```

### Ví dụ Client-side gọi API (KHÔNG CẦN BIẾT TOKEN)

```typescript
// Client-side: gọi /api/... nội bộ, cookie tự đính kèm
// Thay thế file cart.api.ts hiện tại

export const getCart = async (): Promise<CartApiResponse> => {
  const res = await fetch("/api/cart", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
};

export const postCart = async (params: ParamPostCartItem): Promise<CartApiResponsePost> => {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ← Cookie HttpOnly tự gửi kèm
    body: JSON.stringify(params),
  });
  return res.json();
};

// Client KHÔNG CẦN và KHÔNG THỂ đọc token
// ❌ localStorage.getItem('access_token') → BỎ HẾT
// ✅ Cookie HttpOnly tự gửi kèm theo mọi request
```

### Logout Route (xoá sạch cookies)

```typescript
// app/api/auth/logout/route.ts
import { clearAuthCookies } from "@/lib/server/cookies";

export async function POST() {
  // Gọi backend logout (optional)
  const { accessToken } = await getAuthTokens();
  if (accessToken) {
    await fetch(`${API_BE_URL}/iam/customer/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  // Xoá sạch cookies → client mất quyền truy cập
  await clearAuthCookies();

  return NextResponse.json({ success: true });
}
```

### Kiểm tra trạng thái login ở client (không cần token)

```typescript
// Vì client không đọc được HttpOnly cookie, cần 1 API check session
// app/api/auth/me/route.ts
export async function GET() {
  const { accessToken } = await getAuthTokens();
  if (!accessToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Gọi backend lấy profile
  const res = await fetch(`${API_BE_URL}/iam/customer/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await res.json();
  return NextResponse.json({ authenticated: true, user });
}
```

## YÊU CẦU CHUYỂN ĐỔI

1. **Tạo Next.js API Routes (Route Handlers)** trong `app/api/` làm proxy tới backend:
   - Mỗi module (auth, cart, category, product, checkout, banner, cms) tạo 1 folder riêng
   - Sử dụng `fetch` (KHÔNG dùng axios trên server, KHÔNG dùng localStorage)
   - Xử lý auth token bằng **HTTP-only cookies** thay vì localStorage

2. **🔒 BẢO MẬT TOKEN BẰNG HttpOnly COOKIES (QUAN TRỌNG NHẤT)**:
   - **NGUYÊN TẮC VÀNG**: Token (accessToken, refreshToken, tokenId) **TUYỆT ĐỐI KHÔNG ĐƯỢC** xuất hiện ở client-side JavaScript. Phải giấu hoàn toàn trong HttpOnly cookies.
   - **Login/Register**: Backend trả token → Server Next.js set vào HttpOnly cookie → Response trả về client **CHỈ CÓ user info**, **KHÔNG CÓ token**
   - **Mọi request cần auth**: Client gọi `/api/...` nội bộ → Cookie HttpOnly tự đính kèm → Server Next.js đọc token từ cookie → gắn `Authorization: Bearer {token}` gọi Backend
   - **Auto-refresh**: Server Next.js nhận `statusCode: 777` → gọi refresh → update HttpOnly cookies → retry → client không biết gì
   - **Logout**: Server xóa sạch HttpOnly cookies
   - **Check session**: Tạo route `/api/auth/me` để client kiểm tra đăng nhập hay chưa (vì client không đọc được cookie)
   - **Cookie config BẮT BUỘC**: `httpOnly: true`, `secure: true` (production), `sameSite: 'lax'`, `path: '/'`
   - **KHÔNG BAO GIỜ** trả `accessToken`, `refreshToken`, `tokenId` trong response body về client
   - **XOÁ SẠCH** tất cả `localStorage.getItem('access_token')`, `localStorage.getItem('refresh_token')`, `localStorage.getItem('token_id')` ở client code

3. **Tạo client-side API wrapper** thay thế các file `.api.ts` hiện tại:
   - Gọi tới `/api/...` routes nội bộ thay vì gọi thẳng backend
   - Dùng `fetch` với `credentials: 'include'` để browser tự gửi cookies
   - Không cần truyền token (cookies tự gửi theo request)
   - Giữ nguyên interface/type signatures để không phải sửa component

4. **Cấu trúc thư mục đề xuất**:

```
lib/server/
├── api-client.ts              # Server-side fetch wrapper (authFetch, publicFetch)
├── cookies.ts                 # setAuthCookies, getAuthTokens, clearAuthCookies
└── auth.ts                    # Refresh token logic, middleware helpers

app/api/
├── auth/
│   ├── login/route.ts         # POST: login → set HttpOnly cookies
│   ├── register/
│   │   ├── send-otp/route.ts
│   │   └── verify-otp/route.ts  # POST: register → set HttpOnly cookies
│   ├── logout/route.ts        # POST: clear HttpOnly cookies
│   ├── me/route.ts            # GET: check session bằng cookie (thay thế localStorage check)
│   ├── forgot-password/
│   │   ├── route.ts
│   │   ├── verify-otp/route.ts
│   │   └── reset/route.ts
│   ├── profile/route.ts       # GET/PATCH: đọc token từ cookie
│   ├── change-password/route.ts
│   ├── change-phone/
│   │   ├── route.ts
│   │   └── verify/route.ts
│   └── refresh/route.ts       # POST: refresh → update HttpOnly cookies
├── catalog/
│   ├── categories/route.ts
│   ├── categories/[id]/products/route.ts
│   ├── products/route.ts
│   ├── products/filters/route.ts
│   └── products/[slug]/
│       ├── route.ts
│       ├── gifts/route.ts
│       ├── promotions/route.ts
│       ├── reviews-summary/route.ts
│       ├── related/route.ts
│       └── variations/route.ts
├── cart/
│   ├── route.ts               # GET/POST/DELETE: đọc token từ cookie
│   ├── item/[variationId]/route.ts
│   ├── calculate-total/route.ts
│   └── recommendation/route.ts
├── checkout/
│   ├── initiate/route.ts      # Dynamic: check cookie có token không
│   └── [id]/
│       ├── route.ts
│       ├── shipping-address/route.ts
│       └── place-order/route.ts
├── banner/
│   └── placements/[code]/route.ts  # Public: không cần cookie
├── cms/
│   ├── pages/[slug]/route.ts      # Public: không cần cookie
│   └── subscribers/route.ts
└── location/
    ├── provinces/route.ts
    └── provinces/[code]/wards/route.ts
```

5. **Tạo shared server utilities**:
   - `lib/server/api-client.ts` — Server-side fetch wrapper: `authFetch(path, options)` tự đọc token từ cookie, tự refresh khi 777
   - `lib/server/cookies.ts` — `setAuthCookies()`, `getAuthTokens()`, `clearAuthCookies()` với config HttpOnly
   - `lib/server/auth.ts` — Refresh token logic, middleware helpers

6. **Giữ nguyên**:
   - Tất cả TypeScript interfaces/types (file `.interface.ts`)
   - Tất cả enums (file `.enum.ts`)
   - Cart utility functions (`cart.util.ts`) — chỉ cần update import

7. **Lưu ý quan trọng**:
   - Checkout APIs có logic dynamic auth: dùng auth nếu cookie có token, public nếu không → route handler cần check cookies và quyết định có gắn token hay không
   - Cart `postCart` có option `skipAuthLogout` → khi 401 không redirect, chỉ hiển thị toast → xử lý bằng custom error response trên server
   - Token refresh dùng cơ chế queue: nếu nhiều request cùng bị 777, chỉ refresh 1 lần rồi retry tất cả
   - Header `Language: en_US` cần được giữ lại trong server requests
   - `API_BE_URL` env variable CHỈ dùng trên server (KHÔNG expose ra browser = KHÔNG cần prefix `NEXT_PUBLIC_`)
   - **XÓA TOÀN BỘ** references tới `localStorage` cho token: `localStorage.getItem('access_token')`, `localStorage.setItem(...)`, `localStorage.removeItem(...)`
   - Tạo route `/api/auth/me` (GET) để client check login status thay vì đọc localStorage

```

---

> **Ghi chú**: ✅ = Cần auth token | ❌ = Public | ⚡ = Dynamic (có token thì dùng, không thì bỏ qua)
```
