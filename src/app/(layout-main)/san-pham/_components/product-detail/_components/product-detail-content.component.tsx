import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import { Check, Gift01, Heart, Package, Share07, Star01 } from "@untitledui/icons";
import { DialogComponent, ProductSliderComponent, TextFieldComponent } from "@/components";
import AccordionComponent from "@/components/accordion/accordion.component";
import { ServerSafeContent } from "@/components/server-safe-content/server-safe-content.component";
import type { ProductItemProps } from "@/components/product/product-item/product-item.component";
import ProductSizeGuideDrawer from "@/components/product/product-size-guide-drawer/product-size-guide-drawer.component";
import ProductVariantSelector from "@/components/product/product-variant-selector/product-variant-selector.component";
import { DiscountPercentTag } from "@/components/product/discount-percent-tag/discount-percent-tag.component";
import { shouldShowDiscountPercentTag } from "@/utils/customer-display-price.util";
import { StackRowAlignCenter, StackRowAlignCenterJustBetween, StackRowAlignJustCenter } from "@/components/styled";
import { MediaType } from "@/utils/api/banner";
import {
  buildCartViewItemFromProductDetailVariant,
  resolveCartVariantLabelsFromProductDetail,
} from "@/utils/api/cart/cart-view-item-builder.util";
import { ProductLifecycleStatus, ProductPurchaseActionCode } from "@/utils/api/product/product.enum";
import type {
  IProductBySlugResponse,
  IProductInfoItem,
  IProductGiftsResponse,
  IProductPromotionsResponse,
  IProductReviewSummaryResponse,
  IProductVariation,
} from "@/utils/api/product/product.interface";
import {
  canAddToCartFromPurchaseAction,
  isBuyOrPreOrderPurchaseAction,
  isNotifyPurchaseAction,
  isPreOrderPurchaseAction,
  resolveProductExpectedStockDate,
  resolvePurchaseAction,
} from "@/utils/product/purchase-action.util";
import { PRE_ORDER_PDP_NOTICE_PREFIX } from "@/utils/constants/pre-order-badge.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { getMediaType } from "@/utils/helpers/common/common.helpers";
import { Box, Stack, Typography } from "@mui/material";
import useEmblaCarousel from "embla-carousel-react";
import { CdnImage } from "@/components/cdn-image";
import { CdnVideo } from "@/components/cdn-video";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCountdown } from "../../hooks";
import useStyles from "../product-detail.styles";
import { initiateCheckout } from "@/utils/api/checkout/checkout.api";
import { buildCheckoutItemPayload } from "@/utils/api/cart/cart-checkout.util";
import { readStoredUtmData } from "@/utils/utm/utm.util";
import { getErrorMessage } from "@/utils/helpers/axios";
import { formatPrice, PHONE_REGEX, VALIDATION_MESSAGES } from "@/utils/constants/common.constant";
import { useProductDefaultImage } from "@/components/providers.component";
import { toast } from "react-toastify";
import { CustomerRequestApi } from "@/utils/api";
import { CDN_IMAGE_PRESETS } from "@/utils/cdn/cdn-image.presets";
import { useStorefrontBreakpoint } from "@/hooks/use-storefront-breakpoint.hook";
import { useCheckoutStorage } from "@/hooks/checkout/use-checkout-storage.hook";
import { buildContextualVariantSelectors } from "@/utils/product/variant-availability.util";

export interface MediaItem {
  url: string;
  mediaType?: MediaType;
}

