"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BreadcrumbComponent, ProductSliderComponent } from "@/components";
import { useProductWishlist } from "@/hooks";
import ProductZoomComponent from "@/components/product/product-zoom/product-zoom.component";
import useSWR from "swr";
import { ProductApi } from "@/utils/api";
import ProductDrawerComponent from "@/components/product/product-drawer/product-drawer.component";
import { MediaType } from "@/utils/api/banner";
import type { IProductBySlugResponse, IProductVariation } from "@/utils/api/product/product.interface";
import ProductDetailContent, { MediaItem } from "./_components/product-detail-content.component";
import ProductReview from "./_components/product-review/product-review.component";
import { useRouter } from "next/navigation";
import useAddToCart from "@/hooks/cart/use-add-to-cart.hook";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import { resolveViewableVariation, safeTrackViewItemFromProductDetail } from "@/lib/gtm/track-view-item";
import { buildCartViewItemFromProductSkuCard } from "@/utils/api/cart/cart-view-item-builder.util";
import { mapApiProductSkuCardsToProductItems, applyWishlistStateToProductItems } from "@/utils/product.mapper.util";
import type { ProductItemProps } from "@/components/product/product-item/product-item.component";
import { resolveCdnImageUrl, toCdnOriginalWebpUrl } from "@/utils/cdn";
import { getMediaType } from "@/utils/helpers/common/common.helpers";
import { useProductDefaultImage } from "@/components/providers.component";
import type CartFlow from "@/components/fly-to-cart/cart-flow";
import {
  PRODUCT_LISTING_ADD_TO_CART_SELECTOR,
  PRODUCT_LISTING_CART_FLOW_IDLE_TIMEOUT_MS,
  PRODUCT_LISTING_CART_SELECTOR,
} from "@/app/(layout-main)/san-pham/_constants/product-listing-performance.constants";

interface ProductDetailAppProps {
  slug: string;
  initialData: IProductBySlugResponse;
}

