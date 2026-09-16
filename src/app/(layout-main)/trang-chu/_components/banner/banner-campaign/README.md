# Campaign Banner Component

Component banner hỗ trợ đa phương tiện (Ảnh, GIF, Video) với dải tiêu đề (overlay) có thể cấu hình linh hoạt.

## Tính năng

- **Hỗ trợ Đa phương tiện**: Tự động nhận diện và hiển thị Ảnh, GIF, hoặc Video thông qua tiện ích `getMediaType`.
- **Bố cục Responsive**:
  - **Máy tính (>= 1200px)**: Hiển thị song song (hàng ngang).
  - **Điện thoại/Máy tính bảng (< 1200px)**: Hiển thị xếp chồng (hàng dọc).
- **Overlay Tiêu đề Linh hoạt**:
  - **Vị trí theo chiều dọc & ngang (`labelPosition`)**: `top-left`, `top-right`, `center-left`, `center-right`, `bottom-left` (mặc định), `bottom-right`, `center`.
  - **Căn lề chữ (`titlePosition`)**: `left` (mặc định), `center`, `right`.
  - **Chiều rộng nhãn (`labelWidth`)**: `full` (mặc định), `fit-content`.
- **Tương tác**: Hỗ trợ prop `href` để biến banner thành link click được (sử dụng `AppLink`).
- **Hiệu năng**: Sử dụng `next/image` để tối ưu hóa hình ảnh.

## Props

### `BannerCampaignProps`

| Prop      | Type                   | Mô tả                                         |
| :-------- | :--------------------- | :-------------------------------------------- |
| `items`   | `BannerCampaignItem[]` | Danh sách các banner cần hiển thị.            |
| `sxLabel` | `CampaignLabelProps`   | Cấu hình cho dải nhãn/overlay.                |
| `sx`      | `SxProps<Theme>`       | Tùy chỉnh style cho toàn bộ component (root). |

### `CampaignLabelProps`

| Thuộc tính      | Kiểu dữ liệu              | Mặc định        | Mô tả                                                     |
| :-------------- | :------------------------ | :-------------- | :-------------------------------------------------------- |
| `labelPosition` | `CampaignLabelPosition`   | `"bottom-left"` | Vị trí của dải overlay trên banner.                       |
| `titlePosition` | `CampaignTitlePosition`   | `"left"`        | Cách căn lề của chữ bên trong dải overlay.                |
| `labelWidth`    | `"full" \| "fit-content"` | `"full"`        | Chiều rộng của dải overlay.                               |
| `sx`            | `SxProps<Theme>`          | -               | Style bổ sung cho dải overlay (ví dụ: `backgroundColor`). |

### `BannerCampaignItem`

| Thuộc tính | Kiểu dữ liệu | Mô tả                                        |
| :--------- | :----------- | :------------------------------------------- |
| `id`       | `string`     | ID duy nhất cho mỗi item.                    |
| `src`      | `string`     | Đường dẫn file media (ảnh, gif, hoặc video). |
| `title`    | `string`     | Nội dung văn bản hiển thị trên overlay.      |
| `alt`      | `string`     | Văn bản thay thế cho ảnh (tùy chọn).         |
| `href`     | `string`     | Đường dẫn liên kết (tùy chọn).               |

## Cách sử dụng

```tsx
<BannerCampaignComponent
  items={[
    {
      id: "1",
      src: "/image/product/product-default.jpg",
      title: "ESSENTIALS THAT ALWAYS HIT",
    },
    {
      id: "2",
      src: "/image/product/product-default.jpg",
      title: "NEW ARRIVALS",
    },
  ]}
  sxLabel={{
    labelPosition: "bottom-left",
    labelWidth: "fit-content",
    sx: { backgroundColor: "rgba(0, 0, 0, 0.7)" },
  }}
/>
```

## Styling

Component sử dụng `Stack` (MUI) để quản lý layout và `tss-react/mui` cho các style chi tiết. Dải overlay mặc định có nền đen bán trong suốt (`#00000080`) và bo góc 2px.
