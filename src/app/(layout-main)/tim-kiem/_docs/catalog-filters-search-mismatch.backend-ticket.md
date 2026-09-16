# Backend ticket: `catalog/products/filters` không khớp `catalog/search`

## Tóm tắt

Với cùng tham số `search`, API lọc sản phẩm trả về mảng rỗng trong khi API tìm kiếm vẫn có kết quả.

## Cách tái hiện

```http
GET /catalog/search?page=1&take=40&isPagination=true&search=nhẫn%20%2F%2F%2F%2F%2F&sort=best_selling
```

**Response:** `200`, `total: 4`, có `list`.

```http
GET /catalog/products/filters?search=nhẫn%20%2F%2F%2F%2F%2F
```

**Response:** `200`, body `[]` (không có section filter).

Decoded `search`: `nhẫn /////`

## Kỳ vọng

- `catalog/products/filters?search=` dùng **cùng logic chuẩn hóa / tokenize** như `catalog/search`.
- Facet phải phản ánh tập sản phẩm mà `catalog/search` trả về với cùng `search`.

## Thực tế

- `catalog/search` có vẻ match theo token `nhẫn` (bỏ qua `/////`).
- `catalog/products/filters` trả `[]` → storefront không hiển thị bộ lọc.

## Tác động

- Trang `/tim-kiem`: có sản phẩm nhưng drawer「Bộ lọc」trống.
- UX kém; user không lọc theo thuộc tính/giá trên kết quả tìm kiếm.

## Gợi ý fix (BE)

1. Extract shared `normalizeSearchQuery(search: string): string` dùng cho cả search và filters.
2. Hoặc filters gọi cùng search service/index với `catalog/search` rồi aggregate facet trên tập kết quả đó.

## Workaround FE (đã làm tạm)

- `normalizeCatalogSearchQuery()` trước khi gọi API và cập nhật URL `query`.
- Empty state khi có sản phẩm nhưng không có filter section.

## Log tham chiếu (dev)

```
catalog/search          → status 200, total: 4, listCount: 4
catalog/products/filters → status 200, sectionCount: 0
```
