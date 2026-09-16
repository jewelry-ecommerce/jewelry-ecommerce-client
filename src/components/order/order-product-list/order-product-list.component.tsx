import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import CheckoutProductItem from "@/app/(layout-focus)/thanh-toan/_components/checkout-product-list/components/checkout-product-item.component";
import CheckoutSetItem from "@/app/(layout-focus)/thanh-toan/_components/checkout-product-list/components/checkout-set-item.component";
import useStyles from "./order-product-list.styles";
import { StackAlignCenter } from "@/components/styled";
import { resolveCheckoutItemVariantLines } from "@/app/(layout-focus)/thanh-toan/_components/checkout.helpers";
import { useProductDefaultImage } from "@/components/providers.component";
import type { CheckoutSessionSetItem, OrderDetailLineAttribute } from "@/utils/api/checkout/checkout.interface";

export interface OrderProductItem {
  id: string;
  image: string;
  name: string;
  variationName?: string;
  variantDetails?: string;
  attributes?: OrderDetailLineAttribute[];
  quantity: number;
  price: string;
  originalPrice?: string;
  isGift?: boolean;
}

export interface OrderProductListProps {
  products: OrderProductItem[];
  setItems?: CheckoutSessionSetItem[];
  title?: string;
}

const OrderProductListSection = ({ products, setItems = [], title = "Sản phẩm" }: OrderProductListProps) => {
  const { classes } = useStyles();
  const productDefaultImage = useProductDefaultImage();
  return (
    <Stack className={classes.root}>
      {title && <Typography className={classes.title}>{title}</Typography>}
      <StackAlignCenter className={classes.list}>
        {setItems.map((item) => (
          <CheckoutSetItem key={item.lineId} item={item} skipSetLookup />
        ))}
        {products.map((product) => (
          <CheckoutProductItem
            key={product.id}
            image={product.image || productDefaultImage}
            name={product.variationName || product.name}
            variantLines={resolveCheckoutItemVariantLines({
              productName: product.name,
              variationName: product.variationName,
              attributes: product.attributes,
            })}
            quantity={product.quantity}
            price={product.price}
            originalPrice={product.originalPrice}
            isGift={product.isGift}
          />
        ))}
      </StackAlignCenter>
    </Stack>
  );
};

export default OrderProductListSection;
