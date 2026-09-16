import React, { useCallback, useEffect, useState } from "react";
import { Box, IconButton, SxProps, Theme, useTheme, useMediaQuery } from "@mui/material";
import useEmblaCarousel from "embla-carousel-react";
import ProductInfoCardComponent, { ProductInfoCardProps } from "../product-info-card/product-info-card.component";
import useStyles from "./product-info-slider.styles";
import ProductTitleComponent from "../../product-title/product-title.component";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";

interface ProductInfoSliderProps {
  title?: string;
  subtitle?: string;
  items: ProductInfoCardProps[];
  itemsToShow?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  spacing?: number;
  itemSx?: SxProps<Theme>;
  width?: number | string;
  height?: number | string;
  sx?: SxProps<Theme>;
}

const ProductInfoSliderComponent = ({ title, subtitle, items, itemsToShow, width, height, sx, itemSx }: ProductInfoSliderProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const arrowIconSize = isMobile ? 28 : 32;

  const { classes, cx } = useStyles({
    props: { itemsToShow, width, height, isDesktop },
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    active: !isDesktop && items.length > 1,
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const handleNavClick = useCallback(
    (direction: "prev" | "next") => (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!emblaApi) return;

      const canScroll = direction === "prev" ? emblaApi.canScrollPrev() : emblaApi.canScrollNext();
      if (!canScroll) return;

      if (direction === "prev") {
        emblaApi.scrollPrev();
      } else {
        emblaApi.scrollNext();
      }
    },
    [emblaApi],
  );

  const onSelect = useCallback((api: any) => {
    setPrevBtnDisabled(!api.canScrollPrev());
    setNextBtnDisabled(!api.canScrollNext());
  }, []);

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

  if (!items || items.length === 0) return null;

  return (
    <Box className={classes.root} sx={sx}>
      <ProductTitleComponent title={title} subtitle={subtitle} />

      <Box className={classes.carouselWrapper}>
        <Box className={classes.viewport} ref={emblaRef}>
          <Box className={classes.container}>
            {items.map((item, index) => (
              <Box key={index} className={cx(classes.slideItem, { [classes.firstSlide]: index === 0 })} sx={itemSx}>
                <ProductInfoCardComponent {...item} />
              </Box>
            ))}
          </Box>
        </Box>

        {!isDesktop && items.length > 1 && (
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
    </Box>
  );
};

export default ProductInfoSliderComponent;
