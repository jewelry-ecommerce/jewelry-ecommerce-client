"use client";

import type { StorefrontNavigationItem } from "@/utils/api/cms";
import { buildScopedNavigationHref, isExternalNavigationHref, isNavigationItemActive, normalizeNavigationPath } from "@/utils/api/cms";
import { Box, Typography } from "@mui/material";
import useEmblaCarousel from "embla-carousel-react";
import { CdnImage } from "@/components/cdn-image";
import { useProductDefaultImage } from "@/components/providers.component";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import useStyles from "./category-scroller.styles";
import { normalizeCategoryScrollerImageUrl } from "./category-scroller.constants";
import { DEFAULT_PRODUCT_IMAGE_SRC } from "@/utils/config/tenant-branding.util";

type CategoryScrollerProps = {
  title?: string;
  navigationItems?: StorefrontNavigationItem[];
  basePath?: string;
  sourceBasePath?: string | null;
  activeNavigationItemId?: string | null;
  activeCategoryId?: string | null;
};

const CategoryScroller = (props: CategoryScrollerProps) => {
  const { title = "Danh mục sản phẩm", navigationItems = [], basePath, sourceBasePath, activeNavigationItemId, activeCategoryId } = props;
  const { classes } = useStyles();
  const productDefaultImage = useProductDefaultImage() || DEFAULT_PRODUCT_IMAGE_SRC;
  const pointerMovedRef = useRef(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const router = useRouter();
  const pathname = usePathname();

  const normalizedPathname = useMemo(() => normalizeNavigationPath(pathname), [pathname]);
  const visibleNavigationItems = useMemo(
    () =>
      navigationItems.map((item) => {
        const href = buildScopedNavigationHref(item, basePath, sourceBasePath);
        return {
          id: item.id,
          label: item.label,
          image: item.image?.trim() || productDefaultImage,
          href,
          isActive: isNavigationItemActive(item, {
            pathname: normalizedPathname,
            basePath,
            sourceBasePath,
            activeNavigationItemId,
            activeCategoryId,
          }),
        };
      }),
    [activeCategoryId, activeNavigationItemId, basePath, navigationItems, normalizedPathname, productDefaultImage, sourceBasePath],
  );
  const activeItem = visibleNavigationItems.find((item) => item.isActive);
  // Index của danh mục đang chọn — dùng để scroll carousel tới
  const activeIndex = useMemo(() => visibleNavigationItems.findIndex((item) => item.isActive), [visibleNavigationItems]);

  // Đưa card active vào viewport sau khi Embla đã layout xong (chuyển trang / đổi category).
  const scrollActiveCategoryIntoView = useCallback(() => {
    if (!emblaApi || activeIndex < 0) return;

    requestAnimationFrame(() => {
      emblaApi.scrollTo(activeIndex, true);
    });
  }, [activeIndex, emblaApi]);

  // Scroll khi mount + khi danh sách reInit (dynamic import / resize) để luôn thấy tag xanh của cate đang chọn.
  useEffect(() => {
    if (!emblaApi) return;

    scrollActiveCategoryIntoView();

    emblaApi.on("reInit", scrollActiveCategoryIntoView);
    return () => {
      emblaApi.off("reInit", scrollActiveCategoryIntoView);
    };
  }, [emblaApi, scrollActiveCategoryIntoView]);

  const handleNavigationClick = (href: string | null) => {
    if (pointerMovedRef.current) {
      pointerMovedRef.current = false;
      return;
    }
    if (!href) return;
    if (isExternalNavigationHref(href) && typeof window !== "undefined") {
      window.location.href = href;
      return;
    }
    router.push(href, { scroll: false });
  };

  if (!visibleNavigationItems.length) {
    return (
      <Box className={classes.titleWrapper}>
        <Typography className={classes.titleText}>{title}</Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Box className={classes.titleWrapper}>
        <Typography className={classes.titleText}>{title}</Typography>
        {activeItem && <Typography className={classes.selectedCategoryText}>{activeItem.label}</Typography>}
      </Box>

      <Box className={classes.embla} ref={emblaRef}>
        <Box className={classes.emblaContainer}>
          {visibleNavigationItems.map((item) => (
            <Box
              key={item.id}
              onClick={() => handleNavigationClick(item.href)}
              className={item.isActive ? `${classes.card} ${classes.activeCard}` : classes.card}
            >
              {item.isActive ? (
                <Box className={classes.activeCardInner}>
                  <Box className={classes.activeCardTopBar} aria-hidden />
                  <Box className={classes.activeCardInnerContent}>
                    <CdnImage
                      as="next"
                      src={normalizeCategoryScrollerImageUrl(item.image) ?? item.image}
                      fallback={productDefaultImage}
                      preset="categoryNav"
                      alt={item.label}
                      fill
                      sizes="160px"
                      style={{ objectFit: "cover" }}
                    />
                    <Box className={classes.cardLabelBox}>
                      <Typography className={classes.cardLabelText} title={item.label}>
                        {item.label}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box className={classes.cardInner}>
                  <CdnImage
                    as="next"
                    src={normalizeCategoryScrollerImageUrl(item.image) ?? item.image}
                    fallback={productDefaultImage}
                    preset="categoryNav"
                    alt={item.label}
                    fill
                    sizes="160px"
                    style={{ objectFit: "cover" }}
                  />
                  <Box className={classes.cardLabelBox}>
                    <Typography className={classes.cardLabelText} title={item.label}>
                      {item.label}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CategoryScroller;
