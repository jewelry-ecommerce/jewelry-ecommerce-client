import { Box } from "@mui/material";
import useDiscountPercentTagStyles from "./discount-percent-tag.styles";

export interface DiscountPercentTagProps {
  discountPercent?: number | null;
  className?: string;
}

export function resolveDiscountPercentFromLabel(discountLabel?: string): number | undefined {
  if (!discountLabel) {
    return undefined;
  }

  const match = discountLabel.match(/(\d+)/);
  const percent = match ? Number(match[1]) : 0;
  return percent > 0 ? percent : undefined;
}

export function resolveCartItemDiscountPercent(price: { discountPercent?: number | null; discountLabel?: string }): number | undefined {
  if (price.discountPercent === null) {
    return undefined;
  }

  if (typeof price.discountPercent === "number" && price.discountPercent > 0) {
    return price.discountPercent;
  }

  if (price.discountPercent !== undefined) {
    return undefined;
  }

  return resolveDiscountPercentFromLabel(price.discountLabel);
}

export function DiscountPercentTag({ discountPercent, className }: DiscountPercentTagProps) {
  const { classes, cx } = useDiscountPercentTagStyles();

  if (!discountPercent || discountPercent <= 0) {
    return null;
  }

  return (
    <Box component="span" className={cx(classes.root, className)}>
      {`-${discountPercent}%`}
    </Box>
  );
}
