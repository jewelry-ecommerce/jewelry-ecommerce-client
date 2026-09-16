"use client";

import type { ProductBannerConfig, ProductSortOption } from "@/components";
import { BreadcrumbComponent } from "@/components";
import CategoryScrollerSkeletonComponent from "@/components/category-scroller/category-scroller-skeleton.component";
import ProductCollectionShowcaseSkeleton from "@/components/product/product-collection-showcase/product-collection-showcase-skeleton.component";
import StorefrontBannerRenderer, { isValidBannerPlacementCode } from "@/components/cms/storefront-banner-renderer";
import { CmsApi } from "@/utils/api";
import {
  BlockTypeCode,
  buildScopedNavigationHref,
  buildNavigationHref,
  findFirstNavigationRootWithChildren,
  findNavigationPathByScopedHref,
  findNavigationRootByPath,
  findNavigationPathByHref,
  getNavigationCategoryId,
  getActiveNavigationChildren,
  normalizeNavigationPath,
  resolveStorefrontNavigationPath,
} from "@/utils/api/cms";
import type {
  Block,
  ProductExpandableDescriptionBlockConfig,
  StorefrontNavigationItem,
  TextBlockConfig,
} from "@/utils/api/cms/cms.interface";
import { isCmsRichTextHtmlEmpty } from "@/utils/api/cms";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import useSWR from "swr";
import { usePathname } from "next/navigation";
import ProductListingSection from "./product-listing-section.component";
import type { ProductListingInitialData } from "@/lib/server/product-listing-fetch.server";
import { getCategoryNavLimit, getCategoryNavigationDisplayItems, mapShowcaseItemsFromBlockConfig } from "../_utils/product-cms.utils";
import { buildListingBreadcrumbItems } from "../_utils/listing-breadcrumb.utils";
import { normalizeCmsPageBasePath } from "../_utils/product-page-route.utils";

const CategoryScroller = dynamic(() => import("@/components/category-scroller/category-scroller.component"), {
  loading: () => <CategoryScrollerSkeletonComponent count={20} />,
});

const ProductCollectionShowcase = dynamic(
  () => import("@/components/product/product-collection-showcase/product-collection-showcase.component"),
  {
    loading: () => <ProductCollectionShowcaseSkeleton count={3} />,
  },
);

const ProductCategoryNavigationTags = dynamic(
  () => import("@/components/product/product-category-navigation-tags/product-category-navigation-tags.component"),
);

const ProductExpandableDescription = dynamic(
  () => import("@/components/product/product-expandable-description/product-expandable-description.component"),
);

const CmsTextBlock = dynamic(() => import("@/components/cms/cms-text-block/cms-text-block.component"));

type ProductPageProps = {
  /** Slug trang CMS (vd: san-pham). Mặc định san-pham. */
  cmsPageSlug?: string;
  breadcrumbItems: { label: string; href?: string }[];
  bannerConfigs: ProductBannerConfig[];
  showcaseItems: { id: string; title: string; image?: string; href?: string }[];
  sortOptions: ProductSortOption[];
  defaultSortValue: string;
  initialData?: ProductListingInitialData | null;
};

const Product = ({
  cmsPageSlug = "san-pham",
  breadcrumbItems,
  bannerConfigs,
  sortOptions,
  defaultSortValue,
  initialData,
}: ProductPageProps) => {
  const pathname = usePathname();
  const pageBasePath = useMemo(() => normalizeCmsPageBasePath(cmsPageSlug), [cmsPageSlug]);
  const initialPageData = initialData?.page?.page.slug === cmsPageSlug ? initialData.page : undefined;
  const initialBannerPlacements = initialPageData ? (initialData?.banners ?? {}) : {};

  const { data: pageData, isLoading: isPageLoading } = useSWR(
    `storefront/pages/${cmsPageSlug}`,
    () => CmsApi.getStorefrontPageBySlug(cmsPageSlug),
    {
      fallbackData: initialPageData,
      revalidateOnMount: initialPageData ? false : undefined,
    },
  );

  const contentBlocks = useMemo(() => pageData?.blocks?.slice().sort((a, b) => a.sortOrder - b.sortOrder) ?? [], [pageData?.blocks]);
  const hasContentBlocks = contentBlocks.length > 0;
  const initialProductListBlockId = contentBlocks.find((block) => block.blockTypeCode === BlockTypeCode.PRODUCT_LIST)?.id;

  const { data: navigationData } = useSWR("cms/storefront/navigation", () => CmsApi.getStorefrontNavigation(), {
    fallbackData: initialData?.navigation ?? undefined,
    revalidateOnMount: initialData?.navigation ? false : undefined,
    shouldRetryOnError: false,
  });

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

  const categoryNavBlock = useMemo(
    () => contentBlocks.find((block) => block.blockTypeCode === BlockTypeCode.PRODUCT_CATEGORY_NAV),
    [contentBlocks],
  );
  const categoryNavDisplayItems = useMemo(
    () => getCategoryNavigationDisplayItems(categoryNavigationItems, categoryNavBlock ? getCategoryNavLimit(categoryNavBlock) : undefined),
    [categoryNavBlock, categoryNavigationItems],
  );

  const resolvedBreadcrumbItems = useMemo(
    () =>
      buildListingBreadcrumbItems({
        baseItems: breadcrumbItems,
        navigationPath,
        hrefMode: "scoped",
        pageBasePath,
        sourceNavigationBasePath,
      }),
    [breadcrumbItems, navigationPath, pageBasePath, sourceNavigationBasePath],
  );

  const renderCategoryNav = (block: Block) => {
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

  const renderShowcase = (block: Block) => {
    const items = mapShowcaseItemsFromBlockConfig(block.config);
    const title = block.config.header?.title?.trim() || "TITLE";

    if (!items.length) {
      return null;
    }

    return (
      <ProductCollectionShowcase
        key={block.id}
        title={title}
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

  const renderExpandableDescription = (block: Block) => {
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

  const renderCmsBlock = (block: Block) => {
    switch (block.blockTypeCode) {
      case BlockTypeCode.PRODUCT_CATEGORY_NAV:
        return renderCategoryNav(block);
      case BlockTypeCode.PRODUCT_LIST:
        return (
          <ProductListingSection
            key={block.id}
            bannerConfigs={bannerConfigs}
            sortOptions={sortOptions}
            defaultSortValue={defaultSortValue}
            cmsListBlock={block}
            basePath={pageBasePath}
            initialProductsData={block.id === initialProductListBlockId ? initialData?.products : null}
            initialFilters={block.id === initialProductListBlockId ? initialData?.filters : null}
            initialProductParams={block.id === initialProductListBlockId ? initialData?.productParams : null}
            initialProductListBanners={block.id === initialProductListBlockId ? initialData?.productListBanners : null}
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
          />
        );
      }
      case BlockTypeCode.PRODUCT_COLLECTION_SHOWCASE:
        return renderShowcase(block);
      case BlockTypeCode.PRODUCT_EXPANDABLE_DESCRIPTION:
        return renderExpandableDescription(block);
      case BlockTypeCode.TEXT_BLOCK:
        return renderTextBlock(block);
      default:
        return null;
    }
  };

  return (
    <>
      {hasContentBlocks ? <BreadcrumbComponent items={resolvedBreadcrumbItems} /> : null}
      {isPageLoading && !pageData ? <CategoryScrollerSkeletonComponent count={20} /> : contentBlocks.map((block) => renderCmsBlock(block))}
    </>
  );
};

export default Product;
