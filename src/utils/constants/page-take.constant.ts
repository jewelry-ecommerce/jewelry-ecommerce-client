/** Số SP mỗi trang — khớp `pageSizeOptions` trên ProductGrid / Pagination. */
export const PRODUCT_LIST_PAGE_SIZE_OPTIONS = [48, 60] as const;

export const PRODUCT_LIST_PAGE_SIZE_DEFAULT = PRODUCT_LIST_PAGE_SIZE_OPTIONS[0];

export const PAGE_TAKE_DEFAULT = { page: 1, take: PRODUCT_LIST_PAGE_SIZE_DEFAULT };

export const resolveProductListTakeFromSearchParams = (
  searchParams: { get: (key: string) => string | null },
  fallback: number = PRODUCT_LIST_PAGE_SIZE_DEFAULT,
): number => {
  const parsed = Number.parseInt(searchParams.get("take") ?? "", 10);

  if (!Number.isNaN(parsed) && parsed > 0 && (PRODUCT_LIST_PAGE_SIZE_OPTIONS as readonly number[]).includes(parsed)) {
    return parsed;
  }

  return fallback;
};
