import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_ITEM, PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useStyles = makeStyles()((theme) => ({
  root: {
    display: "flex",
    gap: "12px",
    padding: PADDING_GAP_LAYOUT,
    backgroundColor: "#F8F8F8",
    borderRadius: "6px",
    width: "100%",
  },

  imageWrapper: {
    width: 62,
    height: 62,
    position: "relative",
    flexShrink: 0,
    backgroundColor: "var(--product-image-background)",
    border: "1px solid #DEDEDE",
    borderRadius: "5px",
    zIndex: 1,
    boxSizing: "border-box",
  },

  image: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "cover",
    borderRadius: "5px",
  },

  quantityBadge: {
    position: "absolute",
    top: "-10px",
    right: "-8px",
    backgroundColor: "#707070",
    color: "#FFFFFF",
    minWidth: "21px",
    height: "21px",
    width: "auto",
    boxSizing: "border-box",
    borderRadius: "4px",
    padding: "0 4px",
    ...TYPOGRAPHY_STYLES.sm.regular,
    lineHeight: "21px",
    whiteSpace: "nowrap",
    zIndex: 2,
  },

  infoWrapper: {
    flex: 1,
    flexDirection: "row",
    gap: PADDING_GAP_ITEM,
    overflow: "hidden",
    minWidth: 0,
  },

  nameDetailsCol: {
    flex: 1,
    gap: PADDING_GAP_ITEM,
    overflow: "hidden",
    minWidth: 0,
  },

  titleWrapper: {
    gap: PADDING_GAP_ITEM,
    minWidth: 0,
    width: "100%",
  },

  priceCol: {
    gap: "2px",
    flexShrink: 0,
  },

  title: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: "#27272A",
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  price: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: "#27272A",
    whiteSpace: "nowrap",
  },

  variantWrapper: {
    gap: "4px",
    minWidth: 0,
    width: "100%",
  },

  variantInfo: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#27272A",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  originalPrice: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#9DA3AE",
    textDecoration: "line-through",
  },

  giftTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "#C7F584",
    padding: "2px 4px",
    borderRadius: "13px",
    width: "fit-content",
    flexShrink: 0,
  },

  giftText: {
    ...TYPOGRAPHY_STYLES.xs.bold,
    color: "#050505",
    textTransform: "none",
    whiteSpace: "nowrap",
  },

  giftIcon: {
    color: "#050505",
    display: "flex",
    alignItems: "center",
  },
}));

export default useStyles;
