// set term
"use client";

import { BreadcrumbComponent } from "@/components";
import AccordionComponent from "@/components/accordion/accordion.component";
import { CdnImage } from "@/components/cdn-image";
import { useProductDefaultImage } from "@/components/providers.component";
import ProductZoomComponent from "@/components/product/product-zoom/product-zoom.component";
import { ServerSafeContent } from "@/components/server-safe-content/server-safe-content.component";
import { buildDefaultSetSelections, useSetSelection } from "@/app/(layout-main)/sets/_hooks/use-set-selection.hook";
import useProductDetailStyles from "@/app/(layout-main)/san-pham/_components/product-detail/product-detail.styles";
import { SetsApi } from "@/utils/api";
import { CDN_IMAGE_PRESETS } from "@/utils/cdn/cdn-image.presets";
import { formatPrice } from "@/utils/constants/common.constant";
import useAddSetToCart from "@/hooks/cart/use-add-set-to-cart.hook";
import type { SetDetailResponse } from "@/utils/api/sets/sets.interface";
import { isSizeVariantAttribute } from "@/utils/product/size-variant-attribute.util";
import { initiateCheckout } from "@/utils/api/checkout/checkout.api";
import { CheckoutRequestLineType } from "@/utils/api/checkout/checkout.interface";
import { getErrorMessage } from "@/utils/helpers/axios";
import { readStoredUtmData } from "@/utils/utm/utm.util";
import { Box, Stack, Typography } from "@mui/material";
import useEmblaCarousel from "embla-carousel-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";
import SetDetailProduct from "./set-detail-product.component";
import SetBadge from "./set-badge.component";
import useStyles from "./set-detail.styles";

type SetDetailAppProps = { initialData: SetDetailResponse };

