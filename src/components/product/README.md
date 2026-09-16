# Product Components Documentation

Tài liệu hướng dẫn sử dụng bộ components dành cho Product: **ProductTitle**, **ProductItem**, **ProductSlider**, và **ProductReview**. Tất cả components đều hỗ trợ `sx` props để tùy chỉnh style nhanh.

---

## 🏗️ Danh sách Components

### 1. ProductTitle

Dùng để hiển thị tiêu đề chính và phụ cho các phần trong trang.

**Sử dụng:**

```tsx
import { ProductTitle } from "@/components";

<ProductTitle title="NEW ARRIVAL" subtitle="ART & DESIGN / STUDIO" sx={{ mb: 4 }} />;
```

### 2. ProductItem

Hiển thị card sản phẩm đơn lẻ. Hỗ trợ hiệu ứng hover đổi ảnh, nhãn giảm giá, và bộ chọn màu sắc.

**Sử dụng:**

```tsx
import { ProductItem } from "@/components";

<ProductItem
  id="p1"
  name="SODIUM EARRING"
  price={132999000}
  images={["/image/item-1.png", "/image/item-1-hover.png"]}
  label="Save 31%"
  colors={[
    { id: "c1", image: "/image/color-1.svg" },
    { id: "c2", image: "/image/color-2.svg" },
  ]}
/>;
```

### 3. ProductSlider

Hiển thị danh sách sản phẩm dưới dạng slider (carousel).

- **Responsive:** Tự động hiển thị 4 items trên PC và 2 items trên Mobile (quy ước dự án).

**Sử dụng:**

```tsx
import { ProductSlider } from "@/components";

<ProductSlider title="FEATURED PRODUCTS" items={LIST_PRODUCTS} autoplay={true} />;
```

### 4. ProductReview (Mới)

Hiển thị bộ sưu tập hình ảnh hoặc các bài đánh giá theo dạng slider.

- **Tính năng:** Hiện mũi tên điều hướng trái/phải khi hover vào vùng nội dung.
- **Label Đặc biệt:** Có nhãn dán ở góc trên bên trái với background SVG (`icon-label.svg`).
- **Responsive:**
  - PC (>= 1200px): 4 items.
  - Tablet (1199px - 810px): 2 items.
  - Mobile (< 810px): 1 item.

**Sử dụng:**

```tsx
import { ProductReview } from "@/components";

const REVIEWS = [
  { id: "1", image: "/image/review-1.jpg", labelText: "POSTHUMAN.LAB" },
  { id: "2", image: "/image/review-2.jpg" }, // Mặc định hiển thị "POSTHUMAN"
];

<ProductReview title="POSTHUMAN COLLECTION" subtitle="@POSTHUMAN.LAB" items={REVIEWS} />;
```

---

## 📋 Chi tiết Props

### ProductItem Props

| Prop            | Kiểu       | Mô tả                                         |
| :-------------- | :--------- | :-------------------------------------------- |
| `id`            | `string`   | ID duy nhất của sản phẩm.                     |
| `name`          | `string`   | Tên hiển thị.                                 |
| `price`         | `number`   | Giá hiện tại.                                 |
| `images`        | `string[]` | Mảng chứa `[ảnh_mặc_định, ảnh_hover]`.        |
| `label`         | `string`   | Nội dung nhãn dán (ví dụ: "New", "Save 10%"). |
| `labelPosition` | `string`   | Vị trí nhãn (`top-left`, `top-right`, v.v.).  |

### ProductReview Props

| Prop       | Kiểu     | Mô tả                                                          |
| :--------- | :------- | :------------------------------------------------------------- |
| `title`    | `string` | Tiêu đề lớn của section.                                       |
| `subtitle` | `string` | Dòng phụ đề nhỏ bên dưới tiêu đề.                              |
| `items`    | `array`  | Danh sách các item review: `{ id, image, labelText?, link? }`. |
| `sx`       | `object` | Tùy chỉnh trực tiếp style qua hệ thống của MUI.                |

---