const scheduleCartFlowInitialization = (callback: () => void): (() => void) => {
  if (typeof window.requestIdleCallback === "function") {
    const idleId = window.requestIdleCallback(callback, { timeout: PRODUCT_LISTING_CART_FLOW_IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = window.setTimeout(callback, PRODUCT_LISTING_CART_FLOW_IDLE_TIMEOUT_MS);
  return () => window.clearTimeout(timeoutId);
};

const resolveDefaultVariation = (product?: IProductBySlugResponse | null): IProductVariation | undefined => {
  if (!product) return undefined;
  if (product.defaultVariant) return product.defaultVariant;
  if (!product.defaultVariantId) return undefined;
  return product.variants?.find((variant) => variant.id === product.defaultVariantId);
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

const ProductDetailApp = ({ slug, initialData }: ProductDetailAppProps) => {
  const productDefaultImage = useProductDefaultImage();

  // state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<IProductVariation | undefined>(() => resolveDefaultVariation(initialData));
  const viewItemTrackedSlugRef = useRef<string | null>(null);
  const recentlyViewedRecordedSlugRef = useRef<string | null>(null);
  const cartFlowRef = useRef<CartFlow | null>(null);

  // hook
  const { handleAddToCart } = useAddToCart({ openCartDrawerOnSuccess: true });
  const router = useRouter();

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

  // function
  const { data: productData = initialData } = useSWR(slug ? `catalog/products/${slug}` : null, () => ProductApi.getProductBySlug(slug), {
    fallbackData: initialData,
    onSuccess: (data) => {
      if (selectedVariation) return;
      const defaultVar = resolveDefaultVariation(data);
      if (defaultVar) {
        setSelectedVariation(defaultVar);
      }
    },
  });

  const { data: relatedData } = useSWR(slug ? `catalog/products/${slug}/mix-match` : null, () => ProductApi.getProductMixMatchBySlug(slug));

  const { data: giftsData } = useSWR(slug ? `catalog/products/${slug}/gifts` : null, () => ProductApi.getProductGiftsBySlug(slug));

  const { data: promotionsData } = useSWR(slug ? `catalog/products/${slug}/promotions` : null, () =>
    ProductApi.getProductPromotionsBySlug(slug),
  );

  const { data: reviewSummaryData } = useSWR(slug ? `catalog/products/${slug}/reviews-summary` : null, () =>
    ProductApi.getProductReviewSummaryBySlug(slug),
  );

  const productId = productData?.id;
  const { data: productInfosData } = useSWR(productId ? `catalog/product-info/${productId}` : null, () => {
    return ProductApi.getProductInfo(productId);
  });

  const productSlug = productData?.slug;

  const relatedProductsKey = productSlug ? (["pdp-related-products", productSlug] as const) : null;

  const { data: relatedProductsData } = useSWR(
    relatedProductsKey,
    ([, safeProductSlug]) => ProductApi.getRelatedProductsByProductSlug(safeProductSlug),
    { revalidateOnFocus: false },
  );

  const relatedSkuCardItems = relatedProductsData?.list ?? [];

  const recentlyViewedKey = productSlug ? (["pdp-recently-viewed-products", productSlug] as const) : null;

  const { data: recentlyViewedData } = useSWR(
    recentlyViewedKey,
    ([, safeExcludeSlug]) =>
      ProductApi.getRecentlyViewedProductsSkuCardV2({
        excludeSlug: safeExcludeSlug,
      }),
    { revalidateOnFocus: false },
  );

  const recentlyViewedItems = recentlyViewedData?.list ?? [];

  //send tracking
  useEffect(() => {
    viewItemTrackedSlugRef.current = null;
    recentlyViewedRecordedSlugRef.current = null;
  }, [slug]);

  useEffect(() => {
    if (!productData?.slug || recentlyViewedRecordedSlugRef.current === productData.slug) {
      return;
    }

    recentlyViewedRecordedSlugRef.current = productData.slug;
    void ProductApi.recordRecentlyViewedProduct({
      productSlug: productData.slug,
    }).catch(() => {});
  }, [productData?.slug]);

  useEffect(() => {
    if (!productData || viewItemTrackedSlugRef.current === slug) {
      return;
    }
    const variation = resolveViewableVariation(productData, selectedVariation);
    if (!variation) {
      return;
    }
    viewItemTrackedSlugRef.current = slug;
    safeTrackViewItemFromProductDetail(productData, variation);
  }, [slug, productData, selectedVariation]);
  // ------------------------------------------------------------------------------------------------
  const { handleToggleWishlist, mapWishlistProducts, isProductWished } = useProductWishlist();
  const isWishlistActive = productData?.id ? isProductWished(productData.id) : false;

  const applyWishlistToProductItems = useCallback(
    (items: ProductItemProps[]) => applyWishlistStateToProductItems(items, isProductWished, handleToggleWishlist),
    [handleToggleWishlist, isProductWished],
  );

  const relatedProducts = useMemo(() => mapWishlistProducts(relatedData?.items || []), [mapWishlistProducts, relatedData?.items]);
  const relatedProductSliderItems = useMemo(
    () => applyWishlistToProductItems(mapApiProductSkuCardsToProductItems(relatedSkuCardItems)),
    [applyWishlistToProductItems, relatedSkuCardItems],
  );
  const recentlyViewedSliderItems = useMemo(
    () => applyWishlistToProductItems(mapApiProductSkuCardsToProductItems(recentlyViewedItems)),
    [applyWishlistToProductItems, recentlyViewedItems],
  );
  const catalogSkuCardLookupItems = useMemo(
    () => [...relatedSkuCardItems, ...recentlyViewedItems],
    [relatedSkuCardItems, recentlyViewedItems],
  );

  const handleAddToCartWithCatalogFallback = (variationId: string, item?: CartViewItem) => {
    if (item) {
      return handleAddToCart(variationId, 1, item);
    }

    const product = catalogSkuCardLookupItems.find(
      (currentItem) =>
        String(currentItem.selectedSku.id) === String(variationId) ||
        currentItem.visualSwitch?.options?.some((option) => String(option.sku.id) === String(variationId)),
    );

    if (product) {
      return handleAddToCart(variationId, 1, buildCartViewItemFromProductSkuCard(product, variationId));
    }

    return handleAddToCart(variationId);
  };

  const productMediaItems = useMemo<MediaItem[]>(() => {
    if (!productData) return [];

    return (selectedVariation?.gallery || productData.gallery || [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((g) => {
        const rawUrl = g.url?.trim() || "";
        const mediaType = getMediaType(rawUrl, g.type as MediaType);
        const resolvedOriginalUrl =
          mediaType === MediaType.VIDEO || mediaType === MediaType.GIF
            ? resolveCdnImageUrl({ src: g.url, fallback: productDefaultImage, mediaType })
            : toCdnOriginalWebpUrl(resolveCdnImageUrl({ src: g.url, fallback: productDefaultImage, mediaType }));
        return {
          url: resolvedOriginalUrl,
          mediaType,
        };
      });
  }, [productData, productDefaultImage, selectedVariation]);

  const breadcrumbItems = useMemo(() => {
    const baseItems = [
      { label: "Trang chủ", href: "/" },
      { label: "Tất cả", href: "/san-pham" },
    ];

    if (!productData) {
      return baseItems;
    }

    const mappedItems = (productData.breadcrumbs || []).map((bc) => ({
      label: bc.name,
      href: bc.isCurrent ? undefined : bc.path,
    }));

    const normalizedItems = mappedItems.filter((item) => {
      const normalizedLabel = item.label.trim().toLowerCase();
      const normalizedHref = (item.href || "").replace(/\/$/, "");
      return !(
        normalizedLabel === "trang chủ" ||
        normalizedLabel === "tất cả" ||
        normalizedHref === "" ||
        normalizedHref === "/" ||
        normalizedHref === "/san-pham"
      );
    });

    const hasCurrentProductItem = normalizedItems.some((item) => !item.href && item.label === productData.name);
    if (!hasCurrentProductItem && productData.name) {
      normalizedItems.push({ label: productData.name, href: undefined });
    }

    return [...baseItems, ...normalizedItems];
  }, [productData]);

  const currentSelectedAttributes = useMemo(() => {
    if (selectedVariation?.attributes) {
      return selectedVariation.attributes;
    }
    if (productData?.defaultVariantId && productData.variants) {
      const defaultVar = productData.variants.find((v) => v.id === productData.defaultVariantId);
      if (defaultVar?.attributes) {
        return defaultVar.attributes;
      }
    }
    return {};
  }, [productData, selectedVariation]);

  const handleVariantSelect = (attrCode: string, valueCode: string, currentAttributes: Record<string, string>) => {
    const newAttrs = { ...currentAttributes, [attrCode]: valueCode };
    const matched = productData?.variants?.find((v) => {
      if (!v.attributes) return false;
      return Object.entries(newAttrs).every(([code, val]) => v.attributes?.[code] === val);
    });
    if (matched) setSelectedVariation(matched);
  };

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleToggleProductFavorite = async () => {
    if (!productData?.id) {
      return;
    }

    await handleToggleWishlist([productData.id]);
  };

  return (
    <React.Fragment>
      <BreadcrumbComponent items={breadcrumbItems} />
      <ProductDetailContent
        productData={productData}
        productInfos={productInfosData}
        productMediaItems={productMediaItems}
        selectedVariation={selectedVariation!}
        currentSelectedAttributes={currentSelectedAttributes}
        relatedProducts={relatedProducts}
        giftsData={giftsData}
        promotionsData={promotionsData}
        reviewSummaryData={reviewSummaryData}
        isWishlistActive={isWishlistActive}
        onVariantSelect={handleVariantSelect}
        onToggleFavorite={handleToggleProductFavorite}
        onAddToCart={handleAddToCartWithCatalogFallback}
        onOpenLightbox={handleOpenLightbox}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />
      {relatedProductSliderItems.length > 0 ? (
        <ProductSliderComponent
          title="Sản phẩm liên quan"
          onAddToCart={handleAddToCartWithCatalogFallback}
          items={relatedProductSliderItems}
          onProductClick={(slug) => router.push(`/san-pham/${slug}`)}
        />
      ) : null}
      {/* <ProductReview productId={productData.id} productName={productData.name} /> */}
      <ProductDrawerComponent
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        products={relatedProducts}
        onProductClick={(slug) => router.push(`/san-pham/${slug}`)}
        onAddToCart={handleAddToCartWithCatalogFallback}
      />
      {recentlyViewedSliderItems.length > 0 ? (
        <ProductSliderComponent
          title="Sản phẩm đã xem"
          // subtitle="Are you ready to DARE TO BE OUT with trading?"
          onAddToCart={handleAddToCartWithCatalogFallback}
          items={recentlyViewedSliderItems}
          onProductClick={(slug) => router.push(`/san-pham/${slug}`)}
        />
      ) : null}
      <ProductZoomComponent
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        initialIndex={lightboxIndex}
        productName={productData.name}
        images={(productMediaItems.length > 0 ? productMediaItems : [{ url: productDefaultImage }]).map(
          (m) => m.url || productDefaultImage,
        )}
      />
    </React.Fragment>
  );
};

export default ProductDetailApp;
