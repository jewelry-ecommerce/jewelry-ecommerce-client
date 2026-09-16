import { ProductSortOption } from "@/components";
import { CatalogSortType } from "./product/product.enum";

export const SORT_OPTIONS: ProductSortOption[] = [
  { value: CatalogSortType.BEST_SELLING, label: "Bán chạy nhất" },
  { value: CatalogSortType.PRICE_ASC, label: "Giá tăng dần" },
  { value: CatalogSortType.PRICE_DESC, label: "Giá giảm dần" },
  { value: CatalogSortType.NEWEST, label: "Sản phẩm mới" },
  { value: CatalogSortType.NAME, label: "Tên A -> Z" },
  { value: CatalogSortType.NAME_DESC, label: "Tên Z -> A" },
];
