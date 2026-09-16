import { Box, Stack, Typography } from "@mui/material";
import useSWR from "swr";
import SetBadge from "@/app/(layout-main)/sets/_components/set-badge.component";
import SetKeyBadge from "@/app/(layout-main)/sets/_components/set-key-badge.component";
import { CdnImage } from "@/components/cdn-image";
import { useProductDefaultImage } from "@/components/providers.component";
import type { CheckoutSessionItem, CheckoutSessionSetItem } from "@/utils/api/checkout/checkout.interface";
import type { SetDetailResponse } from "@/utils/api/sets/sets.interface";
import { formatPrice } from "@/utils/constants/common.constant";
import { resolveCheckoutItemVariantLines } from "../../checkout.helpers";
import useStyles from "./checkout-set-item.styles";
import { SetsApi } from "@/utils/api";

const resolveItemPrice = (item: CheckoutSessionItem) =>
  Number(item.customerDisplayPrice?.sellingPriceAfterTaxMinor ?? item.finalAmount ?? item.salePrice ?? item.unitPrice ?? 0);

const resolveSetPrice = (item: CheckoutSessionSetItem) =>
  Number(item.subtotalMinor ?? item.components.reduce((total, component) => total + resolveItemPrice(component), 0));

const resolveSetCompareAtPrice = (item: CheckoutSessionSetItem) => {
  if (item.compareAtSubtotalMinor != null) return Number(item.compareAtSubtotalMinor);
  return item.components.reduce((total, component) => total + Number(component.customerDisplayPrice?.compareAtPriceAfterTaxMinor ?? 0), 0);
};

const isSetKeyComponent = (component: CheckoutSessionItem, set?: SetDetailResponse) =>
  component.isKey === true ||
  (set?.includedProducts.some(
    (includedProduct) => includedProduct.isKey && includedProduct.variants.some((variation) => variation.id === component.variationId),
  ) ??
    false);

const getSetComponentSummaries = (components: CheckoutSessionItem[], set?: SetDetailResponse): string[] => {
  return components.map((component) => {
    const includedProduct = set?.includedProducts.find((product) =>
      product.variants.some((variation) => variation.id === component.variationId),
    );
    const categoryName = component.categoryName ?? includedProduct?.product.categoryName ?? "Sản phẩm";
    const matchingComponents = components.filter((item) => {
      const matchingProduct = set?.includedProducts.find((product) =>
        product.variants.some((variation) => variation.id === item.variationId),
      );
      return (item.categoryName ?? matchingProduct?.product.categoryName ?? "Sản phẩm") === categoryName;
    });
    const categoryLabel = matchingComponents.length > 1 ? `${categoryName} ${matchingComponents.indexOf(component) + 1}` : categoryName;
    const variantLines = resolveCheckoutItemVariantLines(component);
    return variantLines.length ? `${categoryLabel}: ${variantLines.join(" | ")}` : categoryLabel;
  });
};

type CheckoutSetComponentProps = {
  item: CheckoutSessionItem;
  isKey: boolean;
};

const CheckoutSetComponent = ({ item, isKey }: CheckoutSetComponentProps) => {
  const { classes } = useStyles();
  const fallbackImage = useProductDefaultImage();
  const variantLines = resolveCheckoutItemVariantLines(item);

  return (
    <Box className={classes.component}>
      <Box className={classes.componentImageWrapper}>
        <CdnImage
          as="next"
          src={item.image || fallbackImage}
          fallback={fallbackImage}
          alt={item.productName || item.variationName || item.skuCode}
          width={46}
          height={46}
          className={classes.componentImage}
          preset="cartLineItem"
        />
      </Box>
      <Stack className={classes.componentDetails}>
        {isKey ? <SetKeyBadge /> : null}
        <Typography className={classes.componentName}>{item.productName || item.variationName || item.skuCode}</Typography>
        {variantLines.map((line, index) => (
          <Typography key={`${line}-${index}`} className={classes.componentVariant}>
            {line}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
};

type CheckoutSetItemProps = {
  item: CheckoutSessionSetItem;
  skipSetLookup?: boolean;
};

const CheckoutSetItem = ({ item, skipSetLookup = false }: CheckoutSetItemProps) => {
  const { classes } = useStyles();
  const fallbackImage = useProductDefaultImage();
  const { data: set } = useSWR(skipSetLookup ? null : `catalog/sets/${item.setId}`, () => SetsApi.getSetBySlug(item.setId));
  const price = resolveSetPrice(item);
  const compareAtPrice = resolveSetCompareAtPrice(item);
  const componentSummaries = getSetComponentSummaries(item.components, set);
  const name = set?.name ?? item.name ?? "Bộ sản phẩm";
  const image = set?.images[0] ?? item.image ?? fallbackImage;

  return (
    <Stack className={classes.root}>
      <Box className={classes.header}>
        <Box className={classes.imageWrapper}>
          <CdnImage
            as="next"
            src={image}
            fallback={fallbackImage}
            alt={name}
            width={62}
            height={62}
            className={classes.image}
            preset="cartLineItem"
          />
          <Box className={classes.quantityBadge}>{item.quantity}</Box>
        </Box>
        <Stack className={classes.details}>
          <SetBadge />
          <Typography className={classes.name}>{name}</Typography>
          {componentSummaries.map((summary) => (
            <Typography key={summary} className={classes.componentSummary}>
              {summary}
            </Typography>
          ))}
        </Stack>
        <Stack alignItems="flex-end">
          <Typography className={classes.price}>{formatPrice(price)}</Typography>
          {compareAtPrice > price ? <Typography className={classes.originalPrice}>{formatPrice(compareAtPrice)}</Typography> : null}
        </Stack>
      </Box>
      <Stack className={classes.components}>
        {item.components.map((component) => (
          <CheckoutSetComponent key={component.id || component.variationId} item={component} isKey={isSetKeyComponent(component, set)} />
        ))}
      </Stack>
    </Stack>
  );
};

export default CheckoutSetItem;
