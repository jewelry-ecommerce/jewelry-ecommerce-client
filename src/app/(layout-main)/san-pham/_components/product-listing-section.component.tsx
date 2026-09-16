"use client";

import type { ProductBannerConfig, ProductFilterSection, ProductSortOption } from "@/components";
import type { ProductItemProps } from "@/components/product/product-item/product-item.component";
import ProductEmptyState from "@/components/product/product-empty-state/product-empty-state.component";
import ProductGridSkeleton from "@/components/product/product-grid/product-grid-skeleton.component";
import { PRODUCT_GRID_PRODUCTS_PER_ROW } from "@/components/product/product-grid/product-grid.constants";
import { useProductWishlist } from "@/hooks";
import useAddToCart from "@/hooks/cart/use-add-to-cart.hook";
import type { Block } from "@/utils/api/cms/cms.interface";
import type { ProductListBannerStorefrontResponse } from "@/utils/api/banner/banner.interface";
import type { IParamsGetProducts, IProductFiltersResponse, IProductSkuCardResponse } from "@/utils/api/product/product.interface";
import { buildCartViewItemFromProductCard } from "@/utils/api/cart/cart-view-item-builder.util";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import { applyWishlistStateToProductItems, mapApiProductSkuCardsToProductItems, mapFilterSections } from "@/utils/product.mapper.util";
import StickyBelowHeaderBar from "@/components/sticky-below-header/sticky-below-header.component";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import type CartFlow from "@/components/fly-to-cart/cart-flow";
import { buildProductCarouselParams } from "@/app/(layout-main)/trang-chu/_utils/home.utils";
import {
  PRODUCT_LISTING_ADD_TO_CART_SELECTOR,
  PRODUCT_LISTING_CART_FLOW_IDLE_TIMEOUT_MS,
  PRODUCT_LISTING_CART_SELECTOR,
} from "../_constants/product-listing-performance.constants";
import {
  extractMixMatchVariationIdsFromProductListBanners,
  mapProductListBannerConfigsFromStorefrontResponse,
  mergeMixMatchProductsIntoBannerConfigs,
  resolveProductListBannerFetchContext,
} from "../_utils/product-cms.utils";
import { useMixMatchProducts, useProductData, useProductDataByFilter, useProductListUrl } from "./hooks";
import { applyFilterValuesToSections, isDefaultProductPriceRange } from "../_utils/product-list-query.utils";
import { BannerApi } from "@/utils/api";
import { PAGE_TAKE_DEFAULT } from "@/utils/constants/page-take.constant";

const ProductFilterControls = dynamic(() => import("@/components/product/product-filter-controls/product-filter-controls.component"), {
  loading: () => null,
});

const ProductGridComponent = dynamic(() => import("@/components/product/product-grid/product-grid.component"), {
  loading: () => <ProductGridSkeleton count={PRODUCT_GRID_PRODUCTS_PER_ROW} />,
});

