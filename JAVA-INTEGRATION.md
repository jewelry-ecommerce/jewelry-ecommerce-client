# Run client với Java

Backend chính là `kltn_ecommerce`, Nest chỉ là backup.

1. Merge `.env.java.example` vào `.env.local`, giữ các cấu hình khác.
2. Chạy Java riêng ở `http://localhost:8082` với prefix `/api/v1`.
3. Chạy `npm ci` rồi `npm run dev` tại repo client; mở http://localhost:3100.
4. Dùng tài khoản/OTP của Java, không dùng account mock như tài khoản thật.

Hướng dẫn DB/Maven, hiện trạng, giới hạn chưa tích hợp và checklist trong [JAVA-INTEGRATION.md của admin](../jewelry-commerce-admin/JAVA-INTEGRATION.md).

Không xem build/test FE thành công là chứng minh flow Java với DB thật. Client đang có adapter CMS/PIM/badge/cart/checkout COD/order; các API phụ chưa đủ không được thay bằng mock để che lỗi.
