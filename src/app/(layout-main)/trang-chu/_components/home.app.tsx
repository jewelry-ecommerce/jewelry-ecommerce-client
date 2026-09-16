"use client";
import {
  BreadcrumbComponent,
  FormContactComponent,
  ProductGalleryComponent,
  ProductInfoSliderComponent,
  ProductSliderComponent,
} from "@/components";
import type { ProductSortOption } from "@/components";
import useAddToCart from "@/hooks/cart/use-add-to-cart.hook";
import StorefrontBannerRenderer, { isValidBannerPlacementCode } from "@/components/cms/storefront-banner-renderer";
import { CmsApi } from "@/utils/api";
import { MediaType } from "@/utils/api/banner/banner.enum";
import {
  BlockTypeCode,
  buildNavigationHref,
  buildScopedNavigationHref,
  findFirstNavigationRootWithChildren,
  findNavigationPathByHref,
  findNavigationPathByScopedHref,
  findNavigationRootByPath,
  getActiveNavigationChildren,
  getNavigationCategoryId,
  normalizeNavigationPath,
  resolveStorefrontNavigationPath,
} from "@/utils/api/cms";
import { buildCartViewItemFromProductSkuCard } from "@/utils/api/cart/cart-view-item-builder.util";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import type {
  Block,
  ProductExpandableDescriptionBlockConfig,
  StorefrontNavigationItem,
  TextBlockConfig,
} from "@/utils/api/cms/cms.interface";
import { isCmsRichTextHtmlEmpty } from "@/utils/api/cms";
import type { IProductSkuCardItem } from "@/utils/api/product/product.interface";
import type { ProductItemProps } from "@/components/product/product-item/product-item.component";
import type CartFlow from "@/components/fly-to-cart/cart-flow";
import { useProductWishlist } from "@/hooks";
import { Stack } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo, useCallback, useEffect, useRef } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import HomeSkeletonComponent from "./home-skeleton.component";
import ProductSliderSkeletonComponent from "@/components/product/product-slider/product-slider-skeleton.component";
import CategoryScrollerSkeletonComponent from "@/components/category-scroller/category-scroller-skeleton.component";
import ProductCollectionShowcaseSkeleton from "@/components/product/product-collection-showcase/product-collection-showcase-skeleton.component";
import ProductListingSection from "@/app/(layout-main)/san-pham/_components/product-listing-section.component";
import { LISTING_BREADCRUMB_ITEMS } from "@/app/(layout-main)/san-pham/_constants/listing-page-defaults";
import {
  getCategoryNavLimit,
  getCategoryNavigationDisplayItems,
  mapShowcaseItemsFromBlockConfig,
} from "@/app/(layout-main)/san-pham/_utils/product-cms.utils";
import { buildListingBreadcrumbItems, hasStorefrontPlpBlocks } from "@/app/(layout-main)/san-pham/_utils/listing-breadcrumb.utils";
import {
  extractMixMatchVariationIdsFromImageGalleryConfig,
  mapImageGalleryItemsFromBlockConfig,
} from "@/app/(layout-main)/trang-chu/_utils/image-gallery-cms.utils";
import { useMixMatchProducts } from "@/app/(layout-main)/san-pham/_components/hooks";
import { normalizeCmsPageBasePath } from "@/app/(layout-main)/san-pham/_utils/product-page-route.utils";
import { SORT_OPTIONS } from "@/utils/api/filter.mock";
import { applyWishlistStateToProductItems } from "@/utils/product.mapper.util";
import { useSubscriber } from "../hooks/use-subscriber.hook";
import type { HomeInitialData } from "@/lib/server/home-fetch.server";
import { buildProductCarouselParams } from "../_utils/home.utils";
import { useProductCarouselInfinite } from "../hooks/use-product-carousel-infinite.hook";
import {
  PRODUCT_LISTING_ADD_TO_CART_SELECTOR,
  PRODUCT_LISTING_CART_FLOW_IDLE_TIMEOUT_MS,
  PRODUCT_LISTING_CART_SELECTOR,
} from "@/app/(layout-main)/san-pham/_constants/product-listing-performance.constants";

