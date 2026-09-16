import React, { useCallback, useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import useEmblaCarousel from "embla-carousel-react";
import ProductTitle from "../product-title/product-title.component";
import useStyles from "./product-gallery.styles";
import { CdnImage } from "@/components/cdn-image";
import { CdnVideo } from "@/components/cdn-video";
import { normalizeProductGalleryImageUrl } from "./product-gallery.constants";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { MediaType } from "@/utils/api/banner/banner.enum";
import { getMediaType } from "@/utils/helpers/common";
import type { ProductItemProps } from "@/components/product/product-item/product-item.component";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import ProductMixMatchModalComponent from "../product-mix-match-modal/product-mix-match-modal.component";

export interface ProductReviewItem {
  id: string;
  src: string;
  labelText?: string;
  alt?: string;
  link?: string;
  mediaType?: MediaType;
  /** Poster cho video (CMS thumbnailUrl). */
  posterSrc?: string;
  actionType?: "LINK_URL" | "MIX_MATCH";
  mixMatchProducts?: ProductItemProps[];
}

interface ProductReviewProps {
  title?: string;
  subtitle?: string;
  items: ProductReviewItem[];
  mixMatchModalTitle?: string;
  isMixMatchLoading?: boolean;
  onProductClick?: (slug: string) => void;
  onAddToCart?: (id: string, item?: CartViewItem) => void;
}

const ProductGalleryComponent = ({
  title,
  subtitle,
  items,
  mixMatchModalTitle,
  isMixMatchLoading = false,
  onProductClick,
  onAddToCart,
}: ProductReviewProps) => {
  const { classes, cx } = useStyles();
  const [mixMatchOpen, setMixMatchOpen] = useState(false);
  const [activeMixMatchItem, setActiveMixMatchItem] = useState<ProductReviewItem | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    slidesToScroll: 1,
    containScroll: "trimSnaps",
    watchDrag: (emblaApi) => emblaApi.scrollSnapList().length > 1,
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [showArrows, setShowArrows] = useState(false);

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

  useEffect(() => {
    if (!mixMatchOpen || !activeMixMatchItem) return;
    const updatedItem = items.find((item) => item.id === activeMixMatchItem.id);
    if (updatedItem) {
      setActiveMixMatchItem(updatedItem);
    }
  }, [activeMixMatchItem, items, mixMatchOpen]);

  const handleMixMatchOpen = useCallback((item: ProductReviewItem) => {
    setActiveMixMatchItem(item);
    setMixMatchOpen(true);
  }, []);

  const handleMixMatchClose = useCallback(() => {
    setMixMatchOpen(false);
    setActiveMixMatchItem(null);
  }, []);

  const renderMedia = (item: ProductReviewItem, mediaType: ReturnType<typeof getMediaType>) => (
    <>
      <Box className={classes.labelWrapper}>
        <Typography className={classes.labelText}>{item.labelText || "POSTHUMAN"}</Typography>
      </Box>

      <Box className={classes.mediaWrapper}>
        {mediaType === MediaType.VIDEO ? (
          <CdnVideo
            src={item.src}
            poster={item.posterSrc}
            autoPlay
            muted
            loop
            playsInline
            aria-label={item.alt || item.labelText || "Video"}
            className={cx(classes.reviewMedia, "review-image")}
          />
        ) : (
          <CdnImage
            as="next"
            src={normalizeProductGalleryImageUrl(item.src) ?? item.src}
            preset="galleryTile"
            kind={mediaType === MediaType.GIF ? MediaType.GIF : MediaType.IMAGE}
            mediaType={(item.mediaType || mediaType) as MediaType | undefined}
            alt={item.alt || item.labelText || ""}
            fill
            sizes="(max-width: 809px) 100vw, (max-width: 1199px) 50vw, 25vw"
            className={cx(classes.reviewMedia, "review-image")}
          />
        )}
      </Box>
    </>
  );

  const renderSlide = (item: ProductReviewItem) => {
    const mediaType = getMediaType(item.src, item.mediaType);

    if (item.actionType === "MIX_MATCH") {
      return (
        <Box className={classes.slideItem} key={item.id}>
          <Box
            component="button"
            type="button"
            className={cx(classes.reviewCard, classes.reviewCardButton)}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleMixMatchOpen(item);
            }}
          >
            {renderMedia(item, mediaType)}
          </Box>
        </Box>
      );
    }

    if (item.link) {
      return (
        <Box className={classes.slideItem} key={item.id}>
          <Link href={item.link} className={classes.reviewCard}>
            {renderMedia(item, mediaType)}
          </Link>
        </Box>
      );
    }

    return (
      <Box className={classes.slideItem} key={item.id}>
        <Box className={classes.reviewCard}>{renderMedia(item, mediaType)}</Box>
      </Box>
    );
  };

  return (
    <Box className={classes.root}>
      <ProductTitle title={title} subtitle={subtitle} />

      {items.length > 0 && (
        <Box className={classes.carouselWrapper}>
          <Box className={classes.viewport} ref={emblaRef}>
            <Box className={classes.container}>{items.map(renderSlide)}</Box>
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
                  <ChevronLeft size={20} color="#fff" />
                </IconButton>
              ) : null}
              {!nextBtnDisabled ? (
                <IconButton
                  type="button"
                  className={cx(classes.navButton, classes.nextButton, "nav-button")}
                  onClick={handleNavClick("next")}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <ChevronRight size={20} color="#fff" />
                </IconButton>
              ) : null}
            </React.Fragment>
          )}
        </Box>
      )}

      <ProductMixMatchModalComponent
        open={mixMatchOpen}
        onClose={handleMixMatchClose}
        imageSrc={activeMixMatchItem?.src || ""}
        imageAlt={activeMixMatchItem?.alt}
        imageLabel={activeMixMatchItem?.labelText}
        title={mixMatchModalTitle || title}
        products={activeMixMatchItem?.mixMatchProducts || []}
        isLoading={isMixMatchLoading && !(activeMixMatchItem?.mixMatchProducts?.length ?? 0)}
        onProductClick={onProductClick}
        onAddToCart={onAddToCart}
      />
    </Box>
  );
};

export default ProductGalleryComponent;
