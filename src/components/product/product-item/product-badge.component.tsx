import { Box, Typography } from "@mui/material";
import { CdnImage } from "@/components/cdn-image";
import { BadgePosition } from "@/utils/api/badge/badge.interface";
import { isProductBadgeBottomCenter, type ProductBadgeView, type ProductCardBadgePosition } from "@/utils/api/badge/badge.util";

type ProductBadgeClasses = Record<string, string>;

type ProductBadgeProps = {
  badge: ProductBadgeView;
  classes: ProductBadgeClasses;
  badgeStyleSx?: Record<string, unknown>;
};

const positionClassMap: Record<ProductCardBadgePosition, keyof ProductBadgeClasses> = {
  [BadgePosition.TOP_LEFT]: "badgeTopLeft",
  [BadgePosition.TOP_RIGHT]: "badgeTopRight",
  [BadgePosition.CENTER_LEFT]: "badgeCenterLeft",
  [BadgePosition.CENTER_RIGHT]: "badgeCenterRight",
  [BadgePosition.BOTTOM_LEFT]: "badgeBottomLeft",
  [BadgePosition.BOTTOM_RIGHT]: "badgeBottomRight",
  [BadgePosition.BOTTOM_CENTER]: "badgeBottomFull",
  [BadgePosition.PRICE_LINE]: "badgePriceLine",
};

const cornerImageBadgeWrapperSx = {
  p: 0,
  bgcolor: "transparent",
  borderRadius: 0,
  minWidth: "unset",
};

const bottomFullImageBadgeWrapperSx = {
  p: 0,
  minHeight: "unset",
  bgcolor: "transparent",
  borderRadius: 0,
  display: "block",
  alignItems: "unset",
  justifyContent: "unset",
  boxSizing: "border-box",
};

const buildTextStyleSx = (style?: ProductBadgeView["style"]) => {
  if (!style || typeof style !== "object") return undefined;
  return {
    ...(typeof style.backgroundColor === "string" ? { backgroundColor: style.backgroundColor } : {}),
    ...(typeof style.textColor === "string" ? { color: style.textColor } : {}),
  };
};

const ProductBadge = ({ badge, classes, badgeStyleSx }: ProductBadgeProps) => {
  const className = classes[positionClassMap[badge.position]];

  if (badge.type === "IMAGE" && badge.imageUrl) {
    if (isProductBadgeBottomCenter(badge.position)) {
      return (
        <Box className={className} sx={bottomFullImageBadgeWrapperSx}>
          <CdnImage
            src={badge.imageUrl}
            preset="productBadgeBottomFull"
            alt="Product badge"
            sx={{
              display: "block",
              width: "100%",
              height: "auto",
            }}
          />
        </Box>
      );
    }

    return (
      <Box className={className} sx={cornerImageBadgeWrapperSx}>
        <CdnImage src={badge.imageUrl} alt="Product badge" className={classes.badgeCornerImage} />
      </Box>
    );
  }

  if (!badge.text) return null;

  const sx = badgeStyleSx ?? buildTextStyleSx(badge.style);

  return (
    <Box className={className} sx={{ padding: "2px 8px", ...sx }}>
      <Typography component="span" sx={{ fontSize: "inherit", lineHeight: "inherit", color: "inherit" }}>
        {badge.text}
      </Typography>
    </Box>
  );
};

export default ProductBadge;
