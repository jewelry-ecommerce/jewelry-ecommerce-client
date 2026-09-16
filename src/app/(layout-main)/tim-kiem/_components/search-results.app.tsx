"use client";

import { ProductFilterControls, type ProductFilterSection, type ProductSortOption } from "@/components";
import StickyBelowHeaderBar from "@/components/sticky-below-header/sticky-below-header.component";
import ProductGridSkeleton from "@/components/product/product-grid/product-grid-skeleton.component";
import ProductGridComponent from "@/components/product/product-grid/product-grid.component";
import ProductEmptyState from "@/components/product/product-empty-state/product-empty-state.component";
import { useProductWishlist } from "@/hooks";
import useAddToCart from "@/hooks/cart/use-add-to-cart.hook";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import { buildCartViewItemFromProductCard } from "@/utils/api/cart/cart-view-item-builder.util";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { useSearchFilters, useSearchProducts, useSearchQueryFromParams } from "./hooks/use-search-data.hook";
import type CartFlow from "@/components/fly-to-cart/cart-flow";
import {
  PRODUCT_LISTING_ADD_TO_CART_SELECTOR,
  PRODUCT_LISTING_CART_FLOW_IDLE_TIMEOUT_MS,
  PRODUCT_LISTING_CART_SELECTOR,
} from "@/app/(layout-main)/san-pham/_constants/product-listing-performance.constants";

type SearchResultsAppProps = {
  take: number;
  sortOptions: ProductSortOption[];
  defaultSortValue: string;
};

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

const SEARCH_FILTERS_EMPTY_MESSAGE = "Không có bộ lọc cho từ khóa này.";

const SearchResultsApp = ({ take, sortOptions, defaultSortValue }: SearchResultsAppProps) => {
  // Hook
  const router = useRouter();
  const { rawQuery, currentQuery } = useSearchQueryFromParams();
  // State
  const [filterSections, setFilterSections] = useState<ProductFilterSection[]>([]);
  const [appliedFilterSections, setAppliedFilterSections] = useState<ProductFilterSection[]>([]);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [sortValue, setSortValue] = useState(defaultSortValue);

  // function
  const { productsData, isLoading, currentTake } = useSearchProducts(
    take,
    sortValue,
    shouldFetch ? appliedFilterSections : [],
    true,
    currentQuery,
  );
  const { filterSections: apiFilterSections, isLoading: isFiltersLoading } = useSearchFilters(currentQuery);
  const { mapWishlistProducts } = useProductWishlist();
  const { handleAddToCart } = useAddToCart({ openCartDrawerOnSuccess: true });
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
    if (rawQuery === currentQuery) {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (currentQuery) {
      params.set("query", currentQuery);
    } else {
      params.delete("query");
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `/tim-kiem?${nextQuery}` : "/tim-kiem", { scroll: false });
  }, [rawQuery, currentQuery, router]);

  useEffect(() => {
    setFilterSections(apiFilterSections);
    setAppliedFilterSections([]);
    setShouldFetch(false);
  }, [apiFilterSections, currentQuery]);

  const productsList = useMemo(() => mapWishlistProducts(productsData?.list || []), [mapWishlistProducts, productsData?.list]);
  const resultCount = productsData?.pagination?.total ?? productsData?.total ?? productsList.length;
  const drawerEmptyMessage =
    !isFiltersLoading && apiFilterSections.length === 0 && resultCount > 0 ? SEARCH_FILTERS_EMPTY_MESSAGE : undefined;

  const resolveOptimisticItemFromList = useCallback(
    (productId: string): CartViewItem | undefined => {
      const product = productsList.find((item) => String(item.id) === String(productId));

      if (!product) {
        return undefined;
      }

      return buildCartViewItemFromProductCard(product);
    },
    [productsList],
  );

  const handleAddToCartWithCatalogFallback = useCallback(
    (variationId: string, item?: CartViewItem) => {
      const optimisticItem = item ?? resolveOptimisticItemFromList(variationId);
      return handleAddToCart(variationId, 1, optimisticItem);
    },
    [resolveOptimisticItemFromList, handleAddToCart],
  );

  const handleProductClick = (productSlug: string) => {
    router.push(`/san-pham/${productSlug}`);
  };

  const handleSubmitFilters = (sections?: ProductFilterSection[]) => {
    setAppliedFilterSections(sections ?? filterSections);
    setShouldFetch(true);
  };

  return (
    <>
      <Box
        sx={{
          pt: "24px",
          px: "16px",
          pb: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <Typography
          sx={{
            color: "#A5A5A5",
            ...TYPOGRAPHY_STYLES.xl.regular,
          }}
        >
          Kết quả tìm kiếm
        </Typography>
        <Typography
          sx={{
            color: "#27251F",
            textTransform: "uppercase",
            ...TYPOGRAPHY_STYLES["3xl"].bold,
          }}
        >
          {currentQuery ? `"${currentQuery}"` : "Kết quả"}
        </Typography>
        <Typography
          sx={{
            color: "#A5A5A5",
            ...TYPOGRAPHY_STYLES.xl.regular,
          }}
        >
          {resultCount} kết quả
        </Typography>
      </Box>

      <Box sx={{ height: "40px" }} />

      <StickyBelowHeaderBar>
        <ProductFilterControls
          drawerTitle="Bộ lọc sản phẩm"
          sections={filterSections}
          onSectionsChange={setFilterSections}
          appliedSections={appliedFilterSections}
          sortValue={sortValue}
          sortOptions={sortOptions}
          onSortChange={setSortValue}
          resultCount={resultCount}
          onSubmit={handleSubmitFilters}
          shouldFetch={shouldFetch}
          setShouldFetch={setShouldFetch}
          drawerEmptyMessage={drawerEmptyMessage}
        />
      </StickyBelowHeaderBar>

      <Box sx={{ pb: "16px" }}>
        {isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : productsList.length === 0 ? (
          <ProductEmptyState />
        ) : (
          <ProductGridComponent
            products={productsList}
            pagination={{
              total: resultCount,
              take: currentTake,
            }}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCartWithCatalogFallback}
          />
        )}
      </Box>
    </>
  );
};

export default SearchResultsApp;
