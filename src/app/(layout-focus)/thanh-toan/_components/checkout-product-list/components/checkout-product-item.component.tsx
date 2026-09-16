import React, { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import Image from "next/image";
import useStyles from "./checkout-product-item.styles";
import { StackAlignEnd, StackRowAlignCenter, StackRowAlignJustCenter, StackRowAlignStartJustBetween } from "@/components/styled";
import { Gift01 } from "@untitledui/icons";

interface CheckoutProductItemProps {
  image: string;
  name: string;
  variantLines?: string[];
  quantity: number;
  price: string;
  originalPrice?: string;
  isGift?: boolean;
  compact?: boolean;
  badgeLabel?: string;
}

const CheckoutProductItem = ({
  image,
  name,
  variantLines = [],
  quantity,
  price,
  originalPrice,
  isGift,
  compact = false,
  badgeLabel,
}: CheckoutProductItemProps) => {
  const { classes } = useStyles();

  const visibleVariantLines = useMemo(() => variantLines.map((line) => line.trim()).filter(Boolean), [variantLines]);

  return (
    <Box className={classes.root} sx={compact ? { padding: "10px 12px", gap: "10px", backgroundColor: "#FAFAFA" } : undefined}>
      <StackRowAlignJustCenter className={classes.imageWrapper} sx={compact ? { width: 46, height: 46, borderRadius: "4px" } : undefined}>
        <Image src={image} alt={name} className={classes.image} width={62} height={62} />
        <StackRowAlignJustCenter
          className={classes.quantityBadge}
          sx={compact ? { minWidth: 18, height: 18, fontSize: 10, lineHeight: "18px", padding: "0 3px", top: -7, right: -6 } : undefined}
        >
          {quantity}
        </StackRowAlignJustCenter>
      </StackRowAlignJustCenter>

      <StackRowAlignStartJustBetween className={classes.infoWrapper} sx={compact ? { paddingTop: 2, alignItems: "flex-start" } : undefined}>
        <Stack className={classes.nameDetailsCol}>
          <StackRowAlignCenter className={classes.titleWrapper}>
            {isGift && (
              <StackRowAlignCenter className={classes.giftTag}>
                <Box className={classes.giftIcon}>
                  <Gift01 size={16} strokeWidth={2.5} />
                </Box>
                {badgeLabel && <Typography className={classes.giftText}>{badgeLabel}</Typography>}
              </StackRowAlignCenter>
            )}
            <Typography className={classes.title} sx={compact ? { fontSize: 13, lineHeight: "18px" } : undefined}>
              {name}
            </Typography>
          </StackRowAlignCenter>
          <Stack className={classes.variantWrapper}>
            {visibleVariantLines.map((line, idx) => (
              <Typography
                key={`${line}-${idx}`}
                className={classes.variantInfo}
                sx={compact ? { fontSize: 11, lineHeight: "16px" } : undefined}
              >
                {line}
              </Typography>
            ))}
          </Stack>
        </Stack>

        <StackAlignEnd className={classes.priceCol}>
          <Typography className={classes.price} sx={compact ? { fontSize: 13, lineHeight: "18px" } : undefined}>
            {price}
          </Typography>
          {originalPrice && (
            <Typography className={classes.originalPrice} sx={compact ? { fontSize: 11, lineHeight: "16px" } : undefined}>
              {originalPrice}
            </Typography>
          )}
        </StackAlignEnd>
      </StackRowAlignStartJustBetween>
    </Box>
  );
};

export default CheckoutProductItem;
