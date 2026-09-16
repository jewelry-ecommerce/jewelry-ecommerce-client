import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "../../../utils/constants/typography.constant";
import { PRODUCT_CARD_IMAGE_WIDTH } from "@/components/product/product-grid/product-grid.constants";

/** Desktop: kích thước badge ảnh góc card (px). */
const BADGE_CORNER_IMAGE_MAX_WIDTH_PX = 96;
const BADGE_CORNER_IMAGE_MAX_HEIGHT_PX = 32;

/** % chiều rộng khung ảnh (350px). Ảnh hẹp hơn → label nhỏ cùng tỷ lệ. */
const badgeSize = (px: number) => `${(px / PRODUCT_CARD_IMAGE_WIDTH) * 100}cqw`;

const badgeBase = {
  position: "absolute" as const,
  zIndex: 4,
  ...TYPOGRAPHY_STYLES["sm"].bold,
};

const useStyles = makeStyles<{ isMobileTemplate?: boolean }>({ name: "ProductItem" })((theme, { isMobileTemplate }) => {
  return {
    root: {
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      position: "relative",
      cursor: "pointer",
      width: "100%",
      height: "100%",
      alignSelf: "stretch",
      boxSizing: "border-box",
      borderTop: "1px solid #E0E0E0",
      borderBottom: "1px solid #E0E0E0",
      borderRight: "1px solid #E0E0E0",
      [theme.breakpoints.down("md")]: {
        padding: "8px",
      },
    },
    imageSection: {
      position: "relative",
      width: "100%",
      flexShrink: 0,
      aspectRatio: "350 / 440",
      overflow: "hidden",
      containerType: "inline-size",
      [theme.breakpoints.up("lg")]: {
        "&:hover": {
          "& .add-to-cart-btn": {
            opacity: 1,
            zIndex: 5,
            pointerEvents: "auto",
          },
          "& .favorite-icon": {
            opacity: 1,
            zIndex: 5,
            pointerEvents: "auto",
          },
        },
      },
    },
    imageSectionHasHover: {
      [theme.breakpoints.up("lg")]: {
        "&:hover .primary-image": {
          opacity: 0,
        },
        "&:hover .hover-image": {
          opacity: 1,
        },
      },
    },
    productImage: {
      backgroundColor: "var(--product-image-background)",
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    hoverImage: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 2,
      opacity: 0,
      pointerEvents: "none",
      transition: "opacity 0.3s ease-in-out",
      [theme.breakpoints.down("lg")]: {
        display: "none",
      },
    },
    primaryImage: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 1,
      transition: "opacity 0.3s ease-in-out",
      display: "block",
    },
    addToCartBtn: {
      display: "flex",
      gap: "8px",
      position: "absolute",
      bottom: "8px",
      right: "8px",
      minWidth: "unset",
      opacity: 1,
      transition: "all 0.3s ease-in-out",
      backgroundColor: "#fff",
      color: "#000",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      padding: "6px",
      zIndex: 3,
      border: "none",
      boxSizing: "border-box",
      ...TYPOGRAPHY_STYLES["sm"].regular,
      "&:hover": {
        backgroundColor: "#f0f0f0",
      },
      [theme.breakpoints.down("lg")]: {
        zIndex: 5,
        left: "unset",
        right: "8px",
        width: "unset",
      },
      [theme.breakpoints.up("lg")]: {
        ...(isMobileTemplate
          ? { left: "unset", right: "8px", width: "unset" }
          : { left: "8px", right: "8px", width: "auto", justifyContent: "center" }),
        height: "auto",
        opacity: isMobileTemplate ? 1 : 0,
        pointerEvents: isMobileTemplate ? "auto" : "none",
        backgroundColor: "#fff",
        padding: "6px",
        borderRadius: isMobileTemplate ? undefined : 0,
        boxShadow: "none",
        ...(isMobileTemplate ? { zIndex: 5 } : {}),
      },
    },
    btnText: {
      display: "none",
      [theme.breakpoints.up("lg")]: {
        display: "inline",
      },
    },
    badgeTopLeft: {
      ...badgeBase,
      top: "8px",
      left: "8px",
      [theme.breakpoints.down("lg")]: {
        ...TYPOGRAPHY_STYLES["xs"].bold,
        top: "4px",
        left: "4px",
      },
    },
    badgeTopRight: {
      ...badgeBase,
      top: "8px",
      right: "8px",
      [theme.breakpoints.down("lg")]: {
        ...TYPOGRAPHY_STYLES["xs"].bold,
        top: "4px",
        right: "48px",
      },
    },
    badgeCenterLeft: {
      ...badgeBase,
      top: "50%",
      left: "8px",
      transform: "translateY(-50%)",
      [theme.breakpoints.down("lg")]: {
        ...TYPOGRAPHY_STYLES["xs"].bold,
        left: "4px",
      },
    },
    badgeCenterRight: {
      ...badgeBase,
      top: "50%",
      right: "8px",
      transform: "translateY(-50%)",
      [theme.breakpoints.down("lg")]: {
        ...TYPOGRAPHY_STYLES["xs"].bold,
        right: "4px",
      },
    },
    badgeBottomLeft: {
      ...badgeBase,
      bottom: "8px",
      left: "8px",
      [theme.breakpoints.down("lg")]: {
        ...TYPOGRAPHY_STYLES["xs"].bold,
        bottom: "4px",
        left: "4px",
      },
    },
    badgeBottomRight: {
      ...badgeBase,
      bottom: "8px",
      right: "8px",
      [theme.breakpoints.down("lg")]: {
        ...TYPOGRAPHY_STYLES["xs"].bold,
        bottom: "4px",
        right: "48px",
      },
    },
    badgeBottomFull: {
      ...badgeBase,
      bottom: "8px",
      left: "8px",
      right: "8px",
      width: "auto",
      minHeight: "36px",
      padding: "6px",
      borderRadius: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxSizing: "border-box",
      pointerEvents: "none",
      [theme.breakpoints.down("lg")]: {
        ...TYPOGRAPHY_STYLES["xs"].bold,
        right: "48px",
      },
    },
    badgeCornerImage: {
      display: "block",
      width: "auto",
      maxWidth: BADGE_CORNER_IMAGE_MAX_WIDTH_PX,
      maxHeight: BADGE_CORNER_IMAGE_MAX_HEIGHT_PX,
      objectFit: "contain",
      [theme.breakpoints.down("lg")]: {
        maxWidth: badgeSize(BADGE_CORNER_IMAGE_MAX_WIDTH_PX),
        maxHeight: badgeSize(BADGE_CORNER_IMAGE_MAX_HEIGHT_PX),
      },
    },
    badgePriceLine: {
      position: "absolute",
      right: 0,
      bottom: 0,
      zIndex: 1,
      ...TYPOGRAPHY_STYLES["sm"].bold,
      [theme.breakpoints.down("lg")]: {
        ...TYPOGRAPHY_STYLES["xs"].bold,
      },
    },
    statusLabelTag: {
      position: "absolute",
      top: "8px",
      left: "8px",
      padding: "2px 8px",
      borderRadius: "16px",
      border: "1px solid #DDD",
      backgroundColor: "#fff",
      zIndex: 2,
      ...TYPOGRAPHY_STYLES["sm"].regular,
    },
    favoriteIconWrapper: {
      position: "absolute",
      top: "8px",
      right: "8px",
      zIndex: 2,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      borderRadius: "50%",
      width: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "opacity 0.3s ease-in-out, background-color 0.2s",
      "&:hover": {
        backgroundColor: "#fff",
      },
      [theme.breakpoints.down("lg")]: {
        zIndex: 5,
      },
      [theme.breakpoints.up("lg")]: {
        opacity: isMobileTemplate ? 1 : 0,
        pointerEvents: isMobileTemplate ? "auto" : "none",
        ...(isMobileTemplate ? { zIndex: 5 } : {}),
      },
    },
    infoSection: {
      display: "flex",
      flexDirection: "column",
    },
    productName: {
      ...TYPOGRAPHY_STYLES["sm"].medium,
      textTransform: "uppercase",
      height: "36px",
      overflow: "hidden",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
    },
    priceColorBox: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      minHeight: "42px",
      [theme.breakpoints.down("md")]: {
        minHeight: "60px",
      },
    },
    priceRow: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      minHeight: "21px",
      flexWrap: "wrap",
      [theme.breakpoints.down("md")]: {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "2px",
        minHeight: "38px",
      },
    },
    currentPrice: {
      ...TYPOGRAPHY_STYLES["base"].bold,
    },
    salePrice: {
      ...TYPOGRAPHY_STYLES["xs"].regular,
      color: theme.palette.text.secondary,
      textDecoration: "line-through",
    },
    colorPalette: {
      display: "flex",
      gap: "4px",
      alignItems: "center",
      minHeight: "18px",
    },
    colorDotWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      cursor: "pointer",
    },
    colorDot: {
      width: "12px",
      height: "12px",
      aspectRatio: "1/1",
      borderRadius: "2px",
      overflow: "hidden",
      position: "relative",
    },
    colorDotLine: {
      width: "100%",
      height: "2px",
      marginTop: "4px",
      backgroundColor: "transparent",
      transition: "background-color 0.2s",
    },
    colorDotLineActive: {
      backgroundColor: "#737373",
    },
    colorCount: {
      color: "#000",
      ...TYPOGRAPHY_STYLES["sm"].regular,
    },
  };
});

export default useStyles;
