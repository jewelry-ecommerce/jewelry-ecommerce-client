import { PADDING_GAP_ITEM, PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  root: {
    gap: PADDING_GAP_LAYOUT,
    padding: "24px 0",
    width: "100%",
    borderBottom: "1px solid #EEEEEE",
    [theme.breakpoints.down(810)]: {
      gap: "12px",
      padding: "16px 0",
    },
    "&:last-child": {
      borderBottom: "none",
    },
  },
  imageWrapper: {
    width: "100px",
    height: "100px",
    flexShrink: 0,
    backgroundColor: "var(--product-image-background)",
    borderRadius: "4px",
    overflow: "hidden",
    border: "1px solid #F0F0F0",
    [theme.breakpoints.down(810)]: {
      width: "80px",
      height: "80px",
    },
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: PADDING_GAP_ITEM,
  },
  productName: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#27251F",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.base.bold,
    },
  },
  priceWrapper: {
    gap: PADDING_GAP_LAYOUT,
    flexWrap: "wrap",
  },
  salePrice: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#27251F",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.base.bold,
    },
  },
  originalPrice: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#A1A1AA",
    textDecoration: "line-through",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.xs.regular,
    },
  },
  selectButton: {
    backgroundColor: "#F5F5F5",
    color: "#27251F",
    padding: "6px 16px",
    borderRadius: "4px",
    ...TYPOGRAPHY_STYLES.sm.bold,
    cursor: "pointer",
    border: "none !important",
    minWidth: "70px !important",
    transition: "none",
    "&:hover": {
      backgroundColor: "#F5F5F5 !important",
      boxShadow: "none !important",
    },
    "&:active": {
      backgroundColor: "#F5F5F5 !important",
    },
    "&:disabled": {
      backgroundColor: "#FAFAFA",
      color: "#A1A1AA",
    },
  },
}));

export default useStyles;
