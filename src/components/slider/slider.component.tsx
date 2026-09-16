import React, { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { Box, useTheme, useMediaQuery, Breakpoint } from "@mui/material";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { EmblaCarouselType } from "embla-carousel";

import { SliderProps, DEFAULT_AUTOPLAY_SPEED } from "./slider.types";
import { SliderContainer, SlidesTrack, NavArrow, DotsContainer, Dot } from "./slider.style";
import SliderProcess from "./slider-process.component";
import { useActiveSlideMedia } from "./use-active-slide-media.hook";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";

const SliderComponent = ({
  children,
  autoplay = true,
  autoplaySpeed = DEFAULT_AUTOPLAY_SPEED,
  showDots = true,
  showArrows = true,
  loop = true,
  height,
  className,
  itemsToShow = 1,
  slidesToScroll = 1,
  spacing = 0,
  swipeable = true,
  centerMode = false,
  currentSlide: controlledIndex,
  defaultSlide = 0,
  onSlideChange,
  type = "dots",
  showProgress = true,
  slideDurations,
}: SliderProps) => {
  const theme = useTheme();

  const isXl = useMediaQuery(theme.breakpoints.up("xl"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down(810));
  const arrowIconSize = isMobile ? 28 : 32;

  const itemsCount = useMemo(() => {
    if (typeof itemsToShow === "number") return itemsToShow;
    if (isXl) return itemsToShow.xl ?? itemsToShow.lg ?? itemsToShow.md ?? itemsToShow.sm ?? itemsToShow.xs ?? 1;
    if (isLg) return itemsToShow.lg ?? itemsToShow.md ?? itemsToShow.sm ?? itemsToShow.xs ?? 1;
    if (isMd) return itemsToShow.md ?? itemsToShow.sm ?? itemsToShow.xs ?? 1;
    if (isSm) return itemsToShow.sm ?? itemsToShow.xs ?? 1;
    return itemsToShow.xs ?? 1;
  }, [itemsToShow, isXl, isLg, isMd, isSm]);

  const originalSlides = useMemo(() => React.Children.toArray(children).filter(React.isValidElement), [children]);

  const totalOriginalCount = originalSlides.length;

  const isLooping = loop && totalOriginalCount > (centerMode ? 1 : itemsCount);

  const slideBasis = useMemo(() => {
    const calculateBasis = (count: number) => `calc((100% + ${spacing}px) / ${count})`;
    if (typeof itemsToShow === "number") {
      return calculateBasis(itemsToShow);
    }

    const breakpoints: Breakpoint[] = ["xs", "sm", "md", "lg", "xl"];
    const basis: Partial<Record<Breakpoint, string>> = {};
    let lastCount = 1;

    breakpoints.forEach((bp) => {
      if (itemsToShow[bp] !== undefined) lastCount = itemsToShow[bp]!;
      basis[bp] = calculateBasis(lastCount);
    });
    return basis;
  }, [itemsToShow, spacing]);

  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        delay: autoplaySpeed,
        stopOnInteraction: false,
        playOnInit: autoplay,
      }),
    [autoplaySpeed, autoplay],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: isLooping,
      slidesToScroll,
      align: centerMode ? "center" : "start",
      watchDrag: swipeable,
      startIndex: defaultSlide,
    },
    autoplay && type === "dots" ? [autoplayPlugin] : [],
  );

  const viewportRef = useRef<HTMLElement | null>(null);
  const setViewportRef = useCallback(
    (node: HTMLElement | null) => {
      viewportRef.current = node;
      emblaRef(node);
    },
    [emblaRef],
  );

  const [selectedIndex, setSelectedIndex] = useState(defaultSlide);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onInit = useCallback((api: EmblaCarouselType) => {
    setScrollSnaps(api.scrollSnapList());
  }, []);

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onSelect = useCallback(
    (api: EmblaCarouselType) => {
      const index = api.selectedScrollSnap();
      setSelectedIndex(index);
      setPrevBtnDisabled(!api.canScrollPrev());
      setNextBtnDisabled(!api.canScrollNext());
      onSlideChange?.(index);
    },
    [onSlideChange],
  );

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);

    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("reInit", onInit);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  useEffect(() => {
    if (!emblaApi || controlledIndex === undefined) return;

    const maxIndex = Math.max(0, emblaApi.scrollSnapList().length - 1);
    const clampedIndex = Math.max(0, Math.min(controlledIndex, maxIndex));

    if (clampedIndex !== selectedIndex) {
      emblaApi.scrollTo(clampedIndex);
    }
  }, [emblaApi, controlledIndex, selectedIndex]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const [playbackCycle, setPlaybackCycle] = useState(0);

  const handleAutoplayComplete = useCallback(() => {
    if (!emblaApi) return;

    if (totalOriginalCount === 1) {
      setPlaybackCycle((cycle) => cycle + 1);
      return;
    }

    emblaApi.scrollNext();
  }, [emblaApi, totalOriginalCount]);

  const progressAutoplayEnabled = autoplay && type === "progress";
  const { isMediaDriven, mediaDurationMs } = useActiveSlideMedia({
    containerRef: viewportRef,
    selectedIndex,
    enabled: progressAutoplayEnabled,
    playbackCycle,
    onComplete: handleAutoplayComplete,
  });

  if (!originalSlides.length) return null;

  const showNav = totalOriginalCount > itemsCount;

  return (
    <SliderContainer ref={setViewportRef} sx={{ height }} className={className}>
      <SlidesTrack
        sx={{
          mx: spacing > 0 ? `-${spacing / 2}px` : 0,
        }}
      >
        {originalSlides.map((node, idx) => {
          const isSelected = slidesToScroll === 1 && idx === selectedIndex;
          return (
            <Box
              key={`orig-${idx}`}
              className={`embla__slide ${isSelected ? "is-selected" : ""}`}
              sx={{
                flexGrow: 0,
                flexShrink: 0,
                flexBasis: slideBasis,
                minWidth: 0,
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              {node}
            </Box>
          );
        })}
      </SlidesTrack>

      {showArrows && showNav && (
        <React.Fragment>
          <NavArrow className="nav-arrow" onClick={scrollPrev} aria-label="Previous slide" disabled={prevBtnDisabled} sx={{ left: 16 }}>
            <ChevronLeft size={arrowIconSize} color="#000" />
          </NavArrow>

          <NavArrow className="nav-arrow" onClick={scrollNext} aria-label="Next slide" disabled={nextBtnDisabled} sx={{ right: 16 }}>
            <ChevronRight size={arrowIconSize} color="#000" />
          </NavArrow>
        </React.Fragment>
      )}

      {showDots && showNav && type === "dots" && (
        <DotsContainer>
          {scrollSnaps.map((_, index) => {
            const isActive = selectedIndex === index;
            return (
              <Dot
                key={index}
                type="button"
                onClick={() => scrollTo(index)}
                aria-label={`Go to page ${index + 1}`}
                aria-current={isActive}
                active={isActive}
              />
            );
          })}
        </DotsContainer>
      )}

      {type === "progress" && (
        <SliderProcess
          totalCount={scrollSnaps.length || totalOriginalCount}
          selectedIndex={selectedIndex}
          autoplay={autoplay}
          autoplaySpeed={autoplaySpeed}
          onNext={handleAutoplayComplete}
          onSelect={scrollTo}
          customDurations={slideDurations}
          mediaDriven={isMediaDriven}
          mediaDurationMs={mediaDurationMs}
          playbackCycle={playbackCycle}
          visible={showProgress}
        />
      )}
    </SliderContainer>
  );
};

export default SliderComponent;
