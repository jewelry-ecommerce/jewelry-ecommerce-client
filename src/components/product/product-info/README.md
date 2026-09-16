# Product Info Components Documentation

Tài liệu hướng dẫn sử dụng bộ đôi components: **ProductInfoCard** và **ProductInfoSlider**. Bộ components này tập trung vào tính thẩm mỹ cao (premium design) và hỗ trợ hiển thị đa phương tiện (Image, GIF, Video).

---

## 1. Mẫu sử dụng ProductInfoCard

Hiển thị một thẻ nội dung đơn lẻ với hiệu ứng hover và hỗ trợ liên kết.

```tsx
import { ProductInfoCard } from "@/components";

<ProductInfoCard
  title="VISIT OUR STORES"
  subtitle="YOUR NEW FAVORITE SPACE TO SHOP, STACK, AND STAY A WHILE."
  src="https://example.com/image.jpg"
  aspectRatio="16 / 9"
  actionLabel="VISIT OUR STORES"
  href="/stores"
  sx={{ width: 400 }}
/>;
```

### Media Support

`ProductInfoCard` tự động nhận diện loại file thông qua prop duy nhất `src`:

- **Auto-detection**: Component sử dụng hàm `getMediaType` để kiểm tra phần mở rộng của URL (mp4, gif, jpg, v.v.).
- **Image/GIF**: Hiển thị dưới dạng thẻ img.
- **Video**: Tự động render thẻ video với các thuộc tính `autoPlay`, `muted`, `loop`, `playsInline`.

---

## 2. Mẫu sử dụng ProductInfoSlider

Hiển thị danh sách card trong một khung (frame) có đường kẻ tinh tế, hỗ trợ responsive.

```tsx
import { ProductInfoSlider } from "@/components";

const STORY_DATA = [
  {
    title: "STORY",
    subtitle: "YOUR NEW FAVORITE SPACE...",
    src: "/path/to/media.mp4",
    actionLabel: "READ MORE",
  },
  // ...
];

<ProductInfoSlider
  title="Our Stories"
  subtitle="LATEST FROM THE BLOG"
  items={STORY_DATA}
  itemsToShow={{ xs: 1, sm: 2, lg: 3 }}
  width="100%"
  itemSx={{ backgroundColor: "#fff" }}
/>;
```

---

## Thông tin chi tiết Props

### ProductInfoCard Props

| Prop               | Kiểu dữ liệu       | Mô tả                                                             |
| :----------------- | :----------------- | :---------------------------------------------------------------- |
| `title`            | `string`           | Tiêu đề chính của card                                            |
| `subtitle`         | `string`           | Nội dung mô tả ngắn                                               |
| `src`              | `string`           | Đường dẫn file đa phương tiện (tự động nhận diện Image/GIF/Video) |
| `aspectRatio`      | `string \| number` | Tỉ lệ khung hình của media (Mặc định: `16 / 9`)                   |
| `actionLabel`      | `string`           | Nhãn của hành động (VD: "LEARN MORE")                             |
| `href`             | `string`           | Đường dẫn liên kết khi click vào card                             |
| `actionLabel`      | `string`           | Nhãn của hành động (VD: "LEARN MORE")                             |
| `width` / `height` | `string \| number` | Kích thước tùy chỉnh cho card                                     |

### ProductInfoSlider Props

| Prop          | Kiểu dữ liệu             | Mô tả                                                   |
| :------------ | :----------------------- | :------------------------------------------------------ |
| `title`       | `string`                 | Tiêu đề của slider                                      |
| `subtitle`    | `string`                 | Tiêu đề phụ của slider                                  |
| `items`       | `ProductInfoCardProps[]` | Danh sách dữ liệu các card                              |
| `itemsToShow` | `object`                 | Số lượng card hiển thị theo breakpoint `{ xs, sm, lg }` |
| `itemSx`      | `SxProps`                | Style áp dụng cho từng slide item                       |
| `sx`          | `SxProps`                | Style áp dụng cho toàn bộ slider container              |

---

## Lưu ý về Style

- Các components đã được tối ưu hóa về CSS classes, hạn chế dùng `sx` prop trừ khi cần tùy chỉnh layout đặc biệt từ bên ngoài.
- Hệ thống Border (Frame) của `ProductInfoSlider` được thiết kế để tự động kẻ viền giữa các item, tạo cảm giác chuyên nghiệp giống như `ProductSlider`.
- Tỉ lệ `aspectRatio` mặc định giúp đảm bảo tất cả các card trong Slider luôn cao bằng nhau dù nội dung media gốc có kích thước khác nhau.
