import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, IconButton, SxProps, Theme, useMediaQuery, useTheme } from "@mui/material";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ProductTitle from "../product-title/product-title.component";
import ProductItem, { ProductItemProps } from "../product-item/product-item.component";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import useStyles from "./product-slider.styles";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { useFetchProductBadgesBatch } from "@/hooks/use-fetch-product-badges-batch.hook";

/** Số slides tính từ cuối danh sách — khi user lướt đến đây thì trigger load more. */
const NEAR_END_THRESHOLD = 3;

interface ProductSliderProps {
  title?: string;
  subtitle?: string;
  seeMore?: { enabled?: boolean; text?: string; url?: string };
  items: ProductItemProps[];
  autoplay?: boolean;
  autoplaySpeed?: number;
  sx?: SxProps<Theme>;
  slidesPerView?: number;
  isMobileTemplate?: boolean;
  onAddToCart?: (id: string, item?: CartViewItem) => void;
  onProductClick?: (slug: string) => void;
  /** Gọi khi user lướt gần cuối danh sách — parent có thể load page tiếp. */
  onNearEnd?: () => void;
}

const ProductSliderComponent = ({
  title,
  subtitle,
  seeMore,
  items,
  autoplay = false,
  autoplaySpeed = 4000,
  sx,
  slidesPerView,
  isMobileTemplate,
  onAddToCart,
  onProductClick,
  onNearEnd,
}: ProductSliderProps) => {
  useFetchProductBadgesBatch(items);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(810));
  const arrowIconSize = isMobile ? 28 : 32;
  const { classes, cx } = useStyles();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      align: "start",
      slidesToScroll: 1,
    },
    autoplay ? [Autoplay({ delay: autoplaySpeed, stopOnInteraction: false })] : [],
  );

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [showArrows, setShowArrows] = useState(false);
  const [edgeNudge, setEdgeNudge] = useState<"start" | "end" | null>(null);
  const edgeNudgeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerEdgeNudge = useCallback((edge: "start" | "end") => {
    if (edgeNudgeTimeoutRef.current) {
      clearTimeout(edgeNudgeTimeoutRef.current);
    }
    setEdgeNudge(edge);
    edgeNudgeTimeoutRef.current = setTimeout(() => setEdgeNudge(null), 350);
  }, []);

  const handleNavClick = useCallback(
    (direction: "prev" | "next") => (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!emblaApi) return;

      const canScroll = direction === "prev" ? emblaApi.canScrollPrev() : emblaApi.canScrollNext();
      if (!canScroll) {
        triggerEdgeNudge(direction === "prev" ? "start" : "end");
        return;
      }

      if (direction === "prev") {
        emblaApi.scrollPrev();
      } else {
        emblaApi.scrollNext();
      }
    },
    [emblaApi, triggerEdgeNudge],
  );

  useEffect(() => {
    return () => {
      if (edgeNudgeTimeoutRef.current) {
        clearTimeout(edgeNudgeTimeoutRef.current);
      }
    };
  }, []);

  const onSelect = useCallback(
    (api: any) => {
      setPrevBtnDisabled(!api.canScrollPrev());
      setNextBtnDisabled(!api.canScrollNext());
      setShowArrows(api.scrollSnapList().length > 1);

      // Trigger load more khi user lướt gần cuối
      if (onNearEnd) {
        const snapList: number[] = api.scrollSnapList();
        const selectedSnap: number = api.selectedScrollSnap();

        // Không tự động fetch nếu user đang ở slide đầu tiên (chưa lướt)
        if (selectedSnap === 0) return;

        const distanceFromEnd = snapList.length - 1 - selectedSnap;
        if (distanceFromEnd <= NEAR_END_THRESHOLD) {
          onNearEnd();
        }
      }
    },
    [onNearEnd],
  );

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <Box className={classes.root} sx={{ ...sx }}>
      <ProductTitle title={title} subtitle={subtitle} seeMore={seeMore} />

      {items.length > 0 && (
        <Box className={classes.carouselWrapper}>
          <Box
            className={cx(classes.viewport, {
              [classes.viewportNudgeStart]: edgeNudge === "start",
              [classes.viewportNudgeEnd]: edgeNudge === "end",
            })}
            ref={emblaRef}
          >
            <Box className={classes.container}>
              {items.map((item) => (
                <Box
                  className={cx(
                    classes.slideItem,
                    slidesPerView === 2 && classes.slideItemTwoColumns,
                    slidesPerView === 3 && classes.slideItemThreeColumns,
                  )}
                  key={item.id}
                >
                  <ProductItem onClick={onProductClick} isMobileTemplate={isMobileTemplate} onAddToCart={onAddToCart} {...item} />
                </Box>
              ))}
            </Box>
          </Box>

          {showArrows && (
            <React.Fragment>
              {!prevBtnDisabled ? (
                <IconButton
                  type="button"
                  className={cx(classes.navButton, classes.prevButton, "nav-button")}
                  onClick={handleNavClick("prev")}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <ChevronLeft size={arrowIconSize} color="#fff" />
                </IconButton>
              ) : null}
              {!nextBtnDisabled ? (
                <IconButton
                  type="button"
                  className={cx(classes.navButton, classes.nextButton, "nav-button")}
                  onClick={handleNavClick("next")}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <ChevronRight size={arrowIconSize} color="#fff" />
                </IconButton>
              ) : null}
            </React.Fragment>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProductSliderComponent;
