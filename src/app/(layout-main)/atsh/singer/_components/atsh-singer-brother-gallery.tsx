"use client";

import { CdnImage } from "@/components";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { Box, IconButton, Typography } from "@mui/material";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ATSH_SINGER_GALLERY_IMAGE_FRAME, type AtshSingerGallerySection } from "../_constants/atsh-singer.constants";
import { useAtshSingerBreakpoint } from "../_hooks/use-atsh-singer-breakpoint.hook";
import ATSHTypography from "./atsh-typography";
import useAtshSingerStyles from "./atsh-singer.styles";

type AtshSingerBrotherGalleryProps = {
  singerName: string;
  gallery: AtshSingerGallerySection;
};

type BrotherGalleryImagesProps = {
  singerName: string;
  images: string[];
};

type BrotherGalleryRowProps = BrotherGalleryImagesProps & {
  columns: 2 | 4;
};

const BrotherGalleryStack = ({ singerName, images }: BrotherGalleryImagesProps) => {
  const { classes } = useAtshSingerStyles();

  return (
    <Box className={classes.brotherGalleryImages}>
      {images.map((src, index) => (
        <Box key={`${src}-${index}`} className={classes.brotherGalleryImageItem}>
          <CdnImage
            as="next"
            src={src}
            width={ATSH_SINGER_GALLERY_IMAGE_FRAME.width}
            height={ATSH_SINGER_GALLERY_IMAGE_FRAME.height}
            sizes="100vw"
            alt={`${singerName} - ${index + 1}`}
            className={classes.brotherGalleryImage}
          />
        </Box>
      ))}
    </Box>
  );
};

const BrotherGalleryRow = ({ singerName, images, columns }: BrotherGalleryRowProps) => {
  const { classes, cx } = useAtshSingerStyles();
  const imageSizes = columns === 4 ? "25vw" : "50vw";

  return (
    <Box className={classes.brotherGalleryRow}>
      {images.map((src, index) => (
        <Box
          key={`${src}-${index}`}
          className={cx(classes.brotherGalleryRowItem, {
            [classes.brotherGalleryRowItemFour]: columns === 4,
          })}
        >
          <CdnImage
            as="next"
            src={src}
            width={ATSH_SINGER_GALLERY_IMAGE_FRAME.width}
            height={ATSH_SINGER_GALLERY_IMAGE_FRAME.height}
            sizes={imageSizes}
            alt={`${singerName} - ${index + 1}`}
            className={classes.brotherGalleryImage}
          />
        </Box>
      ))}
    </Box>
  );
};

const BrotherGalleryCarousel = ({ singerName, images }: BrotherGalleryImagesProps) => {
  const { classes, cx } = useAtshSingerStyles();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [showArrows, setShowArrows] = useState(false);

  const onSelect = useCallback((api: { canScrollPrev: () => boolean; canScrollNext: () => boolean; scrollSnapList: () => unknown[] }) => {
    setPrevBtnDisabled(!api.canScrollPrev());
    setNextBtnDisabled(!api.canScrollNext());
    setShowArrows(api.scrollSnapList().length > 1);
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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <Box className={classes.brotherGalleryCarouselWrapper}>
      <Box className={classes.brotherGalleryViewport} ref={emblaRef}>
        <Box className={classes.brotherGalleryContainer}>
          {images.map((src, index) => (
            <Box key={`${src}-${index}`} className={classes.brotherGallerySlide}>
              <CdnImage
                as="next"
                src={src}
                width={ATSH_SINGER_GALLERY_IMAGE_FRAME.width}
                height={ATSH_SINGER_GALLERY_IMAGE_FRAME.height}
                sizes="100vw"
                alt={`${singerName} - ${index + 1}`}
                className={classes.brotherGallerySlideImage}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {showArrows && (
        <>
          <IconButton
            type="button"
            aria-label="Previous image"
            aria-disabled={prevBtnDisabled}
            className={cx(classes.brotherGalleryNavButton, classes.brotherGalleryNavPrev, {
              [classes.brotherGalleryNavDisabled]: prevBtnDisabled,
            })}
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
          >
            <ChevronLeft size={20} color="#fff" aria-hidden />
          </IconButton>
          <IconButton
            type="button"
            aria-label="Next image"
            aria-disabled={nextBtnDisabled}
            className={cx(classes.brotherGalleryNavButton, classes.brotherGalleryNavNext, {
              [classes.brotherGalleryNavDisabled]: nextBtnDisabled,
            })}
            onClick={scrollNext}
            disabled={nextBtnDisabled}
          >
            <ChevronRight size={20} color="#fff" aria-hidden />
          </IconButton>
        </>
      )}
    </Box>
  );
};

const AtshSingerBrotherGallery = ({ singerName, gallery }: AtshSingerBrotherGalleryProps) => {
  const { classes } = useAtshSingerStyles();
  const { isDesktop } = useAtshSingerBreakpoint();

  if (!gallery.images.length) {
    return null;
  }

  const imageCount = gallery.imageCount ?? (gallery.images.length >= 4 ? 4 : 2);
  const useDesktopRow = isDesktop && (imageCount === 2 || imageCount === 4);
  const useCarousel = imageCount === 4 && !isDesktop;
  const rowColumns = imageCount === 4 ? 4 : 2;

  return (
    <Box className={classes.brotherGallery} component="section">
      <Box className={classes.brotherGalleryHeader}>
        <ATSHTypography fontSize={24} lineHeight="150%" color="white" className={classes.brotherGalleryTitle}>
          {gallery.title}
        </ATSHTypography>
        <Typography component="p" className={classes.brotherGalleryDescription}>
          {gallery.description}
        </Typography>
      </Box>

      {useDesktopRow ? (
        <BrotherGalleryRow singerName={singerName} images={gallery.images} columns={rowColumns} />
      ) : useCarousel ? (
        <BrotherGalleryCarousel singerName={singerName} images={gallery.images} />
      ) : (
        <BrotherGalleryStack singerName={singerName} images={gallery.images} />
      )}
    </Box>
  );
};

export default AtshSingerBrotherGallery;
