import { PADDING_GAP_ITEM, PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  root: {
    display: "flex",
    gap: PADDING_GAP_LAYOUT,
    padding: "24px 0",
    alignItems: "flex-start",
    width: "100%",
    borderBottom: "1px solid #EEEEEE",
    [theme.breakpoints.down(810)]: {
      gap: "12px",
      padding: "16px 0",
    },
  },
  checkboxWrapper: {
    paddingTop: "4px",
    flexShrink: 0,
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
  mainContent: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    gap: PADDING_GAP_LAYOUT,
    minWidth: 0,
    [theme.breakpoints.down(810)]: {
      flexDirection: "column",
      alignItems: "stretch",
      gap: "12px",
    },
  },
  infoWrapper: {
    gap: "8px",
    [theme.breakpoints.down(810)]: {
      gap: "4px",
      alignSelf: "stretch",
      width: "100%",
      minWidth: 0,
    },
    flex: 1,
  },
  productName: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#27251F",
    lineHeight: "1.4",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.base.bold,
    },
  },
  variantWrapper: {
    gap: "4px",
    [theme.breakpoints.down(810)]: {
      gap: "2px",
    },
  },
  variantInfo: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#71717A",
  },
  originalQuantity: {
    ...TYPOGRAPHY_STYLES.sm.medium,
    color: "#27251F",
  },
  rightActions: {
    display: "flex",
    alignItems: "flex-start",
    gap: "40px",
    [theme.breakpoints.down(810)]: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
    },
  },
  priceWrapper: {
    textAlign: "right",
    minWidth: "120px",
    [theme.breakpoints.down(810)]: {
      textAlign: "left",
      minWidth: "unset",
    },
  },
  salePrice: {
    ...TYPOGRAPHY_STYLES.lg.bold,
    color: "#27251F",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.base.bold,
    },
  },
  originalPrice: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#A1A1AA",
    textDecoration: "line-through",
    marginTop: "2px",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.xs.regular,
    },
  },
}));

export default useStyles;
