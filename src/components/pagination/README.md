# Pagination Component Documentation

Tài liệu hướng dẫn sử dụng component **AppPagination**. Component này hỗ trợ phân trang cho danh sách, tự động tính toán số trang, hỗ trợ chọn số lượng hiển thị trên mỗi trang (`take`) và đồng bộ hoàn toàn với URL.

---

## 1. Mẫu sử dụng

### Phân trang cơ bản

```tsx
import { PaginationComponent } from "@/components";

<PaginationComponent
  total={100}
  take={10}
  onChange={(pagination) => {
    console.log("Chuyển sang trang:", pagination.page);
  }}
/>;
```

### Phân trang tích hợp chọn số lượng hiển thị (E-commerce Style)

```tsx
<PaginationComponent
  total={200}
  showPageSize={true}
  pageSizeOptions={[20, 40, 60]}
  itemName="sản phẩm"
  onChange={(pagination) => {
    console.log("Số trang:", pagination.page, "Số lượng mỗi trang:", pagination.take);
  }}
/>
```

---

## 2. Thông tin chi tiết Props

| Prop              | Kiểu dữ liệu     | Mặc định               | Mô tả                                                                             |
| :---------------- | :--------------- | :--------------------- | :-------------------------------------------------------------------------------- |
| `total`           | `number`         | `0`                    | Tổng số item trong danh sách.                                                     |
| `take`            | `number`         | `40`                   | Số lượng item mặc định trên mỗi trang.                                            |
| `page`            | `number`         | `page` từ URL          | Trang hiện tại. Ưu tiên lấy từ tham số `page` trên URL.                           |
| `showPageSize`    | `boolean`        | `false`                | Bật/tắt hiển thị dropdown chọn số lượng sản phẩm mỗi trang.                       |
| `pageSizeOptions` | `number[]`       | `[40, 60]`             | Danh sách các lựa chọn số lượng hiển thị.                                         |
| `itemName`        | `string`         | `"sản phẩm"`           | Đơn vị hiển thị sau phần chọn số lượng (VD: "cái", "tin tức", ...).               |
| `scrollToTop`     | `boolean`        | `true`                 | Tự động cuộn lên đầu trang khi có thay đổi.                                       |
| `siblingCount`    | `number`         | `1` (PC), `0` (Mobile) | Số lượng item hiển thị bên cạnh trang hiện tại.                                   |
| `boundaryCount`   | `number`         | `1`                    | Số lượng item hiển thị ở đầu và cuối dải phân trang.                              |
| `onChange`        | `function`       | -                      | Callback khi có thay đổi: `(pagination: { page: number; take: number }) => void`. |
| `sx`              | `SxProps<Theme>` | -                      | Tùy chỉnh style cho component.                                                    |

---

## 3. Đặc điểm chuyên sâu

- **URL Synchronization**:
  - Tự động đồng bộ tham số `page` và `take` lên URL.
  - Khi thay đổi `take` (số lượng mỗi trang), component sẽ **tự động reset về trang 1**.
  - **URL Parameter Sorting**: Các tham số trên URL sẽ được sắp xếp theo thứ tự alphabet để giữ link sạch và nhất quán (ví dụ: `?page=2&take=60`).
  - **Clean URLs**: Nếu `page=1` hoặc `take` khớp với giá trị mặc định, component sẽ tự động xóa các param đó khỏi URL.
- **Tối ưu hóa Fallback**:
  - Nếu người dùng nhập linh tinh giá trị `take` trên URL, component sẽ tự động fallback về giá trị hợp lệ đầu tiên trong `pageSizeOptions`.
- **Responsive**:
  - Tự động điều chỉnh layout trên thiết bị di động (độ rộng dưới 810px).
- **SEO & Performance**:
  - Sử dụng `Link` từ `next/link` cho các nút bấm số trang để hỗ trợ SEO và chuyển thư mục mượt mà.
  - Sử dụng `useRouter` để điều hướng khi thay đổi cấu hình hiển thị.
