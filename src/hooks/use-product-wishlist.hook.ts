"use client";

import type { ProductItemProps } from "@/components/product/product-item/product-item.component";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import {
  addWishlistProducts,
  clearWishlistProductIds,
  removeWishlistProducts,
  selectWishlistProductIds,
  setWishlistProductIds,
} from "@/redux/slices/wishlist.slice";
import { ProductApi } from "@/utils/api";
import { getErrorMessage } from "@/utils/helpers/axios";
import type { ApiProduct, ICustomerWishlistResponse } from "@/utils/api/product/product.interface";
import { mapApiProductToProductItem } from "@/utils/product.mapper.util";
import { buildAuthUrl } from "@/utils/helpers/common/navigation";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import useSWR, { useSWRConfig } from "swr";
import { IS_JEWELRY_DEMO_MODE } from "@/mock-api/demo-mode";

const normalizeProductIds = (productIds: string[]) => Array.from(new Set(productIds.map(String)));

const useProductWishlist = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector(selectIsLogin);
  const canUseWishlist = isLogin || IS_JEWELRY_DEMO_MODE;
  const wishlistProductIds = useAppSelector(selectWishlistProductIds);
  const { mutate } = useSWRConfig();
  const { data: wishlistData } = useSWR(canUseWishlist ? "customer-wishlist-product-ids" : null, () =>
    ProductApi.getCustomerWishlistProductIds(),
  );

  const wishlistProductIdSet = useMemo(() => new Set(wishlistProductIds.map(String)), [wishlistProductIds]);

  useEffect(() => {
    if (!canUseWishlist) {
      if (wishlistProductIds.length > 0) {
        dispatch(clearWishlistProductIds());
      }
      return;
    }

    if (!wishlistData) {
      return;
    }

    dispatch(setWishlistProductIds(normalizeProductIds(wishlistData.productIds || [])));
  }, [dispatch, canUseWishlist, wishlistData, wishlistProductIds.length]);

  const handleToggleWishlist = useCallback(
    async (productIds: string[]) => {
      const normalizedProductIds = normalizeProductIds(productIds);

      if (!normalizedProductIds.length) {
        return;
      }

      if (!canUseWishlist) {
        router.push(buildAuthUrl("/dang-nhap"));
        return;
      }

      const previousProductIds = normalizeProductIds(wishlistProductIds);
      const hasWishedProduct = normalizedProductIds.some((productId) => wishlistProductIdSet.has(productId));
      const nextProductIds = hasWishedProduct
        ? previousProductIds.filter((productId) => !normalizedProductIds.includes(productId))
        : normalizeProductIds([...previousProductIds, ...normalizedProductIds]);

      dispatch(setWishlistProductIds(nextProductIds));
      await mutate(
        "customer-wishlist-product-ids",
        {
          total: nextProductIds.length,
          productIds: nextProductIds,
        },
        { revalidate: false },
      );

      try {
        if (hasWishedProduct) {
          await dispatch(removeWishlistProducts(normalizedProductIds)).unwrap();
          void mutate(
            "product/customer/wishlist",
            (current: ICustomerWishlistResponse | undefined) => {
              if (!current?.list) return current;
              const removeSet = new Set(normalizedProductIds.map(String));
              const newList = current.list.filter((item) => !removeSet.has(String(item.productId)));
              return { ...current, total: newList.length, list: newList };
            },
            { revalidate: false },
          );
        } else {
          await dispatch(addWishlistProducts(normalizedProductIds)).unwrap();
          void mutate("product/customer/wishlist", undefined, { revalidate: true });
        }
      } catch (error) {
        dispatch(setWishlistProductIds(previousProductIds));
        await mutate(
          "customer-wishlist-product-ids",
          {
            total: previousProductIds.length,
            productIds: previousProductIds,
          },
          { revalidate: false },
        );
        void mutate("product/customer/wishlist", undefined, { revalidate: true });
        toast.error(getErrorMessage(error) || "Không thể cập nhật danh sách yêu thích. Vui lòng thử lại.");
      }
    },
    [dispatch, canUseWishlist, mutate, router, wishlistProductIdSet, wishlistProductIds],
  );

  const mapWishlistProducts = useCallback(
    (products: ApiProduct[] = []): ProductItemProps[] =>
      products.map((product) => {
        const productItem = mapApiProductToProductItem(product);

        return {
          ...productItem,
          isWishlistActive: wishlistProductIdSet.has(String(product.productId)),
          onToggleFavorite: handleToggleWishlist,
        };
      }),
    [handleToggleWishlist, wishlistProductIdSet],
  );

  const isProductWished = useCallback(
    (productId?: string) => {
      if (!productId) {
        return false;
      }

      return wishlistProductIdSet.has(String(productId));
    },
    [wishlistProductIdSet],
  );

  return {
    handleToggleWishlist,
    isProductWished,
    mapWishlistProducts,
    wishlistProductIds,
  };
};

export default useProductWishlist;
