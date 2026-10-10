
# Nội dung từ backend riêng

Cấu hình .env.local (không commit):
NEXT_PUBLIC_CONTENT_API_URL=http://localhost:8083
NEXT_PUBLIC_CONTENT_API_PREFIX=/api/v1

Biến này bật CMS/banner đọc database riêng cả SSR và browser, không đổi component hiển thị.
Không tự fallback về nội dung mock nếu API thật lỗi hoặc trang chưa publish.
Trang chủ cần tạo page có slug trang-chu, gắn các block rồi publish trên admin.
Trang draft/chưa tạo trả 404 đúng quy tắc; không tự dựng page/banner mẫu.

API cart/auth và các phần chưa tích hợp vẫn giữ cấu hình cũ, không đổi cùng lúc.
Chưa hoàn tất carousel/product/badge/header/footer; không xem đây là toàn bộ demo đã xong.
