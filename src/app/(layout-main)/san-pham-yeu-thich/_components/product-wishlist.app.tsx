"use client";

import { BreadcrumbComponent } from "@/components";
import EmptyComponent from "@/components/empty/empty.component";
import ProductItemComponent from "@/components/product/product-item/product-item.component";
import useAddToCart from "@/hooks/cart/use-add-to-cart.hook";
import { useProductWishlist } from "@/hooks";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectIsAuthResolved, selectIsLogin } from "@/redux/slices/auth.slice";
import { setWishlistProductIds } from "@/redux/slices/wishlist.slice";
import { buildCartViewItemFromProductCard } from "@/utils/api/cart/cart-view-item-builder.util";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import { ProductApi } from "@/utils/api";
import { Box, Skeleton, Stack, Typography } from "@mui/material";
import { buildAuthUrl } from "@/utils/helpers/common/navigation";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import useSWR from "swr";
import { ICustomerWishlistResponse } from "@/utils/api/product/product.interface";
import { useFetchProductBadgesBatch } from "@/hooks/use-fetch-product-badges-batch.hook";
import { mapApiProductsToProductItems } from "@/utils/product.mapper.util";
import useStyles from "./product-wishlist.styles";
import type CartFlow from "@/components/fly-to-cart/cart-flow";
import {
  PRODUCT_LISTING_ADD_TO_CART_SELECTOR,
  PRODUCT_LISTING_CART_FLOW_IDLE_TIMEOUT_MS,
  PRODUCT_LISTING_CART_SELECTOR,
} from "@/app/(layout-main)/san-pham/_constants/product-listing-performance.constants";

const SectionSkeleton = () => (
  <Stack sx={{ gap: "24px" }}>
    <Skeleton variant="text" width={220} height={24} />
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: "24px" }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Stack key={index} sx={{ gap: "12px" }}>
          <Skeleton variant="rectangular" height={320} sx={{ borderRadius: "0px" }} />
          <Skeleton variant="text" width="80%" height={24} />
          <Skeleton variant="text" width="55%" height={20} />
        </Stack>
      ))}
    </Box>
  </Stack>
);

const scheduleCartFlowInitialization = (callback: () => void): (() => void) => {
  if (typeof window.requestIdleCallback === "function") {
    const idleId = window.requestIdleCallback(callback, { timeout: PRODUCT_LISTING_CART_FLOW_IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = window.setTimeout(callback, PRODUCT_LISTING_CART_FLOW_IDLE_TIMEOUT_MS);
  return () => window.clearTimeout(timeoutId);
};

const createCartFlow = async (): Promise<CartFlow | null> => {
  if (!document.querySelector(PRODUCT_LISTING_CART_SELECTOR)) {
    return null;
  }

  const { default: CartFlowModule } = await import("@/components/fly-to-cart/cart-flow");
  return new CartFlowModule({
    cartSelector: PRODUCT_LISTING_CART_SELECTOR,
    buttonSelector: PRODUCT_LISTING_ADD_TO_CART_SELECTOR,
  });
};

const ProductWishlistApp = () => {
  const { classes } = useStyles();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthResolved = useAppSelector(selectIsAuthResolved);
  const isLogin = useAppSelector(selectIsLogin);
  const { handleAddToCart } = useAddToCart({ openCartDrawerOnSuccess: true });
  const { handleToggleWishlist } = useProductWishlist();
  const cartFlowRef = useRef<CartFlow | null>(null);

  useEffect(() => {
    let isActive = true;
    const cancelInitialization = scheduleCartFlowInitialization(() => {
      void createCartFlow().then((cartFlow) => {
        if (!isActive || !cartFlow) return;
        cartFlowRef.current = cartFlow;
      });
    });

    return () => {
      isActive = false;
      cancelInitialization();
      cartFlowRef.current?.destroy();
      cartFlowRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isAuthResolved) return;

    if (!isLogin) {
      router.replace(buildAuthUrl("/dang-nhap"));
    }
  }, [isAuthResolved, isLogin, router]);

  const wishlistKey = isAuthResolved && isLogin ? "product/customer/wishlist" : null;
  const { data, isLoading } = useSWR<ICustomerWishlistResponse>(wishlistKey, () => ProductApi.getCustomerWishlist());

  const wishlistProductIdsFromApi = useMemo(() => (data?.list || []).map((item) => String(item.productId)), [data?.list]);
  const wishlistProducts = useMemo(() => mapApiProductsToProductItems(data?.list || []), [data?.list]);
  useFetchProductBadgesBatch(wishlistProducts);

  useEffect(() => {
    dispatch(setWishlistProductIds(wishlistProductIdsFromApi));
  }, [dispatch, wishlistProductIdsFromApi]);

  const handleRemoveFromWishlist = useCallback(
    async (productIds: string[]) => {
      await handleToggleWishlist(productIds);
    },
    [handleToggleWishlist],
  );

  const resolveOptimisticItemFromList = useCallback(
    (productId: string): CartViewItem | undefined => {
      const product = wishlistProducts.find((item) => String(item.id) === String(productId));

      if (!product) {
        return undefined;
      }

      return buildCartViewItemFromProductCard(product);
    },
    [wishlistProducts],
  );

  const handleAddToCartWithCatalogFallback = useCallback(
    (variationId: string, item?: CartViewItem) => {
      const optimisticItem = item ?? resolveOptimisticItemFromList(variationId);
      return handleAddToCart(variationId, 1, optimisticItem);
    },
    [resolveOptimisticItemFromList, handleAddToCart],
  );

  return (
    <Box className={classes.root}>
      <Box className={classes.container}>
        {!isAuthResolved || !isLogin ? null : (
          <Box className={classes.stack}>
            <BreadcrumbComponent items={[{ label: "Trang chủ", href: "/" }, { label: "Danh sách yêu thích" }]} />
            <Typography className={classes.title}>Danh sách yêu thích</Typography>
            {isLoading ? (
              <SectionSkeleton />
            ) : wishlistProducts.length === 0 ? (
              <Box className={classes.emptyState}>
                <EmptyComponent
                  url="/image/icons/icon-empty-wishlist.svg"
                  title="Chưa có sản phẩm yêu thích"
                  subtitle="Danh sách yêu thích đang chờ những lựa chọn mang dấu ấn riêng của bạn."
                  buttonText="Bắt Đầu Mua Sắm"
                  onClick={() => router.push("/san-pham")}
                />
              </Box>
            ) : (
              <Box className={classes.grid}>
                {wishlistProducts.map((product) => (
                  <Box key={product.id} className={classes.gridItem}>
                    <ProductItemComponent
                      {...product}
                      isWishlistActive
                      onAddToCart={handleAddToCartWithCatalogFallback}
                      onToggleFavorite={handleRemoveFromWishlist}
                      onClick={(slug) => router.push(`/san-pham/${slug}`)}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProductWishlistApp;