const GalleryMediaItem = ({
  item,
  alt,
  onClick,
  className,
  fallbackImage,
  priority = false,
}: {
  item: MediaItem;
  alt: string;
  onClick?: () => void;
  className: string;
  fallbackImage: string;
  priority?: boolean;
}) => {
  const rawUrl = item.url?.trim() || fallbackImage;
  const mediaType = getMediaType(rawUrl, item.mediaType);

  if (mediaType === MediaType.VIDEO) {
    return (
      <Box className={className} onClick={onClick} sx={{ cursor: onClick ? "pointer" : "default" }}>
        <CdnVideo
          src={rawUrl}
          autoPlay
          muted
          loop
          playsInline
          aria-label={alt}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </Box>
    );
  }

  return (
    <Box
      className={className}
      onClick={onClick}
      sx={{
        cursor: onClick ? "url('/image/icons/icon-zoom.svg'), zoom-in" : "default",
      }}
    >
      <CdnImage
        as="next"
        src={rawUrl}
        preset="galleryMain"
        kind={mediaType === MediaType.GIF ? MediaType.GIF : MediaType.IMAGE}
        mediaType={mediaType}
        fallback={fallbackImage}
        alt={alt}
        width={CDN_IMAGE_PRESETS.galleryMain.width}
        height={CDN_IMAGE_PRESETS.galleryMain.height}
        sizes="(max-width: 809px) 100vw, 50vw"
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className="gallery-img"
        style={{ width: "100%", height: "auto", display: "block", pointerEvents: "none" }}
      />
    </Box>
  );
};

interface ProductDetailContentProps {
  productData: IProductBySlugResponse;
  productInfos?: IProductInfoItem[];
  productMediaItems: MediaItem[];
  selectedVariation: IProductVariation;
  currentSelectedAttributes: Record<string, string>;
  relatedProducts?: ProductItemProps[];
  giftsData?: IProductGiftsResponse;
  promotionsData?: IProductPromotionsResponse;
  reviewSummaryData?: IProductReviewSummaryResponse;
  isWishlistActive?: boolean;
  onVariantSelect: (attrCode: string, valueCode: string, currentAttributes: Record<string, string>) => void;
  onToggleFavorite?: () => void | Promise<void>;
  onAddToCart: (variationId: string, item?: CartViewItem) => Promise<unknown> | unknown;
  onOpenLightbox: (index: number) => void;
  onOpenDrawer: () => void;
}

