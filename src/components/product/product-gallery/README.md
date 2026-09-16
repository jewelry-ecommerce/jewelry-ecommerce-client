# Product Gallery Component Documentation

Tài liệu hướng dẫn sử dụng component **ProductGalleryComponent**. Component này hiển thị một bộ sưu tập hình ảnh/video dưới dạng slider (carousel) với phong cách thiết kế tối giản và hiện đại.

---

## 1. Mẫu sử dụng ProductGalleryComponent

Hiển thị danh sách các item (ảnh/video) kèm theo label và hỗ trợ điều hướng.

```tsx
import { ProductGalleryComponent } from "@/components";

const GALLERY_DATA = [
  {
    id: "1",
    src: "https://example.com/image1.jpg",
    labelText: "COLLECTION 2024",
    link: "/collection/2024",
  },
  {
    id: "2",
    src: "https://example.com/video1.mp4",
    labelText: "BRAND STORY",
    link: "/about",
  },
  // ...
];

<ProductGalleryComponent title="GALLERY" subtitle="EXPLORE OUR LATEST CAMPAIGNS" items={GALLERY_DATA} />;
```

---

## 2. Media Support

`ProductGalleryComponent` hỗ trợ hiển thị cả hình ảnh và video:

- **Tự động nhận diện**: Sử dụng hàm `getMediaType` để phân loại dựa trên phần mở rộng của `src`.
- **Image**: Sử dụng `next/image` để tối ưu hóa hiệu suất, hỗ trợ cả ảnh tĩnh và GIF (không nén).
- **Video**: Tự động render thẻ video với các chế độ `autoPlay`, `muted`, `loop`, `playsInline` để tạo hiệu ứng chuyển động mượt mà.

---

## 3. Tính năng chính

- **Responsive Slider**: Sử dụng `embla-carousel-react` cho trải nghiệm vuốt/cuộn mượt mà trên cả mobile và desktop.
- **Smart Navigation**: Các nút điều hướng (Next/Prev) chỉ hiển thị khi số lượng item vượt quá khung nhìn.
- **Dynamic Labels**: Hỗ trợ hiển thị nhãn (label) đè lên trên media với phong cách thiết kế đặc trưng.
- **Interactive**: Mỗi item có thể là một liên kết (`next/link`) nếu prop `link` được cung cấp.

---

## 4. Thông tin chi tiết Props

### ProductGalleryComponent Props

| Prop       | Kiểu dữ liệu          | Mô tả                                     |
| :--------- | :-------------------- | :---------------------------------------- |
| `title`    | `string`              | Tiêu đề của gallery                       |
| `subtitle` | `string`              | Tiêu đề phụ/mô tả ngắn                    |
| `items`    | `ProductReviewItem[]` | Danh sách các item hiển thị trong gallery |

### ProductReviewItem Object

| Thuộc tính  | Kiểu dữ liệu | Mô tả                                              |
| :---------- | :----------- | :------------------------------------------------- |
| `id`        | `string`     | ID duy nhất của item                               |
| `src`       | `string`     | Đường dẫn file (Image/Video/GIF)                   |
| `labelText` | `string`     | Văn bản hiển thị trên card (Mặc định: "POSTHUMAN") |
| `link`      | `string`     | (Tùy chọn) Đường dẫn khi click vào item            |

---

## 5. Lưu ý về Style

- Các style được quản lý tập trung trong file `product-gallery.styles.ts` sử dụng `tss-react`.
- Layout sử dụng CSS Grid và Flexbox để đảm bảo tính nhất quán giữa các item.
- Các nút điều hướng được thiết kế overlay tinh tế, tự động vô hiệu hóa (disabled) khi đạt đến giới hạn cuộn.
