/**
 * Màu badge "Đặt trước" dùng chung (SKU card drawer, giỏ hàng, lịch sử đơn).
 * Khớp badge BE `availabilityDisplay.badge` (textColor / backgroundColor).
 */
export const PRE_ORDER_BADGE_COLORS = {
  backgroundColor: "#FEF3C7",
  color: "#B45309",
} as const;

/** Label ngày mở bán — ghi đè copy BE ("Ngày dự kiến có hàng", …). */
export const PRE_ORDER_EXPECTED_STOCK_LABEL = "Thời gian mở bán dự kiến:";

/** PDP: dòng chú thích phía trên nút Thêm vào giỏ khi SKU đặt trước. */
export const PRE_ORDER_PDP_NOTICE_PREFIX = "Đây là hàng đặt trước, thời gian mở bán dự kiến:";
