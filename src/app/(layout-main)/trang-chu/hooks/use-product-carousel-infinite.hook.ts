import { useCallback, useEffect, useRef, useState } from "react";
import { ProductApi } from "@/utils/api";
import { mapApiProductSkuCardsToProductItems } from "@/utils/product.mapper.util";
import type { IParamsGetProducts, IProductSkuCardItem } from "@/utils/api/product/product.interface";
import type { ProductItemProps } from "@/components/product/product-item/product-item.component";
import { CAROUSEL_PAGE_SIZE } from "../_utils/home.utils";

export interface ProductCarouselInfiniteState {
  /** Toàn bộ products đã tích lũy từ page 1..N */
  rawProducts: IProductSkuCardItem[];
  /** ProductItemProps đã map từ rawProducts (dùng cho ProductSliderComponent) */
  items: ProductItemProps[];
  currentPage: number;
  hasNextPage: boolean;
  isLoadingInitial: boolean;
  isLoadingMore: boolean;
  /** Gọi để load page tiếp theo (no-op nếu đang load hoặc không còn page) */
  loadNextPage: () => void;
}

/** Build cache key ổn định từ base params để detect khi block config thay đổi. */
const buildParamsKey = (params: IParamsGetProducts): string =>
  JSON.stringify({
    collectionSlug: params.collectionSlug,
    categorySlug: params.categorySlug,
    categorySlugs: params.categorySlugs,
    productIds: params.productIds,
    sort: params.sort,
  });

/**
 * Infinite load state cho ProductCarouselBlock.
 * Mỗi lần loadNextPage() được gọi, hook fetch page tiếp và append vào products[].
 * Badge được gọi tự động bởi useFetchProductBadgesBatch trong ProductSliderComponent
 * khi items thay đổi — chỉ cho products mới nhờ filterProductsNeedingFetch trong badge queue.
 *
 * @param baseParams - Filter params (từ buildProductCarouselParams), không bao gồm page state
 * @param applyWishlist - Hàm apply wishlist state lên items
 */
export const useProductCarouselInfinite = (
  baseParams: IParamsGetProducts,
  applyWishlist: (items: ProductItemProps[]) => ProductItemProps[],
): ProductCarouselInfiniteState => {
  const [rawProducts, setRawProducts] = useState<IProductSkuCardItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isUnmountedRef = useRef(false);
  const isLoadingMoreRef = useRef(false);
  const baseParamsRef = useRef(baseParams);

  useEffect(() => {
    baseParamsRef.current = baseParams;
  });

  const deduplicateByProductId = useCallback((existing: IProductSkuCardItem[], incoming: IProductSkuCardItem[]): IProductSkuCardItem[] => {
    const existingIds = new Set(existing.map((p) => p.productId));
    const newOnes = incoming.filter((p) => !existingIds.has(p.productId));
    return [...existing, ...newOnes];
  }, []);

  const fetchPage = useCallback(
    async (page: number): Promise<void> => {
      const isPaginated = baseParamsRef.current.isPagination !== false;
      const params: IParamsGetProducts = isPaginated
        ? {
            ...baseParamsRef.current,
            page,
            take: CAROUSEL_PAGE_SIZE,
          }
        : {
            ...baseParamsRef.current,
          };

      try {
        const response = await ProductApi.getProductsSkuCardV2(params);
        if (isUnmountedRef.current) return;

        setRawProducts((prev) => (isPaginated ? deduplicateByProductId(prev, response.list) : response.list));
        setHasNextPage(isPaginated ? !!response.pagination?.hasNextPage : false);
        setCurrentPage(page);
      } catch {
        // Lỗi network/server không block UI — giữ products đang hiển thị
        if (!isUnmountedRef.current) {
          setHasNextPage(false);
        }
      }
    },
    [deduplicateByProductId],
  );

  // Re-fetch trang đầu khi filter params thay đổi
  const paramsKey = buildParamsKey(baseParams);
  useEffect(() => {
    isUnmountedRef.current = false;
    setRawProducts([]);
    setCurrentPage(1);
    setHasNextPage(false);
    setIsLoadingInitial(true);
    isLoadingMoreRef.current = false;

    void fetchPage(1).finally(() => {
      if (!isUnmountedRef.current) {
        setIsLoadingInitial(false);
      }
    });

    return () => {
      isUnmountedRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  const loadNextPage = useCallback(() => {
    if (isLoadingMoreRef.current || !hasNextPage) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    const nextPage = currentPage + 1;
    void fetchPage(nextPage).finally(() => {
      if (!isUnmountedRef.current) {
        setIsLoadingMore(false);
      }
      isLoadingMoreRef.current = false;
    });
  }, [currentPage, fetchPage, hasNextPage]);

  const items = applyWishlist(mapApiProductSkuCardsToProductItems(rawProducts));

  return {
    rawProducts,
    items,
    currentPage,
    hasNextPage,
    isLoadingInitial,
    isLoadingMore,
    loadNextPage,
  };
};