const CategoryScroller = dynamic(() => import("@/components/category-scroller/category-scroller.component"), {
  ssr: false,
  loading: () => <CategoryScrollerSkeletonComponent count={20} />,
});

const ProductCollectionShowcase = dynamic(
  () => import("@/components/product/product-collection-showcase/product-collection-showcase.component"),
  {
    ssr: false,
    loading: () => <ProductCollectionShowcaseSkeleton count={3} />,
  },
);

const ProductCategoryNavigationTags = dynamic(
  () => import("@/components/product/product-category-navigation-tags/product-category-navigation-tags.component"),
  { ssr: false },
);

const ProductExpandableDescription = dynamic(
  () => import("@/components/product/product-expandable-description/product-expandable-description.component"),
  {
    ssr: false,
  },
);

const CmsTextBlock = dynamic(() => import("@/components/cms/cms-text-block/cms-text-block.component"), {
  ssr: false,
});

interface HomeProps {
  slug?: string;
  initialData?: HomeInitialData | null;
}

// Tách riêng state của FormContactComponent ra tránh bị re-render khi giá trị email thay đổi
const FormContactBlock = ({ block }: { block: Block }) => {
  const subscriberProps = useSubscriber();
  return <FormContactComponent {...subscriberProps} title={block.config?.heading} consentText={block.config?.consentText} />;
};

const ProductCarouselBlock = ({
  block,
  applyWishlistToProductItems,
  onProductClick,
  onAddToCart,
}: {
  block: Block;
  applyWishlistToProductItems: (items: ProductItemProps[]) => ProductItemProps[];
  onProductClick: (productSlug: string) => void;
  onAddToCart: (productId: string, item?: CartViewItem, sourceProducts?: IProductSkuCardItem[]) => unknown;
}) => {
  const baseParams = useMemo(() => buildProductCarouselParams(block), [block]);

  const { items, rawProducts, isLoadingInitial, loadNextPage } = useProductCarouselInfinite(baseParams, applyWishlistToProductItems);

  if (isLoadingInitial) {
    return <ProductSliderSkeletonComponent />;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <ProductSliderComponent
      title={block.config.header?.title}
      subtitle={block.config.header?.subtitle}
      seeMore={block.config.seeMore}
      items={items}
      onProductClick={onProductClick}
      onAddToCart={(productId, item) => onAddToCart(productId, item, rawProducts)}
      onNearEnd={loadNextPage}
    />
  );
};

