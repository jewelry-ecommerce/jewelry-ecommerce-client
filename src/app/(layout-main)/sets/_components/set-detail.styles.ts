// set term
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles({ name: "SetDetail" })((theme) => ({
  label: {
    width: "fit-content",
    padding: "3px 8px",
    color: "#FFFFFF",
    background: "#171717",
    borderRadius: 999,
    ...TYPOGRAPHY_STYLES.xs.medium,
  },
  name: { textTransform: "uppercase", ...TYPOGRAPHY_STYLES.xl.bold },
  sku: { color: "#737373", ...TYPOGRAPHY_STYLES.sm.regular },
  priceRow: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 },
  price: { ...TYPOGRAPHY_STYLES.xl.bold },
  comparePrice: { color: "#AFAFAF", textDecoration: "line-through", ...TYPOGRAPHY_STYLES.sm.regular },
  discount: { padding: "3px 6px", color: "#FFFFFF", background: "#F04438", ...TYPOGRAPHY_STYLES.xs.bold },
  popupRoot: {
    display: "flex",
    width: "100%",
    height: "100%",
    minHeight: 0,
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
  },
  popupDialogPaper: {
    width: 500,
    maxWidth: "calc(100% - 32px)",
    height: "min(90dvh, 760px)",
    borderRadius: 0,
    overflow: "hidden",
  },
  popupBody: { display: "flex", flex: "1 1 auto", minHeight: 0, flexDirection: "column", overflow: "hidden" },
  popupProductWrapper: { flex: "1 1 auto", minHeight: 0, overflow: "hidden" },
  popupTopSection: { flexShrink: 0 },
  popupProducts: {
    flex: "1 1 auto",
    minHeight: 0,
    overflowY: "auto",
    overscrollBehavior: "contain",
    msOverflowStyle: "none",
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": { display: "none" },
    "& > :last-child": { borderBottom: "none", "&::after": { display: "none" } },
  },
  popupFooter: { flexShrink: 0 },
  disabledButton: {
    "&:disabled, &.Mui-disabled": {
      color: theme.palette.text.disabled,
      backgroundColor: theme.palette.action.disabledBackground,
      cursor: "not-allowed",
    },
  },
  products: {
    display: "flex",
    flexDirection: "column",
    "& > :last-child": { borderBottom: "none", "&::after": { display: "none" } },
  },
  product: { display: "flex", gap: 12, padding: "16px 0", borderBottom: "1px solid #E5E5E5" },
  keyProduct: {
    position: "relative",
    flexWrap: "wrap",
    marginBottom: 16,
    padding: 12,
    border: "var(--set-key-product-border)",
    borderRadius: "var(--set-key-product-border-radius)",
    background: "var(--set-key-product-background)",
    boxShadow: "var(--set-key-product-box-shadow)",
    // set term - preserve the list divider below the bordered key product.
    "&::after": {
      content: '""',
      position: "absolute",
      right: 0,
      bottom: -17,
      left: 0,
      borderBottom: "1px solid #E5E5E5",
    },
  },
  keyProductHeader: { width: "100%" },
  keyProductLogo: { height: "17.967px", width: "auto", flexShrink: 0, alignSelf: "stretch", aspectRatio: "60 / 49" },
  keyProductTitle: {
    color: "var(--Neutral-950, #0A0A0A)",
    textTransform: "uppercase",
    ...TYPOGRAPHY_STYLES.sm.bold,
  },
  productImage: { position: "relative", width: 80, height: 102, flexShrink: 0, background: "var(--product-image-background)" },
  productBody: { display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 },
  productName: { color: "#171717", textTransform: "uppercase", ...TYPOGRAPHY_STYLES.sm.bold },
  productMeta: { color: "#737373", ...TYPOGRAPHY_STYLES.xs.regular },
}));

export default useStyles;
