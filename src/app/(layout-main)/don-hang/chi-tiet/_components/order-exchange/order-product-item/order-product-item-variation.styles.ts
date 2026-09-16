import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_ITEM, PADDING_GAP_ITEM_SMALL } from "@/utils/constants/style.constant";

const useStyles = makeStyles({ name: "OrderProductItemVariation" })((theme) => ({
  root: {
    width: "100%",
  },
  body: {
    width: "100%",
    overflowY: "auto",
  },
  productWrapper: {
    gap: PADDING_GAP_ITEM,
  },
  topSection: {
    display: "grid",
    gridTemplateColumns: "122px 1fr",
    columnGap: 24,
    paddingBottom: 24,
    [theme.breakpoints.down(810)]: {
      gridTemplateColumns: "96px 1fr",
      columnGap: 16,
      paddingBottom: 16,
    },
  },
  thumb: {
    width: 122,
    height: 154,
    backgroundColor: "var(--product-image-background)",
    border: "1px solid #EEEEEE",
    [theme.breakpoints.down(810)]: {
      width: 96,
      height: 122,
    },
  },
  productInfo: {
    gap: PADDING_GAP_ITEM_SMALL,
    justifyContent: "center",
  },
  productName: {
    color: "#27251F",
    ...TYPOGRAPHY_STYLES.lg.bold,
    lineHeight: "150%",
    textTransform: "uppercase",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.md.bold,
    },
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  salePrice: {
    color: "#27251F",
    ...TYPOGRAPHY_STYLES.base.bold,
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.sm.bold,
    },
  },
  originalPrice: {
    color: "#C4C4C4",
    ...TYPOGRAPHY_STYLES.sm.regular,
    textDecoration: "line-through",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.xs.regular,
    },
  },
  footer: {
    marginTop: 24,
    display: "flex",
    width: "100%",
  },
  selectButton: {
    width: "100%",
    backgroundColor: "#0A0A0A",
    color: "#ffffff",
    padding: "16px 14px",
    textTransform: "uppercase",
    cursor: "pointer",
    borderRadius: 0,
    ...TYPOGRAPHY_STYLES.base.bold,
    "&:hover": {
      backgroundColor: "#333333",
    },
    "&:disabled": {
      backgroundColor: "#CCCCCC",
    },
    [theme.breakpoints.down(810)]: {
      padding: "12px 12px",
    },
  },
}));

export default useStyles;