const SetDetailApp = ({ initialData }: SetDetailAppProps) => {
  // hook
  const { classes } = useStyles();
  const { classes: productDetailClasses } = useProductDetailStyles();
  const productDefaultImage = useProductDefaultImage();
  const [emblaRef] = useEmblaCarousel({ loop: false });
  const { addSetToCart, isAdding } = useAddSetToCart();
  const router = useRouter();

  // state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isBuying, setIsBuying] = useState(false);

  // function
  const { data: setData = initialData } = useSWR(
    initialData.slug ? `catalog/sets/${initialData.slug}` : null,
    () => SetsApi.getSetBySlug(initialData.slug),
    { fallbackData: initialData },
  );
  const includedProducts = useMemo(
    () => setData.includedProducts.slice().sort((left, right) => left.sortOrder - right.sortOrder),
    [setData.includedProducts],
  );
  const initialSelections = useMemo(() => buildDefaultSetSelections(initialData.includedProducts), [initialData.includedProducts]);
  const { variationIds, customerDisplayPrice, selectVariation, maxQuantity, isOutOfStock } = useSetSelection(
    setData.id,
    includedProducts,
    initialSelections,
    setData.customerDisplayPrice,
  );
  const hasSizeGuide = useMemo(
    () => includedProducts.some((item) => item.variantSelectors.some((selector) => isSizeVariantAttribute(selector.attribute))),
    [includedProducts],
  );
  const selectedSetPrice = customerDisplayPrice ?? setData.customerDisplayPrice;
  const galleryImages = setData.images.filter(Boolean);
  const galleryMediaList = galleryImages.length ? galleryImages : [productDefaultImage];

  const handleAddSetToCart = () => {
    if (isOutOfStock) return;
    void addSetToCart(
      setData.id,
      includedProducts.map((item) => ({
        itemId: item.itemId,
        variationId: variationIds[item.itemId],
      })),
      maxQuantity,
    );
  };

  const handleBuyNow = useCallback(async () => {
    if (isOutOfStock || isBuying) return;

    const lineId = globalThis.crypto?.randomUUID?.();
    if (!lineId) return;

    setIsBuying(true);
    try {
      const utmData = readStoredUtmData();
      const checkout = await initiateCheckout({
        items: [
          {
            type: CheckoutRequestLineType.SET,
            lineId,
            setId: setData.id,
            quantity: 1,
            components: includedProducts.map((item) => ({
              variationId: variationIds[item.itemId],
              utm_data: utmData,
            })),
          },
        ],
      });
      router.push(`/thanh-toan?sessionId=${checkout.checkoutSessionId}`);
    } catch (error) {
      const message = getErrorMessage(error);
      if (message) toast.error(message);
    } finally {
      setIsBuying(false);
    }
  }, [includedProducts, isBuying, isOutOfStock, router, setData.id, variationIds]);

  return (
    <React.Fragment>
      <BreadcrumbComponent
        items={[{ label: "Trang chủ", href: "/" }, { label: "STELLA SET", href: "/sets" }, { label: initialData.name }]}
      />
      <Box className={productDetailClasses.gridContainer}>
        <Box className={productDetailClasses.leftSection}>
          <Box className={productDetailClasses.galleryStack}>
            {galleryMediaList.map((image, index) => (
              <Box key={`${image}-${index}`} className={productDetailClasses.galleryImageWrapper} onClick={() => setLightboxIndex(index)}>
                <CdnImage
                  as="next"
                  src={image}
                  fallback={productDefaultImage}
                  alt={setData.name}
                  preset="galleryMain"
                  width={CDN_IMAGE_PRESETS.galleryMain.width}
                  height={CDN_IMAGE_PRESETS.galleryMain.height}
                  priority={index === 0}
                  sizes="(max-width: 809px) 100vw, 50vw"
                  style={{ width: "100%", height: "auto", display: "block", pointerEvents: "none" }}
                />
              </Box>
            ))}
          </Box>
          <Box className={productDetailClasses.mobileSlider}>
            <Box className={productDetailClasses.sliderViewport} ref={emblaRef}>
              <Box className={productDetailClasses.sliderContainer}>
                {galleryMediaList.map((image, index) => (
                  <Box key={`${image}-${index}`} className={productDetailClasses.sliderSlide} onClick={() => setLightboxIndex(index)}>
                    <CdnImage
                      as="next"
                      src={image}
                      fallback={productDefaultImage}
                      alt={setData.name}
                      preset="galleryMain"
                      width={CDN_IMAGE_PRESETS.galleryMain.width}
                      height={CDN_IMAGE_PRESETS.galleryMain.height}
                      priority={index === 0}
                      sizes="100vw"
                      style={{ width: "100%", height: "auto", display: "block", pointerEvents: "none" }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box className={productDetailClasses.rightSectionContainer}>
          <Stack className={productDetailClasses.rightSection}>
            <Stack gap={1}>
              <SetBadge />
              <Typography className={classes.name}>{setData.name}</Typography>
              <Typography className={classes.sku}>Mã: {setData.code}</Typography>
              <Box className={classes.priceRow}>
                {selectedSetPrice ? (
                  <Typography className={classes.price}>{formatPrice(selectedSetPrice.sellingPriceAfterTaxMinor)}</Typography>
                ) : null}
                {selectedSetPrice?.compareAtPriceAfterTaxMinor ? (
                  <Typography className={classes.comparePrice}>{formatPrice(selectedSetPrice.compareAtPriceAfterTaxMinor)}</Typography>
                ) : null}
                {selectedSetPrice?.hasDiscount && selectedSetPrice.discountPercent ? (
                  <Typography className={classes.discount}>-{selectedSetPrice.discountPercent}%</Typography>
                ) : null}
              </Box>
            </Stack>
            <Box className={classes.products}>
              {includedProducts.map((item) => (
                <SetDetailProduct
                  key={item.itemId}
                  item={item}
                  selectedVariationId={variationIds[item.itemId]}
                  onVariationChange={selectVariation}
                  showSizeGuideAtKey={hasSizeGuide}
                />
              ))}
            </Box>
            <Stack className={productDetailClasses.buttonBox}>
              <Box
                component="button"
                className={`${productDetailClasses.btnBase} ${productDetailClasses.btnAddToCart} ${classes.disabledButton}`}
                onClick={handleAddSetToCart}
                disabled={isAdding || isBuying || isOutOfStock}
              >
                {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </Box>
              {!isOutOfStock && (
                <Box
                  component="button"
                  className={`${productDetailClasses.btnBase} ${productDetailClasses.btnBuyNow} ${classes.disabledButton}`}
                  onClick={handleBuyNow}
                  disabled={isAdding || isBuying || isOutOfStock}
                >
                  Mua ngay
                </Box>
              )}
            </Stack>
            {setData.shortDescriptions?.length ? (
              // set term
              <Box sx={{ borderTop: "1px solid #E5E5E5" }}>
                {setData.shortDescriptions.map((item, index) => (
                  <AccordionComponent key={`${item.title}-${index}`} title={item.title}>
                    <ServerSafeContent component="div" className="ck-content" rawHtml={item.content} />
                  </AccordionComponent>
                ))}
              </Box>
            ) : null}
          </Stack>
        </Box>
      </Box>
      <ProductZoomComponent
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        initialIndex={lightboxIndex ?? 0}
        productName={setData.name}
        images={galleryImages.length ? galleryImages : [productDefaultImage]}
      />
    </React.Fragment>
  );
};

export default SetDetailApp;