const ProductDetailContent = ({
  productData,
  productInfos,
  productMediaItems,
  selectedVariation,
  currentSelectedAttributes,
  relatedProducts = [],
  giftsData,
  promotionsData,
  reviewSummaryData,
  isWishlistActive = false,
  onVariantSelect,
  onToggleFavorite,
  onAddToCart,
  onOpenLightbox,
  onOpenDrawer,
}: ProductDetailContentProps) => {
  // hook
  const { classes, cx } = useStyles();
  const router = useRouter();
  const { persistCheckoutVariantSnapshots } = useCheckoutStorage();
  const productDefaultImage = useProductDefaultImage();
  const { isMobile } = useStorefrontBreakpoint();
  const { timeLeft, timeDisplay } = useCountdown(promotionsData?.flashSale?.endsInSeconds ?? 0);

  // state
  const [isMounted, setIsMounted] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [contactValue, setContactValue] = useState("");
  const [contactError, setContactError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onScroll = useCallback((api: any) => {
    const progress = Math.max(0, Math.min(1, api.scrollProgress()));
    setScrollProgress(progress * 100);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onScroll(emblaApi);
    emblaApi.on("scroll", onScroll);
    emblaApi.on("reInit", onScroll);
    return () => {
      emblaApi.off("scroll", onScroll);
      emblaApi.off("reInit", onScroll);
    };
  }, [emblaApi, onScroll]);

  // Transform product media to gallery item format
  const galleryMediaList = useMemo<MediaItem[]>(() => {
    if (productMediaItems.length > 0) return productMediaItems;
    return [{ url: productDefaultImage, mediaType: MediaType.IMAGE }];
  }, [productDefaultImage, productMediaItems]);

  const contextualVariantSelectors = useMemo(
    () => buildContextualVariantSelectors(productData.variantSelectors, productData.variants, currentSelectedAttributes),
    [productData.variantSelectors, productData.variants, currentSelectedAttributes],
  );

  const handleAttributeSelect = (attrCode: string, valueCode: string) => {
    const next = { ...currentSelectedAttributes, [attrCode]: valueCode };
    onVariantSelect(attrCode, valueCode, next);
  };

  const currentDisplayPrice = selectedVariation?.pricing?.customerDisplayPrice;
  const price = currentDisplayPrice?.sellingPriceAfterTaxMinor ?? 0;
  const originalPrice = currentDisplayPrice?.compareAtPriceAfterTaxMinor ?? 0;
  const showDiscountPercentTag = shouldShowDiscountPercentTag({
    showDiscountPercent: selectedVariation?.pricePresentation?.showDiscountPercent ?? productData.pricePresentation?.showDiscountPercent,
    hasDiscount: currentDisplayPrice?.hasDiscount,
    discountPercent: currentDisplayPrice?.discountPercent,
  });
  const isDiscontinued = productData.status === ProductLifecycleStatus.DISCONTINUED || productData.isPurchasable === false;
  const purchaseAction = useMemo(
    () =>
      resolvePurchaseAction({
        purchaseAction: selectedVariation?.purchaseAction ?? productData.defaultVariant?.purchaseAction,
        stockStatus: selectedVariation?.stockStatus ?? productData.defaultVariant?.stockStatus ?? productData.availability?.stockStatus,
        productStatus: productData.status,
        isDiscontinued,
        preOrderCampaignId: selectedVariation?.preOrderCampaignId ?? productData.defaultVariant?.preOrderCampaignId,
      }),
    [
      isDiscontinued,
      productData.availability?.stockStatus,
      productData.defaultVariant?.preOrderCampaignId,
      productData.defaultVariant?.purchaseAction,
      productData.defaultVariant?.stockStatus,
      productData.status,
      selectedVariation?.preOrderCampaignId,
      selectedVariation?.purchaseAction,
      selectedVariation?.stockStatus,
    ],
  );
  const canAddToCart = canAddToCartFromPurchaseAction(purchaseAction);
  const isPreOrderSku = isPreOrderPurchaseAction(purchaseAction);
  const expectedStockDate = useMemo(
    () => resolveProductExpectedStockDate(selectedVariation, productData.defaultVariant),
    [productData.defaultVariant, selectedVariation],
  );

  const buildOptimisticItem = useCallback(
    (): CartViewItem =>
      buildCartViewItemFromProductDetailVariant({
        productId: productData.id,
        productSlug: productData.slug,
        productName: productData.name,
        productImage: productData.gallery?.[0]?.url,
        variation: selectedVariation,
        variantSelectors: productData.variantSelectors,
        packagingOptions: productData.packagingOptions,
      }),
    [
      productData.gallery,
      productData.id,
      productData.name,
      productData.packagingOptions,
      productData.slug,
      productData.variantSelectors,
      selectedVariation,
    ],
  );

  const handleBackInStockRequest = useCallback(async () => {
    if (isLoading) return;
    const phone = contactValue.trim();
    if (phone && !PHONE_REGEX.test(phone)) {
      setContactError(VALIDATION_MESSAGES.phone);
      return;
    }
    setIsLoading(true);
    setContactError("");
    try {
      await CustomerRequestApi.postBackInStockRequest({
        phone,
        skuCode: selectedVariation?.sku,
      });
      toast.success("Cảm ơn bạn! Chúng tôi sẽ liên hệ ngay khi có hàng.");
      setIsNotifyOpen(false);
      setContactValue("");
    } catch (error) {
      toast.error(getErrorMessage(error) || "Không thể đăng ký. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, [contactValue, isLoading, selectedVariation?.sku]);

  const handleBuyNow = useCallback(async () => {
    if (isDiscontinued) {
      return;
    }

    try {
      const variantLabels = resolveCartVariantLabelsFromProductDetail(selectedVariation, productData.variantSelectors);
      const checkout = await initiateCheckout({
        items: [
          buildCheckoutItemPayload({
            variationId: String(selectedVariation.id),
            quantity: 1,
            utmData: readStoredUtmData(),
          }),
        ],
      });

      const checkoutSessionId = checkout.checkoutSessionId || "";
      if (checkoutSessionId) {
        persistCheckoutVariantSnapshots(checkoutSessionId, [
          {
            variationId: String(selectedVariation.id),
            details: variantLabels.details,
            sizeLabel: variantLabels.sizeLabel,
          },
        ]);
      }

      router.push(`/thanh-toan?sessionId=${checkoutSessionId}`);
    } catch (error) {
      toast.error(getErrorMessage(error) || "Không thể tạo phiên thanh toán. Vui lòng thử lại.");
    }
  }, [isDiscontinued, persistCheckoutVariantSnapshots, productData.variantSelectors, router, selectedVariation]);

  return (
    <Box className={classes.gridContainer}>
      {/* ── Left Section: Gallery ── */}
      <Box className={classes.leftSection}>
        <StackRowAlignJustCenter className={classes.favoriteIconWrapper} onClick={onToggleFavorite}>
          {isWishlistActive ? <Heart size={16} color="#9259E3" fill="#9259E3" /> : <Heart size={16} color="#000" />}
        </StackRowAlignJustCenter>
        {/* PC/Tablet: Vertical stack */}
        {!isMounted || !isMobile ? (
          <Box className={classes.galleryStack}>
            {galleryMediaList.map((item, index) => (
              <GalleryMediaItem
                key={`${item.url || "media"}-${index}`}
                item={item}
                alt={productData.name}
                className={classes.galleryImageWrapper}
                fallbackImage={productDefaultImage}
                priority={index === 0}
                onClick={getMediaType(item.url, item.mediaType) !== MediaType.VIDEO ? () => onOpenLightbox(index) : undefined}
              />
            ))}
          </Box>
        ) : null}

        {/* Mobile: Embla slider */}
        {isMounted && isMobile ? (
          <Box className={classes.mobileSlider}>
            <Box className={classes.sliderViewport} ref={emblaRef}>
              <Box className={classes.sliderContainer}>
                {galleryMediaList.map((item, index) => (
                  <Box key={`${item.url || "media"}-${index}`} className={classes.sliderSlide}>
                    <GalleryMediaItem
                      item={item}
                      alt={productData.name}
                      className={classes.galleryImageWrapper}
                      fallbackImage={productDefaultImage}
                      priority={index === 0}
                      onClick={getMediaType(item.url, item.mediaType) !== MediaType.VIDEO ? () => onOpenLightbox(index) : undefined}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
            {/* Progress Bar */}
            <Box className={classes.progressBarContainer}>
              <Box
                className={classes.progressBarFill}
                style={{
                  width: `${100 / galleryMediaList.length}%`,
                  transform: `translateX(${scrollProgress * (galleryMediaList.length - 1)}%)`,
                }}
              />
            </Box>
          </Box>
        ) : null}
      </Box>

      {/* ── Right Section: Product Info (Sticky) ── */}
      <Box className={classes.rightSectionContainer}>
        <Stack className={classes.rightSection}>
          <Box>
            <Typography className={classes.categoryText}>{productData.category.name}</Typography>
            <Typography component="h1" className={classes.titleText}>
              {productData.name}
            </Typography>
            {isDiscontinued ? (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  px: 1.25,
                  py: 0.5,
                  mb: 1.5,
                  borderRadius: "999px",
                  bgcolor: "#F3F4F6",
                  color: "#4B5563",
                }}
              >
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: "inherit" }}>Ngừng kinh doanh</Typography>
              </Box>
            ) : null}
            <Typography className={classes.skuText}>SKU: {selectedVariation?.sku || ""}</Typography>

            {/* Rating & Share */}
            {/* <Box className={classes.statsBox}>
              <Box className={classes.ratingGroup}>
                <Box className={classes.starList}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star01 key={i} size={16} fill="#DDFC46" color="#2C3E50" />
                  ))}
                </Box>
                <Typography className={classes.ratingText}>({reviewSummaryData?.averageRating || 0})</Typography>
              </Box>
              <Box className={classes.shareGroup}>
                <Share07 size={16} fill="#273BCD" color="#273BCD" />
                <Typography className={classes.shareText}>Chia sẻ</Typography>
              </Box>
            </Box> */}

            {/* Price */}
            <Box className={classes.priceBox}>
              <Typography className={classes.priceDiscount}>{formatPrice(Number(price))}</Typography>
              {originalPrice > price && <Typography className={classes.priceOriginal}>{formatPrice(Number(originalPrice))}</Typography>}
              {showDiscountPercentTag && <DiscountPercentTag discountPercent={currentDisplayPrice?.discountPercent} />}
            </Box>

            {/* Flash Sale */}
            {promotionsData?.flashSale?.active && timeLeft > 0 && (
              <Box className={classes.flashSaleContainer}>
                <Box className={classes.flashSaleHeader}>
                  <StackRowAlignCenter gap={0.5} sx={{ flex: 1, minWidth: 0 }}>
                    <Image src="/image/logo/banner-icon.png" alt="Flash Sale" width={22} height={21} />
                    <Typography className={classes.flashSaleTitle}>{promotionsData.flashSale.label}</Typography>
                  </StackRowAlignCenter>
                  <StackRowAlignCenter className={classes.soldLabel}>
                    <Box sx={{ position: "relative", top: "-2px" }}>
                      <Image src="/image/icons/icon-fire.svg" alt="Hot" width={18} height={22} />
                    </Box>
                    <Typography className={classes.soldText}>
                      Đã bán {promotionsData.flashSale.soldCount}/{promotionsData.flashSale.soldTotalCount} suất
                    </Typography>
                  </StackRowAlignCenter>
                  <Box className={classes.cornerDecoration}>
                    <Check size={10} color="#fff" />
                  </Box>
                </Box>

                <StackRowAlignCenterJustBetween className={classes.flashSaleContent}>
                  <Box>
                    <Typography className={classes.labelSmall}>Giảm ngay</Typography>
                    <StackRowAlignCenter gap={0.5}>
                      <Typography className={classes.priceMd}>{formatPrice(Number(promotionsData.flashSale.soldValue))}</Typography>
                      <Image src="/image/icons/icon-flash-sale.svg" alt="Discount" width={14} height={14} />
                    </StackRowAlignCenter>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography className={classes.timeLabel}>Kết thúc sau</Typography>
                    <StackRowAlignCenter gap={0.5}>
                      {timeDisplay.map((time: string, i: number) => (
                        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Box className={classes.timeItem}>{time}</Box>
                          {i < 2 && <Typography className={classes.timeSeparator}>:</Typography>}
                        </Box>
                      ))}
                    </StackRowAlignCenter>
                  </Box>
                </StackRowAlignCenterJustBetween>
              </Box>
            )}

            {/* Discount Tags */}
            {promotionsData?.vouchers && promotionsData.vouchers.length > 0 && (
              <StackRowAlignCenter className={classes.tagContainer}>
                <Typography className={classes.tagLabel}>Mã giảm giá</Typography>
                {promotionsData.vouchers.map((v, index) => (
                  <StackRowAlignCenter key={v.id || `${v.code}-${index}`} className={classes.tagItem}>
                    <Typography className={classes.tagText}>{v.code}</Typography>
                  </StackRowAlignCenter>
                ))}
              </StackRowAlignCenter>
            )}
          </Box>

          {/* Variant Selection */}
          <ProductVariantSelector
            variantSelectors={contextualVariantSelectors}
            selectedAttributes={currentSelectedAttributes}
            onAttributeSelect={handleAttributeSelect}
            onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          />

          {/* Action Buttons */}
          <Stack className={classes.buttonBox}>
            {isPreOrderSku ? (
              <Typography className={classes.preOrderNotice}>
                {PRE_ORDER_PDP_NOTICE_PREFIX}
                {expectedStockDate ? (
                  <>
                    {" "}
                    <Box component="span" className={classes.preOrderNoticeDate}>
                      {expectedStockDate}
                    </Box>
                  </>
                ) : null}
              </Typography>
            ) : null}
            <Box
              disabled={!canAddToCart}
              component="button"
              className={cx(classes.btnBase, classes.btnAddToCart)}
              onClick={() => {
                if (!canAddToCart) {
                  return;
                }
                onAddToCart(selectedVariation.id, buildOptimisticItem());
              }}
            >
              {isDiscontinued || purchaseAction.code === ProductPurchaseActionCode.DISABLED ? "Ngừng kinh doanh" : "Thêm vào giỏ"}
            </Box>
            <Box
              disabled={!purchaseAction.enabled}
              component="button"
              className={cx(classes.btnBase, classes.btnBuyNow)}
              onClick={() => {
                if (!purchaseAction.enabled) {
                  return;
                }
                if (isNotifyPurchaseAction(purchaseAction)) {
                  setIsNotifyOpen(true);
                  return;
                }
                if (isBuyOrPreOrderPurchaseAction(purchaseAction)) {
                  void handleBuyNow();
                }
              }}
            >
              {purchaseAction.label}
            </Box>
          </Stack>

          <Stack gap={3}>
            {/* Accordion Sections */}
            <Box sx={{ borderTop: "1px solid #E5E5E5" }}>
              {(productInfos ?? productData.productInfos ?? []).map((item, index) => (
                <AccordionComponent key={"id" in item && item.id ? `${item.id}-${index}` : `${item.title}-${index}`} title={item.title}>
                  <ServerSafeContent component="div" className="ck-content" rawHtml={"content" in item ? item.content : item.description} />
                </AccordionComponent>
              ))}
            </Box>

            {/* {packagingOptionsToShow.length > 0 && (
              <Box>
                <Typography className={classes.giftTitle}>Bao bì đi kèm</Typography>
                {packagingOptionsToShow.map((option, index) => (
                  <Box key={option.relationId || `packaging-${index}`} className={classes.giftItem}>
                    <Box className={classes.giftLeft}>
                      <CdnImage
                        src={option.packaging?.image ?? selectedVariation?.gallery?.[0]?.url}
                        preset="giftThumb"
                        fallback={productDefaultImage}
                        className={classes.giftImage}
                        alt={option.packaging?.name ?? ""}
                      />
                      <Box className={classes.giftInfo}>
                        <Box className={classes.giftBadgeRow}>
                          <Box className={classes.packagingBadge}>
                            <Package size={12} color="#1E3A8A" />
                            Đi kèm
                          </Box>
                        </Box>
                        <Typography className={classes.giftName}>{option.packaging?.name ?? ""}</Typography>
                        <Typography className={classes.giftQuantity}>x{option.quantity}</Typography>
                      </Box>
                    </Box>
                    <Box className={classes.giftRight}>
                      <Typography className={classes.giftPriceCurrent}>
                        {formatPrice(Number(option.packaging?.basePriceAfterTax ?? 0))}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )} */}

            {/* Gift Section */}
            {/* {giftsData?.items && giftsData.items.length > 0 && (
              <Box>
                <Typography className={classes.giftTitle}>Quà tặng</Typography>
                {giftsData.items.map((item) => (
                  <Box key={item.id} className={classes.giftItem}>
                    <Box className={classes.giftLeft}>
                      <CdnImage
                        src={item.image ?? selectedVariation?.gallery?.[0]?.url}
                        preset="giftThumb"
                        fallback={productDefaultImage}
                        className={classes.giftImage}
                        alt={item.name}
                      />
                      <Box className={classes.giftInfo}>
                        <Box className={classes.giftBadgeRow}>
                          <Box className={classes.giftBadge}>
                            <Gift01 size={12} color="#333333" />
                            Quà tặng
                          </Box>
                          <Typography className={classes.giftName}>{item.name}</Typography>
                        </Box>
                        <Typography className={classes.giftQuantity}>x{item.quantity}</Typography>
                      </Box>
                    </Box>
                    <Box className={classes.giftRight}>
                      <Typography className={classes.giftPriceCurrent}>
                        {item.sellingPriceAfterTaxMinor ? formatPrice(Number(item.sellingPriceAfterTaxMinor)) : "0đ"}
                      </Typography>
                      {Number(item.compareAtPriceAfterTaxMinor) > Number(item.sellingPriceAfterTaxMinor) && (
                        <Typography className={classes.giftPriceOld}>{formatPrice(Number(item.compareAtPriceAfterTaxMinor))}</Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )} */}

            {/* Mix & Match */}
            {(relatedProducts?.length || relatedProducts?.length > 0) && (
              <Box>
                <Box className={classes.sectionHeader}>
                  <Typography className={classes.sectionTitle}>Mix & Match</Typography>
                  <Typography className={classes.viewMore} onClick={onOpenDrawer}>
                    Xem thêm
                  </Typography>
                </Box>
                <ProductSliderComponent
                  isMobileTemplate
                  slidesPerView={2}
                  onAddToCart={onAddToCart}
                  onProductClick={(slug) => router.push(`/san-pham/${slug}`)}
                  sx={{ borderLeft: "1px solid #E0E0E0" }}
                  items={relatedProducts}
                />
              </Box>
            )}
          </Stack>
        </Stack>
      </Box>

      <ProductSizeGuideDrawer
        open={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        onCloseAll={() => setIsSizeGuideOpen(false)}
      />
      <DialogComponent
        open={isNotifyOpen}
        onClose={() => {
          setIsNotifyOpen(false);
          setContactValue("");
          setContactError("");
        }}
        title="NHẬN THÔNG BÁO KHI HÀNG VỀ"
        sx={{ width: "500px" }}
        buttonCenter={
          <Box
            component="button"
            className={cx(classes.btnBase, classes.btnBuyNow)}
            disabled={isLoading}
            onClick={() => {
              handleBackInStockRequest();
            }}
          >
            Liên hệ khi có hàng
          </Box>
        }
      >
        <Stack className={classes.notifyRoot}>
          <Box className={classes.notifyProductBox}>
            <Box className={classes.notifyProductImageWrapper}>
              <CdnImage
                src={selectedVariation?.image || selectedVariation?.gallery?.[0]?.url || productData?.gallery?.[0]?.url}
                preset="notifyThumb"
                fallback={productDefaultImage}
                className={classes.notifyProductImage}
                alt={productData.name}
              />
            </Box>
            <Box className={classes.notifyProductContent}>
              <Stack className={classes.notifyProductInfo}>
                <Typography className={classes.notifyProductName}>{productData.name}</Typography>
                <Stack sx={{ gap: "4px" }}>
                  {Object.entries(selectedVariation?.attributes || {}).flatMap(([attrCode, value]) => {
                    const selector = productData.variantSelectors.find((s) => s.attribute.code === attrCode);
                    const option = selector?.options.find((o) => o.code === value);
                    if (!selector || !option) return [];

                    return [
                      <Typography
                        key={attrCode}
                        sx={{
                          ...TYPOGRAPHY_STYLES.sm.regular,
                          color: "#27272A",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          lineHeight: "16px",
                        }}
                      >
                        {selector.attribute.name}: {option.label}
                      </Typography>,
                    ];
                  })}
                </Stack>
              </Stack>

              <Stack className={classes.notifyPriceBox}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.bold, color: "#27272A" }}>{price.toLocaleString()}đ</Typography>
                {originalPrice > price && (
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#9DA3AE", textDecoration: "line-through" }}>
                    {originalPrice.toLocaleString()}đ
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>

          <TextFieldComponent
            label="Số điện thoại của bạn"
            value={contactValue}
            onValueChange={(next) => {
              setContactValue(next);
              if (contactError) setContactError("");
            }}
            error={contactError}
          />
        </Stack>
      </DialogComponent>
    </Box>
  );
};

export default ProductDetailContent;