const ImageGalleryBlock = ({
  block,
  onProductClick,
  onAddToCart,
  applyWishlistToProductItems,
}: {
  block: Block;
  onProductClick: (productSlug: string) => void;
  onAddToCart: (productId: string, item?: CartViewItem) => unknown;
  applyWishlistToProductItems: (items: ProductItemProps[]) => ProductItemProps[];
}) => {
  const mixMatchVariationIds = useMemo(() => extractMixMatchVariationIdsFromImageGalleryConfig(block.config), [block.config]);
  const { productsByVariationId, isLoading: isMixMatchLoading } = useMixMatchProducts(mixMatchVariationIds);

  const galleryItems = useMemo(() => {
    const items = mapImageGalleryItemsFromBlockConfig(block.id, block.config, productsByVariationId);
    return items.map((item) => ({
      ...item,
      mixMatchProducts: item.mixMatchProducts ? applyWishlistToProductItems(item.mixMatchProducts) : [],
    }));
  }, [applyWishlistToProductItems, block.config, block.id, productsByVariationId]);

  return (
    <ProductGalleryComponent
      title={block.config.header?.title}
      subtitle={block.config.header?.subtitle}
      items={galleryItems}
      mixMatchModalTitle={block.config.header?.title}
      isMixMatchLoading={isMixMatchLoading}
      onProductClick={onProductClick}
      onAddToCart={onAddToCart}
    />
  );
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

const Home = ({ slug = "trang-chu", initialData }: HomeProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const initialPageData = initialData?.page.page.slug === slug ? initialData.page : undefined;
  const initialBannerPlacements = initialPageData ? (initialData?.banners ?? {}) : {};
  const pageBasePath = useMemo(() => {
    const currentPath = normalizeCmsPageBasePath(pathname, "");
    if (slug === "trang-chu" && currentPath === "/") {
      return "/";
    }
    return normalizeCmsPageBasePath(slug);
  }, [pathname, slug]);
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

  const { data, isLoading: isPageLoading } = useSWR(`storefront/pages/${slug}`, async () => await CmsApi.getStorefrontPageBySlug(slug), {
    fallbackData: initialPageData,
    revalidateOnMount: initialPageData ? false : undefined,
  });

  const { data: navigationData } = useSWR("cms/storefront/navigation", () => CmsApi.getStorefrontNavigation(), {
    shouldRetryOnError: false,
    revalidateIfStale: false,
  });
  const { handleToggleWishlist, isProductWished } = useProductWishlist();
  const navigationItems = useMemo(() => navigationData?.items ?? [], [navigationData?.items]);
  const menuNavigationPath = useMemo(
    () => findNavigationPathByScopedHref(navigationItems, pathname, pageBasePath) ?? findNavigationPathByHref(navigationItems, pathname),
    [navigationItems, pageBasePath, pathname],
  );
  const rootNavigationItem = useMemo(() => {
    const inferredRoot = findNavigationRootByPath(navigationItems, pageBasePath);
    if (menuNavigationPath?.[0]?.children?.length) return menuNavigationPath[0];
    return inferredRoot ?? menuNavigationPath?.[0] ?? null;
  }, [navigationItems, menuNavigationPath, pageBasePath]);
  const sourceNavigationBasePath = useMemo(
    () => normalizeNavigationPath(rootNavigationItem ? buildNavigationHref(rootNavigationItem) : null) || null,
    [rootNavigationItem],
  );
  const menuCategoryId = useMemo(() => {
    const leaf = menuNavigationPath?.at(-1);
    if (!leaf) {
      return null;
    }

    const leafHref = buildScopedNavigationHref(leaf, pageBasePath, sourceNavigationBasePath) ?? buildNavigationHref(leaf);
    if (normalizeNavigationPath(leafHref) !== normalizeNavigationPath(pathname)) {
      return null;
    }

    return getNavigationCategoryId(leaf);
  }, [menuNavigationPath, pageBasePath, pathname, sourceNavigationBasePath]);
  const shouldLoadPlpRail = Boolean(navigationData);
  const { data: plpRailData } = useSWR(
    shouldLoadPlpRail
      ? ["cms/storefront/navigation/plp-rail", menuCategoryId ?? "", rootNavigationItem?.id ?? "", sourceNavigationBasePath ?? ""]
      : null,
    ([, categoryId, rootTargetId, rootUrl]) =>
      CmsApi.getStorefrontNavigationPlpRail({
        categoryId: categoryId || undefined,
        rootTargetId: categoryId ? undefined : rootTargetId,
        rootUrl: categoryId ? undefined : rootUrl,
      }),
    { shouldRetryOnError: false },
  );
  const plpRailItems = useMemo(() => plpRailData?.items ?? [], [plpRailData?.items]);
  const isPlpRailReady = !shouldLoadPlpRail || Boolean(plpRailData);
  const navigationPath = useMemo(
    () =>
      resolveStorefrontNavigationPath({
        menuItems: navigationItems,
        plpRailItems,
        pathname,
        pageBasePath,
        sourceNavigationBasePath,
      }),
    [navigationItems, pageBasePath, pathname, plpRailItems, sourceNavigationBasePath],
  );
  const currentNavigationItem = navigationPath?.at(-1) ?? null;
  const currentCategoryId = currentNavigationItem ? getNavigationCategoryId(currentNavigationItem) : null;
  const activeNavigationChildren = useMemo(
    () => (isPlpRailReady ? getActiveNavigationChildren(currentNavigationItem, plpRailItems) : []),
    [currentNavigationItem, isPlpRailReady, plpRailItems],
  );
  const isNestedPageNavigation = currentNavigationItem?.type === "PAGE" && (navigationPath?.length ?? 0) > 1;

  const categoryNavigationItems = useMemo<StorefrontNavigationItem[]>(() => {
    if (isNestedPageNavigation) {
      if (activeNavigationChildren.length) return activeNavigationChildren;
      return navigationPath?.at(-2)?.children ?? [];
    }

    if (activeNavigationChildren.length) {
      return activeNavigationChildren;
    }

    if (plpRailItems.length) {
      return plpRailItems;
    }

    // Tránh flash menu items (vd: showOnPlp=false) trước khi plp-rail load xong.
    if (!isPlpRailReady) {
      return [];
    }

    if (navigationPath && navigationPath.length > 1) {
      return navigationPath[navigationPath.length - 2]?.children ?? [];
    }

    return rootNavigationItem?.children ?? findFirstNavigationRootWithChildren(navigationItems)?.children ?? [];
  }, [activeNavigationChildren, isNestedPageNavigation, isPlpRailReady, navigationItems, navigationPath, plpRailItems, rootNavigationItem]);

  const handleAddToCartWithCatalogFallback = (productId: string, item?: CartViewItem, sourceProducts?: IProductSkuCardItem[]) => {
    if (item) {
      return handleAddToCart(productId, 1, item);
    }

    const product = sourceProducts?.find(
      (currentItem) =>
        String(currentItem.productId) === String(productId) ||
        String(currentItem.selectedSku.id) === String(productId) ||
        currentItem.visualSwitch?.options?.some((option) => String(option.sku.id) === String(productId)),
    );

    if (product) {
      return handleAddToCart(productId, 1, buildCartViewItemFromProductSkuCard(product, productId));
    }

    return handleAddToCart(productId);
  };

  const contentBlocks = data?.blocks?.slice().sort((a, b) => a.sortOrder - b.sortOrder) ?? [];
  const categoryNavBlock = contentBlocks.find((block) => block.blockTypeCode === BlockTypeCode.PRODUCT_CATEGORY_NAV);
  const firstBannerBlockId = contentBlocks.find((block) => {
    if (block.blockTypeCode !== BlockTypeCode.BANNER) return false;
    return isValidBannerPlacementCode(block.config?.placementCode);
  })?.id;
  const categoryNavDisplayItems = getCategoryNavigationDisplayItems(
    categoryNavigationItems,
    categoryNavBlock ? getCategoryNavLimit(categoryNavBlock) : undefined,
  );
  const shouldShowListingBreadcrumbs = hasStorefrontPlpBlocks(contentBlocks);
  const resolvedBreadcrumbItems = useMemo(
    () =>
      buildListingBreadcrumbItems({
        baseItems: LISTING_BREADCRUMB_ITEMS,
        navigationPath,
        hrefMode: "canonical",
        pageTitleFallback: data?.page?.name,
      }),
    [data?.page?.name, navigationPath],
  );
  const handleProductClick = (productSlug: string) => {
    router.push(`/san-pham/${productSlug}`);
  };

  const applyWishlistToProductItems = useCallback(
    (items: ProductItemProps[]) => applyWishlistStateToProductItems(items, isProductWished, handleToggleWishlist),
    [handleToggleWishlist, isProductWished],
  );

  const renderProductCategoryNav = (block: Block) => {
    if (!isPlpRailReady) {
      return <CategoryScrollerSkeletonComponent key={block.id} count={20} />;
    }

    const limit = getCategoryNavLimit(block);
    const displayItems = limit ? categoryNavigationItems.slice(0, limit) : categoryNavigationItems;
    return (
      <CategoryScroller
        key={block.id}
        navigationItems={displayItems}
        basePath={pageBasePath}
        sourceBasePath={sourceNavigationBasePath}
        activeNavigationItemId={currentNavigationItem?.id}
        activeCategoryId={currentCategoryId}
      />
    );
  };

  const renderProductShowcase = (block: Block) => {
    const items = mapShowcaseItemsFromBlockConfig(block.config);
    if (!items.length) {
      return null;
    }

    return (
      <ProductCollectionShowcase
        key={block.id}
        title={block.config.header?.title?.trim() || "TITLE"}
        items={items}
        tags={[]}
        footer={
          <ProductCategoryNavigationTags
            navigationItems={categoryNavDisplayItems}
            basePath={pageBasePath}
            sourceBasePath={sourceNavigationBasePath}
          />
        }
      />
    );
  };

  const renderProductExpandableDescription = (block: Block) => {
    const config = block.config as ProductExpandableDescriptionBlockConfig;
    const title = config.title?.trim() || config.header?.title?.trim() || "";
    const description = config.description ?? "";
    if (!title && isCmsRichTextHtmlEmpty(description)) {
      return null;
    }

    return (
      <ProductExpandableDescription
        key={block.id}
        title={title || "TITLE"}
        description={description}
        maxCollapsedLines={Number(block.config.maxCollapsedLines) || 3}
      />
    );
  };

  const renderTextBlock = (block: Block) => {
    const config = block.config as TextBlockConfig;
    return <CmsTextBlock key={block.id} title={config.title} content={config.content} />;
  };

  if (isPageLoading && !data) {
    return <HomeSkeletonComponent />;
  }

  return (
    <Stack>
      {shouldShowListingBreadcrumbs ? <BreadcrumbComponent items={resolvedBreadcrumbItems} /> : null}
      {contentBlocks.map((block) => {
        switch (block.blockTypeCode) {
          case BlockTypeCode.PRODUCT_CAROUSEL:
            return (
              <ProductCarouselBlock
                key={block.id}
                block={block}
                applyWishlistToProductItems={applyWishlistToProductItems}
                onProductClick={handleProductClick}
                onAddToCart={handleAddToCartWithCatalogFallback}
              />
            );
          case BlockTypeCode.PRODUCT_CATEGORY_NAV:
            return renderProductCategoryNav(block);
          case BlockTypeCode.PRODUCT_LIST:
            return (
              <ProductListingSection
                key={block.id}
                bannerConfigs={[]}
                sortOptions={SORT_OPTIONS as ProductSortOption[]}
                defaultSortValue={SORT_OPTIONS[0]?.value || ""}
                cmsListBlock={block}
                basePath={pageBasePath}
              />
            );
          case BlockTypeCode.PRODUCT_COLLECTION_SHOWCASE:
            return renderProductShowcase(block);
          case BlockTypeCode.PRODUCT_EXPANDABLE_DESCRIPTION:
            return renderProductExpandableDescription(block);
          case BlockTypeCode.TEXT_BLOCK:
            return renderTextBlock(block);
          case BlockTypeCode.INFO_CARDS: {
            const desktopColumns = block.config.display?.columns ?? 3;
            return (
              <ProductInfoSliderComponent
                key={block.id}
                title={block.config.header?.title}
                subtitle={block.config.header?.subtitle}
                itemsToShow={{ lg: desktopColumns, xl: desktopColumns }}
                items={
                  block.config.items?.map((item) => {
                    const isVideo = item.mediaType === MediaType.VIDEO;
                    return {
                      title: item.title || "",
                      subtitle: item.description,
                      src: isVideo ? item.videoUrl || "" : item.imageUrl || "",
                      alt: item.title || "",
                      mediaType: item.mediaType,
                      posterSrc: isVideo ? item.thumbnailUrl : undefined,
                      actionLabel: item.actionText,
                      href: item.actionUrl,
                    };
                  }) || []
                }
              />
            );
          }
          case BlockTypeCode.IMAGE_GALLERY:
            return (
              <ImageGalleryBlock
                key={block.id}
                block={block}
                onProductClick={handleProductClick}
                onAddToCart={(productId, item) => handleAddToCartWithCatalogFallback(productId, item)}
                applyWishlistToProductItems={applyWishlistToProductItems}
              />
            );
          case BlockTypeCode.BANNER: {
            const placementCode = block.config?.placementCode;
            if (!isValidBannerPlacementCode(placementCode)) {
              return null;
            }
            const resolvedPlacementCode = placementCode.trim();
            return (
              <StorefrontBannerRenderer
                key={block.id}
                placementCode={resolvedPlacementCode}
                initialPlacement={initialBannerPlacements[resolvedPlacementCode]}
                priority={block.id === firstBannerBlockId}
              />
            );
          }
          case BlockTypeCode.NEWSLETTER_SIGNUP:
            return <FormContactBlock key={block.id} block={block} />;
          default:
            return null;
        }
      })}
    </Stack>
  );
};

export default Home;