type ProductListingSectionProps = {
  bannerConfigs: ProductBannerConfig[];
  sortOptions: ProductSortOption[];
  defaultSortValue: string;
  cmsListBlock?: Block | null;
  basePath?: string;
  initialProductsData?: IProductSkuCardResponse | null;
  initialFilters?: IProductFiltersResponse | null;
  initialProductParams?: IParamsGetProducts | null;
  initialProductListBanners?: ProductListBannerStorefrontResponse | null;
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

const ProductListingSection = ({
  bannerConfigs,
  sortOptions,
  defaultSortValue,
  cmsListBlock,
  basePath,
  initialProductsData,
  initialFilters,
  initialProductParams,
  initialProductListBanners,
}: ProductListingSectionProps) => {
  const router = useRouter();
  const cmsListDefaults = useMemo<IParamsGetProducts | null>(
    () => (cmsListBlock ? buildProductCarouselParams(cmsListBlock) : null),
    [cmsListBlock],
  );
  const resolvedDefaultSortValue = cmsListDefaults?.sort || defaultSortValue;
  const resolvedDefaultTake = PAGE_TAKE_DEFAULT.take;
  const { sortValue, filterValues, priceRange, applyFilters, applyPriceRange, applySort, clearFilters } = useProductListUrl(
    resolvedDefaultSortValue,
    resolvedDefaultTake,
  );
  const initialFilterSections = useMemo(() => mapFilterSections(initialFilters || []), [initialFilters]);
  const [filterSections, setFilterSections] = useState<ProductFilterSection[]>(initialFilterSections);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const { productsData, isLoading, apiFilterSections, currentPage, currentTake, currentSlug, currentPathSlugs } = useProductData(
    cmsListDefaults,
    basePath,
    initialProductsData,
    initialFilters,
    initialProductParams,
    defaultSortValue,
  );

  const appliedFilterSections = useMemo(
    () => applyFilterValuesToSections(apiFilterSections, filterValues),
    [apiFilterSections, filterValues],
  );
  const hasAppliedFilters = filterValues.length > 0 || !isDefaultProductPriceRange(priceRange);

  const { productsDataByFilter } = useProductDataByFilter(
    sortValue,
    filterSections,
    isFilterDrawerOpen,
    basePath,
    cmsListDefaults?.categorySlug,
    cmsListDefaults?.categorySlugs,
    cmsListDefaults?.collectionSlug,
  );
  const { handleToggleWishlist, isProductWished } = useProductWishlist();
  const { handleAddToCart } = useAddToCart({ openCartDrawerOnSuccess: true });

  const applyWishlistToProductItems = useCallback(
    (items: ProductItemProps[]) => applyWishlistStateToProductItems(items, isProductWished, handleToggleWishlist),
    [handleToggleWishlist, isProductWished],
  );

  useEffect(() => {
    setFilterSections(applyFilterValuesToSections(apiFilterSections, filterValues));
  }, [apiFilterSections, filterValues]);

  const productsList = useMemo(
    () => applyWishlistToProductItems(mapApiProductSkuCardsToProductItems(productsData?.list || [])),
    [applyWishlistToProductItems, productsData?.list],
  );
  const totalProducts = productsData?.pagination?.total ?? productsData?.total ?? productsList.length;
  const filterPreviewCount = productsDataByFilter?.pagination?.total ?? productsDataByFilter?.total ?? totalProducts;
  const filterResultCount = isFilterDrawerOpen ? filterPreviewCount : totalProducts;
  const mixMatchBannerContext = useMemo(
    () => ({
      categorySlug: currentSlug,
      categoryPathSlugs: currentPathSlugs,
    }),
    [currentPathSlugs, currentSlug],
  );
  const productListBannerFetchContext = useMemo(
    () => resolveProductListBannerFetchContext(cmsListBlock, mixMatchBannerContext.categorySlug),
    [cmsListBlock, mixMatchBannerContext.categorySlug],
  );

  const { data: productListBanners } = useSWR(
    cmsListBlock && productListBannerFetchContext.shouldFetch
      ? ["banner/storefront/product/list", productListBannerFetchContext.contextSlug, productListBannerFetchContext.isCategory]
      : null,
    () => BannerApi.getProductListBannersApi(productListBannerFetchContext.contextSlug, productListBannerFetchContext.isCategory),
    {
      fallbackData: initialProductListBanners ?? undefined,
      shouldRetryOnError: false,
    },
  );

  const mixMatchVariationIds = useMemo(
    () => (cmsListBlock ? extractMixMatchVariationIdsFromProductListBanners(productListBanners) : []),
    [cmsListBlock, productListBanners],
  );

  const { productsByVariationId, isLoading: isMixMatchLoading } = useMixMatchProducts(mixMatchVariationIds);

  const cmsBannerConfigs = useMemo(() => {
    if (!cmsListBlock) return [];

    const bannerConfigs = mapProductListBannerConfigsFromStorefrontResponse(productListBanners);
    const mergedBanners = mergeMixMatchProductsIntoBannerConfigs(bannerConfigs, productsByVariationId);

    return mergedBanners.map((banner) => {
      if (banner.type !== "product" || !Array.isArray(banner.product) || !banner.product.length) {
        return banner;
      }

      return {
        ...banner,
        product: applyWishlistToProductItems(banner.product),
      };
    });
  }, [applyWishlistToProductItems, cmsListBlock, productListBanners, productsByVariationId]);

  const resolvedBannerConfigs = useMemo(() => {
    const sourceBannerConfigs = cmsListBlock && cmsBannerConfigs.length ? cmsBannerConfigs : bannerConfigs;

    return sourceBannerConfigs
      .map((banner) => {
        if (banner.type === "product") {
          const products = Array.isArray(banner.product) ? banner.product : banner.product ? [banner.product] : [];
          if (products.length) {
            return banner;
          }

          if (banner.mixMatchVariationIds?.length) {
            return isMixMatchLoading ? banner : null;
          }

          return {
            ...banner,
            product: productsList.slice(0, 3),
          };
        }

        return banner;
      })
      .filter((banner): banner is ProductBannerConfig => Boolean(banner));
  }, [bannerConfigs, cmsBannerConfigs, cmsListBlock, isMixMatchLoading, productsList]);

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

  const handleProductClick = (productSlug: string) => {
    router.push(`/san-pham/${productSlug}`);
  };

  return (
    <>
      <StickyBelowHeaderBar>
        <ProductFilterControls
          drawerTitle="Bộ lọc sản phẩm"
          sections={filterSections}
          onSectionsChange={setFilterSections}
          appliedSections={appliedFilterSections}
          sortValue={sortValue}
          sortOptions={sortOptions}
          onSortChange={applySort}
          resultCount={filterResultCount}
          onDrawerOpenChange={setIsFilterDrawerOpen}
          onSubmit={(sections) => {
            applyFilters(sections ?? filterSections);
          }}
          priceRange={priceRange}
          onPriceRangeCommit={applyPriceRange}
          shouldFetch={hasAppliedFilters}
          setShouldFetch={(value) => {
            if (!value) {
              clearFilters();
            }
          }}
        />
      </StickyBelowHeaderBar>

      {isLoading ? (
        <ProductGridSkeleton count={currentTake} />
      ) : productsList.length === 0 ? (
        <ProductEmptyState />
      ) : (
        <ProductGridComponent
          products={productsList}
          banners={resolvedBannerConfigs}
          pagination={{
            total: totalProducts,
            take: currentTake,
            page: currentPage,
          }}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCartWithCatalogFallback}
        />
      )}
    </>
  );
};

export default ProductListingSection;
