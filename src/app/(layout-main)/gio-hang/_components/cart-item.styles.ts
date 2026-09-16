import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

export const cartItemLineItemImage = {
  desktop: { width: 110, height: 130 },
  mobile: { width: 96, height: 113.45 },
} as const;

export const cartItemGiftImage = {
  width: 68,
  height: 88,
} as const;

const useStyles = makeStyles({ name: "CartItemComponent" })((theme) => ({
  root: {
    "--cart-product-image-width": "110px",
    "--cart-product-image-height": "130px",
    width: "100%",
    padding: "40px 0",
    [theme.breakpoints.down("md")]: {
      "--cart-product-image-width": "96px",
      "--cart-product-image-height": "113.45px",
    },
    display: "flex",
    flexDirection: "column",
    gap: 16,
    [theme.breakpoints.down("md")]: {
      padding: "16px 0",
    },
  },
  outOfStockRoot: {
    opacity: 0.56,
  },
  mainRow: {
    width: "100%",
    display: "grid",
    // Desktop: tên sản phẩm lấy phần còn lại; SL / Tổng chỉ rộng vừa nội dung (tránh khoảng trống “ảo”).
    gridTemplateColumns: "minmax(0, 1fr) 160px 180px",
    gap: 16,
    alignItems: "center",
    [theme.breakpoints.down("md")]: {
      display: "flex",
      gap: 8,
    },
  },
  StackRowAlignCenter: {
    width: "fit-content",
    gap: 16,
    [theme.breakpoints.down("md")]: {
      gap: 8,
      width: "100%",
    },
  },
  productCol: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    minWidth: 0,
    [theme.breakpoints.down("md")]: {
      width: "100%",
      gap: 8,
    },
  },
  // Mobile: flex; desktop: grid ảnh | info để cột chữ chiếm phần trống còn lại.
  productTopRow: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    minWidth: 0,
    gap: 8,
    alignItems: "stretch",
    [theme.breakpoints.up("md")]: {
      display: "grid",
      gridTemplateColumns: "110px minmax(0, 1fr)",
      gap: 16,
      alignItems: "start",
    },
  },
  imageWrap: {
    position: "relative",
    width: 110,
    height: 130,
    flexShrink: 0,
    alignSelf: "flex-start",
    backgroundColor: "var(--product-image-background)",
    overflow: "hidden",
    [theme.breakpoints.down("md")]: {
      width: 96,
      height: 113.45,
    },
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  productImageLink: {
    position: "relative",
    display: "block",
    width: "100%",
    height: "100%",
    color: "inherit",
    textDecoration: "none",
  },
  infoCol: {
    // flex:1 + minWidth:0: chiếm phần còn lại; tránh co về 0 vì name có overflow:hidden.
    flex: "1 1 0%",
    minWidth: 0,
    width: "auto",
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 4,
    height: "100%",
    [theme.breakpoints.up("md")]: {
      width: "100%",
    },
  },
  name: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: theme.palette.text.primary,
    lineHeight: "150%",
    marginBottom: 0,
    // Mobile: giữ ellipsis như trước (không đổi UX mobile).
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "50vw",
    [theme.breakpoints.down(550)]: {
      width: "250px",
      maxWidth: "250px",
    },
    [theme.breakpoints.down(500)]: {
      width: "169px",
      maxWidth: "169px",
    },
    // Desktop-only: 1 dòng + ellipsis, dùng hết chiều rộng cột sản phẩm.
    [theme.breakpoints.up("md")]: {
      display: "block",
      width: "100%",
      maxWidth: "none",
      minWidth: 0,
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
  },
  productNameLink: {
    display: "block",
    color: "inherit",
    textDecoration: "none",
    maxWidth: "100%",
    minWidth: 0,
    [theme.breakpoints.up("md")]: {
      width: "100%",
    },
  },
  detailLine: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: theme.palette.text.secondary,
    lineHeight: "140%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    [theme.breakpoints.down("md")]: {
      fontSize: 12,
      marginBottom: 4,
      lineHeight: "150%",
      maxWidth: 193,
    },
  },
  sizeLine: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: theme.palette.text.primary,
    whiteSpace: "nowrap",
  },
  actionRow: {
    marginTop: 4,
    display: "flex",
    alignItems: "center",
    gap: 6,
    ...TYPOGRAPHY_STYLES.sm.regular,
    [theme.breakpoints.down("md")]: {
      marginTop: 0,
    },
  },
  mobileFooterRow: {
    display: "none",
    [theme.breakpoints.down("md")]: {
      display: "flex",
      width: "100%",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
  },
  mobileFooterStatusSlot: {
    width: "var(--cart-product-image-width)",
    [theme.breakpoints.down("md")]: {
      maxWidth: 96,
    },
    flexShrink: 0,
    display: "flex",
    alignItems: "stretch",
    minWidth: 0,
    overflow: "hidden",
  },
  mobileStatusTag: {
    width: "100%",
    boxSizing: "border-box",
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  mobileFooterActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  actionButton: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: theme.palette.grey[500],
    textDecoration: "underline",
    cursor: "pointer",
    background: "none",
    border: 0,
    padding: 0,
    fontFamily: "inherit",
    transition: "color 0.2s",
    "&:hover": {
      color: theme.palette.primary.dark,
    },
  },
  actionDivider: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: theme.palette.text.disabled,
    userSelect: "none",
  },
  quantityCol: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    alignItems: "center",
    justifySelf: "center",
    width: "100%",
    [theme.breakpoints.down("md")]: {
      gridColumn: "2 / 3",
      width: "100%",
      alignItems: "flex-end",
      marginTop: 10,
    },
  },
  quantityControl: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 112,
    [theme.breakpoints.down("md")]: {
      justifyContent: "flex-end",
      minWidth: 0,
    },
  },
  quantityButton: {
    width: 32,
    height: 32,
    padding: 8,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
    color: theme.palette.text.primary,
    fontSize: 16,
    background: theme.palette.background.paper,
    "&:disabled": {
      color: theme.palette.text.disabled,
      borderColor: theme.palette.action.disabledBackground,
      background: theme.palette.action.disabled,
    },
    [theme.breakpoints.down("md")]: {
      width: 24,
      height: 24,
      padding: 4,
    },
  },
  quantityText: {
    ...TYPOGRAPHY_STYLES.base.bold,

    textAlign: "center",
    color: theme.palette.text.primary,
    border: "none",
    [theme.breakpoints.down("md")]: {
      minWidth: 27,
    },
  },
  quantityInput: {
    textAlign: "center",
    border: "0 !important",
    outline: "none !important",
    background: "transparent !important",
    color: theme.palette.text.primary,
    width: 50,
    "&:hover": {
      background: "transparent !important",
    },
    "&:focus-within": {
      background: "transparent !important",
    },
    "& input": {
      textAlign: "center",
      border: "none",
      outline: "none",
      background: "transparent",
      WebkitAppearance: "none",
      MozAppearance: "textfield",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
    "& .MuiInputBase-input": {
      border: "none",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      border: "none !important",
      boxShadow: "none",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "none" },
      "&:hover fieldset": { borderColor: "none" },
      "&.Mui-focused fieldset": { borderColor: "none", borderWidth: "2px" },
      "&.Mui-focused": {
        boxShadow: "none",
      },
    },
  },
  helperText: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#d32f2f",
    textAlign: "center",
    paddingTop: 8,
    [theme.breakpoints.down("md")]: {
      textAlign: "left",
      paddingTop: 4,
    },
  },
  totalCol: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 16,
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  priceCol: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    [theme.breakpoints.down("md")]: {
      gridColumn: "2 / 3",
      marginTop: 2,
      alignItems: "flex-start",
      minWidth: 0,
    },
  },
  currentPrice: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: theme.palette.text.primary,
    lineHeight: "150%",
    whiteSpace: "nowrap",
    [theme.breakpoints.down("md")]: {
      fontSize: 14,
    },
  },
  originalPriceRow: {
    marginTop: 2,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  originalPrice: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#C4C4C4",
    textDecoration: "line-through",
    whiteSpace: "nowrap",
    [theme.breakpoints.down("md")]: {
      fontSize: 10,
      lineHeight: "normal",
    },
  },
  removeButton: {
    padding: 4,
    flexShrink: 0,
    [theme.breakpoints.down("md")]: {
      marginTop: 0,
    },
    "&:hover": {
      color: theme.palette.error.dark,
    },
  },
  attachedStack: {
    width: "fit-content",
    height: "100%",
    minWidth: 0,
    gap: 16,
    alignItems: "stretch",
    [theme.breakpoints.down("md")]: {
      width: "100%",
      gap: 8,
    },
    [theme.breakpoints.up("md")]: {
      width: "100%",
    },
  },
  attachedImageSlot: {
    position: "relative",
    width: 68,
    flexShrink: 0,
    alignSelf: "flex-start",
  },
  attachedGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  attachedRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 4fr) minmax(0, 3fr) minmax(0, 3fr)",
    gap: 16,
    alignItems: "stretch",
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: "minmax(0, 1fr) 160px 180px",
    },
    [theme.breakpoints.down("md")]: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 10,
    },
  },
  attachedImageBox: {
    position: "relative",
    width: 68,
    height: 88,
    overflow: "hidden",
    backgroundColor: "var(--product-image-background)",
  },
  attachedImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  attachedInfoCol: {
    width: 193,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
    [theme.breakpoints.up("md")]: {
      width: "100%",
      minWidth: 0,
    },
  },
  attachedBadge: {
    ...TYPOGRAPHY_STYLES.xs.bold,
    width: "fit-content",
    padding: "2px 6px",
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
    lineHeight: "normal",
    letterSpacing: "0.15px",
  },
  attachedBadgeText: {
    ...TYPOGRAPHY_STYLES.xs.bold,
    color: theme.palette.common.white,
    lineHeight: "normal",
  },
  attachedName: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    color: theme.palette.text.primary,
    lineHeight: "140%",
    marginBottom: 0,
    [theme.breakpoints.down("md")]: {
      marginBottom: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      width: "100%",
    },
  },
  attachedSubInfo: {
    ...TYPOGRAPHY_STYLES.xs.regular,
    color: theme.palette.text.secondary,
    lineHeight: "140%",
  },
  attachedSizeLine: {
    ...TYPOGRAPHY_STYLES.xs.regular,
    color: theme.palette.text.secondary,
    lineHeight: "140%",
  },
  attachedActionButton: {
    marginTop: 4,
    ...TYPOGRAPHY_STYLES.sm.bold,
    color: theme.palette.primary.main,
    textDecoration: "underline",
    background: "none",
    border: 0,
    padding: 0,
    width: "fit-content",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "color 0.2s",
    "&:hover": {
      color: theme.palette.primary.dark,
    },
  },
  attachedQtyCol: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    [theme.breakpoints.down("md")]: {
      justifyContent: "flex-start",
      alignSelf: "flex-start",
    },
  },
  attachedQuantity: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    color: theme.palette.text.primary,
    textAlign: "center",
  },
  attachedPriceCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    alignSelf: "center",
    minWidth: 0,
    paddingRight: 36,
    [theme.breakpoints.down("md")]: {
      paddingRight: 0,
      alignItems: "flex-start",
    },
  },
  attachedCurrentPrice: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    color: theme.palette.text.primary,
    lineHeight: "140%",
    whiteSpace: "nowrap",
  },
  attachedOriginalPrice: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#C4C4C4",
    textDecoration: "line-through",
    whiteSpace: "nowrap",
    lineHeight: "normal",
  },
  packagingOptionRow: {
    marginLeft: 42,
    paddingTop: 4,
    gap: 12,
    alignItems: "center",
    [theme.breakpoints.down("md")]: {
      marginLeft: 12,
      alignItems: "flex-start",
    },
  },
  packagingOptionInfo: {
    width: 282,
    [theme.breakpoints.down("md")]: {
      width: "100%",
      alignItems: "flex-start",
    },
  },
  packagingCheckbox: {
    padding: 0,
  },
  packagingOptionContent: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  packagingOptionName: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: theme.palette.text.primary,
    lineHeight: "140%",
  },
  packagingOptionMeta: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: theme.palette.text.secondary,
    lineHeight: "140%",
  },
  packagingOptionPrice: {
    minWidth: 164,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    paddingRight: 40,
    [theme.breakpoints.down("md")]: {
      alignItems: "flex-start",
      minWidth: 0,
    },
  },
}));

export default useStyles;
