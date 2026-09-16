import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectProductBadgesMap } from "@/redux/slices/badge.slice";
import { queueStorefrontBadgesFetch } from "@/utils/api/badge/badge-batch-queue";
import { buildStorefrontBadgeProducts, type BadgeBatchProductSource } from "@/utils/api/badge/badge.util";

/**
 * Gọi POST badge/storefront/products/badges khi danh sách sản phẩm đổi.
 * Dùng ở grid / slider / drawer — product-item đọc kết quả từ Redux.
 */
export const useFetchProductBadgesBatch = (products: BadgeBatchProductSource[]) => {
  const dispatch = useAppDispatch();
  const loadedByProductId = useAppSelector(selectProductBadgesMap);

  const batchProducts = useMemo(() => buildStorefrontBadgeProducts(products), [products]);

  const requestKey = useMemo(
    () =>
      batchProducts
        .map((p) => `${p.productId}:${p.variants.map((v) => v.productVariantId).join(",")}`)
        .sort()
        .join("|"),
    [batchProducts],
  );

  useEffect(() => {
    if (!requestKey) return;
    queueStorefrontBadgesFetch(dispatch, batchProducts, loadedByProductId);
  }, [dispatch, requestKey, batchProducts]);
};
