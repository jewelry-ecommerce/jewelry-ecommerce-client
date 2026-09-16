# Pre-order FE helpers

Real UI mapping for order detail (BR-01 + AC3): `pre-order-order.util.ts`.

## Order detail fields (from BE)

- `fulfillmentType`: `RETAIL` | `PRE_ORDER`
- `preOrderStatus`: `Draft` | `PreOrdered` | `StockAvailable` | `ZnsFailed` | `AwaitingPayment` | `Converted` | `Cancelled` | `Expired`
- `fulfillmentSummary`: `{ label: string; value: string }`
- `paymentHoldExpiresAt`: ISO datetime (48h hold when awaiting payment)

## Checkout lần 1 vs lần 2 (FE-INTEGRATION)

|                  | Lần 1 (đặt trước)                                         | Lần 2 (thanh toán khi có hàng)                                            |
| ---------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| Entry            | Cart/PDP → `POST order/checkout/initiate` → `/thanh-toan` | Chi tiết PO → đẩy data → `/thanh-toan-dat-truoc` (**không** gọi initiate) |
| Signal           | `checkoutType=PRE_ORDER` + `paymentRequired=false`        | Data từ chi tiết PO (sessionStorage)                                      |
| Status sau place | `PreOrdered`                                              | Converted (sau `POST .../pay`)                                            |

FE helpers:

- Lần 1: `isPreOrderReserveCheckout()` trong `pre-order-checkout.util.ts`
- Lần 2: trang `/thanh-toan-dat-truoc` + API trong `pre-order-detail.api.ts` (gọi từ `useOrderActions.handlePayment`)

## Related UI

- Order history tab "Đặt Trước": `my-account-history-orders` → `GET order/orders/me?fulfillmentType=PRE_ORDER`
  - Summary badge key: `PRE_ORDER`
  - MVP: hide `preOrderStatus=Converted` (và `Draft`) from this tab
  - List card: hiển thị `preOrderCode` (fallback `orderCode`); badge theo `preOrderStatus`
  - Detail (`/don-hang/dat-truoc`): title `#preOrderCode` (fallback `orderCode`)
  - `preOrderStatus` normalize PascalCase / SCREAMING_SNAKE; alias `STOCK_READY` → `StockAvailable`
  - BR-03 label khách: PreOrdered / StockAvailable / ZnsFailed → "Đặt trước"; AwaitingPayment → "Chờ thanh toán"
  - Actions: StockAvailable & AwaitingPayment → Hủy + Hoàn tất thanh toán; PreOrdered / ZnsFailed → Hủy
  - List card: BR-01 status badge + `fulfillmentSummary` ETA banner
- Order detail (pre-order): route `/don-hang/dat-truoc`
  - Logged-in: mã truyền qua `sessionStorage` (`preparePreOrderMemberDetailNavigation` / `readPreOrderDetailOrderCode`) — **không** gọi `POST .../access`
  - Guest / ZNS: `/don-hang/dat-truoc#access=<token>` → lưu token session → `POST order/pre-orders/access` `{ token }` (reload giữ token; không dùng `orders/guest-access`)
  - API member: `GET order/pre-orders/client/:orderCode` — list lưu `orderCode` hoặc fallback `preOrderCode` vào session trước khi mở detail (đồng thời xóa token `gpa_*` cũ)
  - Hủy đơn: `POST order/pre-orders/client/:orderCode/cancel` body `{ reason: string }` (`cancelPreOrder`)
  - Hoàn tất thanh toán: lưu chi tiết → `/thanh-toan-dat-truoc` (`savePreOrderPaymentDetail`) — **không** đụng `/thanh-toan`
  - Entry: tab "Đặt Trước", success page (login), hoặc deep-link `#access=`
  - Response thiếu field → `preOrderDetailToViewOrder` fill default để tái dùng `OrderDetailView`
- Thanh toán lần 2 (isolated): `/thanh-toan-dat-truoc`
  - Hydrate UI từ `sessionStorage` (`savePreOrderPaymentDetail` / `readPreOrderPaymentDetail`)
  - Đổi địa chỉ → `PUT .../shipping-address` (chỉ gửi snapshot địa chỉ; BE tính lại `shippingFee` / `grandTotal`)
  - FE debounce ~600ms sau khi đổi tỉnh/phường/địa chỉ → PUT ngay để cập nhật summary (không đợi bấm thanh toán)
  - Đổi ghi chú / VAT → `PUT .../special-requests`
  - Bấm thanh toán → `POST .../pay` `{ paymentMethod, returnUrl }` (+ header `x-pre-order-access-token` khi có `gpa_v1` token)
  - Payoo: `location.replace(buildPendingPaymentUrl(orderCode, true))` → pending (`redirect=1`) tự sang Payoo; back từ Payoo về pending
  - Guest back/hủy từ Payoo: snapshot cần `guestOrderAccess` (`goa_*`) từ response `/pay` → `POST order/orders/guest-access`. Không ghi `guestOrderAccessToken: ""` (sẽ làm mất token và SWR bỏ qua API).
  - `pre-orders/access` chỉ dùng mở chi tiết `/don-hang/dat-truoc#access=` (token `gpa_*`)
  - Vào lại form khi snapshot còn `paymentUrl` → `replace` pending (không auto-redirect)
  - COD success: clear storage rồi sang status success
- Order detail (retail): `/don-hang/[orderCode]`, `/don-hang/khach` via `OrderInfoSection` / `OrderDetailView`
- Checkout lần 1: ẩn title/PTTT + notice deferred (text, không box) + ẩn yêu cầu đặc biệt + CTA "Xác nhận đặt trước"
  - place-order lần 1 gửi thêm `detailUrlTemplate` = `{origin}/don-hang/dat-truoc/{orderCode}`
- Checkout banner: `checkout-product-list.component.tsx` (`fulfillmentSummary` on session)
- Success page: `fulfillment=pre-order` query when reserve checkout

AC5 (ZNS terminal-link gating): chưa làm — thiếu design.
Checkout lần 2 **không** dùng `order/checkout/initiate` và **không** sửa logic checkout thường.
