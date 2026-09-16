"use client";
import AppLink from "@/components/app-link/app-link.component";
import { StackRowJustBetween } from "@/components/styled";
import { CartRecommendationProduct } from "@/utils/api/cart/cart.interface";
import { buildCartViewItemFromRecommendation } from "@/utils/api/cart/cart-view-item-builder.util";
import { formatProductAttributeValues, isCartRecommendationOutOfStock } from "@/utils/api/cart/cart.util";
import { Box, Typography } from "@mui/material";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback } from "react";
import useAddToCart from "@/hooks/cart/use-add-to-cart.hook";
import useStyles from "./may-you-be-interested.styles";
import { ShoppingBag02 } from "@untitledui/icons";
import { useProductDefaultImage } from "@/components/providers.component";
import { formatPrice } from "@/utils/constants/common.constant";

export interface MayYouBeInterestedProps {
  products: CartRecommendationProduct[];
  title?: string;
  isLoading?: boolean;
  onClose?: () => void;
}

const MayYouBeInterestedComponent = ({ products, title = "Có thể bạn quan tâm", isLoading, onClose }: MayYouBeInterestedProps) => {
  const productDefaultImage = useProductDefaultImage();
  const { classes, cx } = useStyles();
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });
  const { handleAddToCart } = useAddToCart();

  const handleProductClick = useCallback((productSlug: string) => {}, []);

  if (!isLoading && (!products || products.length === 0)) return null;

  return (
    <Box className={classes.root}>
      <Typography className={classes.title}>{title}</Typography>

      {products && products.length > 0 && (
        <Box className={classes.embla} ref={emblaRef}>
          <Box className={classes.emblaContainer}>
            {products.map((product) => {
              const isOutOfStock = isCartRecommendationOutOfStock(product);
              const attributeText = formatProductAttributeValues(product.attributes);
              const productHref = product?.slug ? `/san-pham/${product.slug}` : null;

              return (
                <Box key={product.id} className={classes.emblaSlide}>
                  <Box className={classes.card}>
                    {productHref ? (
                      <AppLink href={productHref} className={classes.imageWrapper} onClick={onClose}>
                        <Image
                          src={product.product?.image ?? productDefaultImage}
                          alt={product.product?.name ?? product.name ?? ""}
                          fill
                          className={classes.image}
                        />
                      </AppLink>
                    ) : (
                      <Box
                        className={classes.imageWrapper}
                        onClick={() =>
                          (product.product?.id ?? product.productId) && handleProductClick(product.product?.id ?? product.productId)
                        }
                        role="button"
                        tabIndex={0}
                      >
                        <Image
                          src={product.product?.image ?? productDefaultImage}
                          alt={product.product?.name ?? product.name ?? ""}
                          fill
                          className={classes.image}
                        />
                      </Box>
                    )}

                    <Box className={classes.content}>
                      <StackRowJustBetween className={classes.metaRow}>
                        <Box className={classes.titleWrap}>
                          {productHref ? (
                            <AppLink href={productHref} className={classes.productNameLink} onClick={onClose}>
                              <Typography className={classes.productTitle}>{product.product?.name ?? product.name}</Typography>
                            </AppLink>
                          ) : (
                            <Typography className={classes.productTitle}>{product.product?.name ?? product.name}</Typography>
                          )}
                          {attributeText ? <Typography className={classes.attributesText}>{attributeText}</Typography> : null}
                        </Box>
                        <Box className={classes.priceRow}>
                          <Typography className={classes.price}>
                            {formatPrice(product.customerDisplayPrice?.sellingPriceAfterTaxMinor ?? 0)}
                          </Typography>
                          {(product.customerDisplayPrice?.compareAtPriceAfterTaxMinor ?? 0) >
                            (product.customerDisplayPrice?.sellingPriceAfterTaxMinor ?? 0) && (
                            <Typography className={classes.originalPrice}>
                              {formatPrice(product.customerDisplayPrice?.compareAtPriceAfterTaxMinor ?? 0)}
                            </Typography>
                          )}
                        </Box>
                      </StackRowJustBetween>
                      <Box
                        role="button"
                        aria-label={isOutOfStock ? "Sản phẩm hết hàng" : "Thêm vào giỏ hàng"}
                        aria-disabled={isOutOfStock}
                        onClick={() => {
                          if (isOutOfStock) return;
                          void handleAddToCart(product.id, 1, buildCartViewItemFromRecommendation(product));
                        }}
                        className={cx(classes.addToCartButton, isOutOfStock && classes.addToCartButtonDisabled)}
                      >
                        <ShoppingBag02 size={16} color={isOutOfStock ? "#B0B0B0" : "#333"} />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MayYouBeInterestedComponent;
