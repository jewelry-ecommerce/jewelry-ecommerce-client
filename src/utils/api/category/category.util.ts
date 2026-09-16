import type { ApiCategory } from "./category.interface";

/** tạm thời ẩn danh mục packaging khỏi b2c */
export const HIDDEN_CATEGORY_CODES = new Set(["PACKAGING"]);

export const filterVisibleCategories = (categories: ApiCategory[]): ApiCategory[] =>
  categories
    .filter((category) => !HIDDEN_CATEGORY_CODES.has(category.code))
    .map((category) => ({
      ...category,
      children: category.children?.length ? filterVisibleCategories(category.children) : category.children,
    }));
