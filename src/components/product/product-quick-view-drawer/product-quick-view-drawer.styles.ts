import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useStyles = makeStyles({ name: "ProductQuickViewDrawer" })((theme) => ({
  drawerPaper: {
    width: 480,
    maxWidth: "100%",
    backgroundColor: theme.palette.common.white,
    [theme.breakpoints.down("md")]: {
      width: "100%",
      height: "100dvh",
      maxHeight: "100dvh",
    },
  },
  cartUpdateDrawerPaper: {
    width: 460,
  },
  root: {
    display: "flex",
    width: "480px",
    flexDirection: "column",
    alignItems: "center",
    flexShrink: 0,
    alignSelf: "stretch",
    height: "100%",
    maxWidth: "480px",
    [theme.breakpoints.down("md")]: {
      width: "100%",
      height: "100%",
      maxWidth: "100%",
      minHeight: 0,
    },
  },
  cartUpdateRoot: {
    width: "460px",
    maxWidth: "460px",
  },
  header: {
    padding: "16px 20px",
    width: "100%",
    flexShrink: 0,
  },
  title: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    color: "#27251f",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    [theme.breakpoints.down("md")]: {
      fontSize: 16,
      lineHeight: "140%",
    },
  },
  closeButton: {
    minWidth: 24,
    width: 24,
    height: 24,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#404040",
    ...TYPOGRAPHY_STYLES.base.regular,
    lineHeight: "24px",
    padding: 0,
  },
  body: {
    width: "100%",
    padding: "16px 20px",
    flex: "1 1 auto",
    minHeight: 0,
    overflowY: "auto",
    overscrollBehavior: "contain",
    [theme.breakpoints.down("md")]: {
      padding: "12px 14px",
    },
  },
  productWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  topSection: {
    display: "grid",
    alignItems: "center",
    gridTemplateColumns: "122px 1fr",
    columnGap: 12,
    paddingBottom: 24,
    [theme.breakpoints.down("md")]: {
      gridTemplateColumns: "96px 1fr",
      columnGap: 10,
      paddingBottom: 16,
    },
  },
  thumb: {
    display: "flex",
    width: 122,
    height: 154,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    aspectRatio: "61 / 77",
    objectFit: "cover",
    backgroundColor: "var(--product-image-background)",
    [theme.breakpoints.down("md")]: {
      width: 96,
      height: 122,
    },
  },
  productInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  productName: {
    color: "#27251F",
    ...TYPOGRAPHY_STYLES.lg.bold,
    lineHeight: "150%",
    textTransform: "uppercase",
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES.md.bold,
    },
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  salePrice: {
    color: "#27251F",
    ...TYPOGRAPHY_STYLES.base.regular,
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES.sm.regular,
    },
  },
  originalPrice: {
    color: "#C4C4C4",
    ...TYPOGRAPHY_STYLES.sm.regular,
    textDecoration: "line-through",
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES.xs.regular,
    },
  },
  stockTagInStock: {
    width: "fit-content",
    display: "flex",
    padding: "3px 4px",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    background: "rgba(1, 154, 1, 0.12)",
    color: "#019A01",
    ...TYPOGRAPHY_STYLES.sm.regular,
    textTransform: "uppercase",
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES.xs.regular,
    },
  },
  stockTagOutOfStock: {
    width: "fit-content",
    display: "flex",
    padding: "3px 4px",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    background: "rgba(240, 68, 56, 0.12)",
    color: "#F04438",
    ...TYPOGRAPHY_STYLES.sm.regular,
    textTransform: "uppercase",
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES.xs.regular,
    },
  },
  footer: {
    width: "100%",
    marginTop: 16,
    padding: "0 0 16px",
    display: "grid",
    gridTemplateColumns: "1fr 42px",
    gap: 8,
  },
  footerFullWidth: {
    gridTemplateColumns: "1fr",
  },
  contactInputWrapper: {
    width: "100%",
    marginTop: 4,
  },
  contactInput: {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: 0,
      "& fieldset": {
        borderColor: "#BFBFBF",
      },
      "&:hover fieldset": {
        borderColor: "#BFBFBF",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#BFBFBF",
      },
    },
    "& .MuiInputBase-input": {
      ...TYPOGRAPHY_STYLES.base.regular,
      padding: "14px 16px",
      [theme.breakpoints.down("md")]: {
        ...TYPOGRAPHY_STYLES.sm.regular,
        padding: "12px 14px",
      },
    },
  },
  addButton: {
    border: "none",
    backgroundColor: "#111111",
    color: "#ffffff",
    padding: "12px 14px",
    cursor: "pointer",
    ...TYPOGRAPHY_STYLES.base.bold,
    [theme.breakpoints.down("md")]: {
      fontSize: 12,
      padding: "10px 12px",
    },
  },
  likeButton: {
    border: "1px solid #000",
    borderRadius: 2,
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  labelBold: {
    ...TYPOGRAPHY_STYLES.md.bold,
    textTransform: "uppercase",
    [theme.breakpoints.down("sm")]: {
      fontSize: 12,
    },
  },
}));

export default useStyles;
