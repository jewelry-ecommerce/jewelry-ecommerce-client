import React, { useState, useMemo, useCallback } from "react";
import { Box } from "@mui/material";
import { CdnImage } from "@/components/cdn-image";
import PaginationComponent from "@/components/pagination/pagination.component";
import ProductItemComponent from "@/components/product/product-item/product-item.component";
import type { ProductItemProps } from "@/components/product/product-item/product-item.component";
import type { ProductGridProps, ProductBannerConfig } from "./product-grid.interface";
import useStyles from "./product-grid.styles";
import ProductDrawerComponent from "@/components/product/product-drawer/product-drawer.component";
import { ShoppingBag02 } from "@untitledui/icons";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import { PRODUCT_LIST_PAGE_SIZE_DEFAULT, PRODUCT_LIST_PAGE_SIZE_OPTIONS } from "@/utils/constants/page-take.constant";
import { useFetchProductBadgesBatch } from "@/hooks/use-fetch-product-badges-batch.hook";
import { PRODUCT_GRID_LCP_IMAGE_INDEX, PRODUCT_GRID_PRODUCTS_PER_ROW } from "./product-grid.constants";
import { useStorefrontBreakpoint } from "@/hooks/use-storefront-breakpoint.hook";
import { normalizeProductGridBannerImageUrl } from "./product-grid-banner.constants";
import type { CdnImagePreset } from "@/utils/cdn/resolve-cdn-image-url";

type ProductGridRenderItem =
  { type: "product"; data: ProductItemProps; productIndex: number } | { type: "banner"; data: NonNullable<ProductGridProps["banner"]> };

type ProductGridBannerProps = {
  banner: ProductBannerConfig;
  wrapperClassName: string;
  onClick: (banner: ProductBannerConfig) => void;
  classes: ReturnType<typeof useStyles>["classes"];
  cx: ReturnType<typeof useStyles>["cx"];
};

const ProductGridBanner = ({ banner, wrapperClassName, onClick, classes, cx }: ProductGridBannerProps) => {
  const { isMobile, isTablet } = useStorefrontBreakpoint();
  const desktopBreakpoint = isTablet ? "tablet" : "desktop";
  const breakpoint = isMobile ? "mobile" : desktopBreakpoint;
  const imagePreset: CdnImagePreset = isMobile ? "productListBannerMobile" : isTablet ? "productListBannerTablet" : "productListBanner";
  const imageSrc = normalizeProductGridBannerImageUrl(banner.content.image, breakpoint) ?? banner.content.image;

  return (
    <Box className={wrapperClassName}>
      <Box className={classes.bannerContent} onClick={() => onClick(banner)}>
        <CdnImage
          as="next"
          src={imageSrc}
          preset={imagePreset}
          alt={banner.content.title || "Banner"}
          fill
          className={classes.bannerImage}
          sizes="(max-width: 809px) 100vw, (max-width: 1199px) 50vw, 756px"
        />
        {banner.type === "product" && banner.product && (
          <Box className={classes.bannerCta}>
            <ShoppingBag02 size={16} color="#333" />
            <Box className={cx(classes.bannerCtaCount, "bannerCtaCount")}>{Array.isArray(banner.product) ? banner.product.length : 1}</Box>
            <Box className={cx(classes.bannerCtaText, "bannerCtaText")}>Xem Thêm sản phẩm</Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const ProductGridComponent = ({ products, banner, banners, pagination, onProductClick, onAddToCart, sx }: ProductGridProps) => {
  useFetchProductBadgesBatch(products);
  const { classes, cx } = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerProducts, setDrawerProducts] = useState<ProductItemProps[]>([]);

  const availableBanners = useMemo(() => {
    const source = banners?.length ? banners : banner ? [banner] : [];
    return source.filter((item) => item?.enabled);
  }, [banner, banners]);

  const gridItems = useMemo(() => {
    const items: ProductGridRenderItem[] = [];

    let bannerIndex = 0;
    let productIndex = 0;

    for (let i = 0; i < products.length; i += PRODUCT_GRID_PRODUCTS_PER_ROW) {
      const rowProducts = products.slice(i, i + PRODUCT_GRID_PRODUCTS_PER_ROW);

      rowProducts.forEach((product) => {
        items.push({
          type: "product",
          data: product,
          productIndex,
        });
        productIndex += 1;
      });

      if (bannerIndex >= availableBanners.length) {
        continue;
      }

      items.push({
        type: "banner",
        data: availableBanners[bannerIndex],
      });
      bannerIndex += 1;
    }

    return items;
  }, [products, availableBanners]);

  const handleBannerClick = useCallback((clickedBanner: NonNullable<ProductGridProps["banner"]>) => {
    if (!clickedBanner) return;

    if (clickedBanner.type === "link" && clickedBanner.link) {
      if (clickedBanner.openInNewTab) {
        window.open(clickedBanner.link, "_blank");
        return;
      }
      window.location.assign(clickedBanner.link);
    } else if (clickedBanner.type === "product" && clickedBanner.product) {
      const bannerProducts = Array.isArray(clickedBanner.product) ? clickedBanner.product : [clickedBanner.product];
      if (!bannerProducts.length) return;
      setDrawerProducts(bannerProducts);
      setDrawerOpen(true);
    }
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setDrawerProducts([]);
  }, []);

  const handleProductInDrawerClick = useCallback(
    (productId: string) => {
      onProductClick?.(productId);
    },
    [onProductClick],
  );

  const handleProductInDrawerAddToCart = useCallback(
    (productId: string, item?: CartViewItem) => {
      onAddToCart?.(productId, item);
    },
    [onAddToCart],
  );

  return (
    <Box className={classes.root} sx={sx}>
      <Box className={classes.gridContainer}>
        {gridItems.map((item, index) => {
          if (item.type === "banner") {
            return (
              <ProductGridBanner
                key={`banner-${index}`}
                banner={item.data}
                wrapperClassName={cx(item.data.position === "right" ? classes.bannerWrapperRight : classes.bannerWrapper)}
                onClick={handleBannerClick}
                classes={classes}
                cx={cx}
              />
            );
          }

          return (
            <Box key={`${item.data.id}-${index}`} className={classes.productGrid}>
              <ProductItemComponent
                {...item.data}
                priority={item.productIndex === PRODUCT_GRID_LCP_IMAGE_INDEX}
                skipBadgeFetch
                onClick={onProductClick}
                onAddToCart={onAddToCart}
              />
            </Box>
          );
        })}
      </Box>
      <PaginationComponent
        total={pagination?.total}
        take={pagination?.take ?? PRODUCT_LIST_PAGE_SIZE_DEFAULT}
        showPageSize={true}
        pageSizeOptions={[...PRODUCT_LIST_PAGE_SIZE_OPTIONS]}
        itemName="sản phẩm"
      />

      <ProductDrawerComponent
        open={drawerOpen}
        onClose={handleDrawerClose}
        products={drawerProducts}
        title="MIX & MATCH"
        onProductClick={handleProductInDrawerClick}
        onAddToCart={handleProductInDrawerAddToCart}
      />
    </Box>
  );
};

export default ProductGridComponent;
