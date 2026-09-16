import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useStyles = makeStyles({ name: "CartUpdateItemPopup" })((theme) => ({
  dialogPaper: {
    width: "100%",
    maxWidth: "500px",
    borderRadius: "0px",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  drawerPaper: {
    maxHeight: "90vh",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  root: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  header: {
    padding: "16px 20px",
  },
  title: {
    ...TYPOGRAPHY_STYLES["xl"].bold,
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    padding: "16px 20px 24px",
  },
  topSection: {
    display: "flex",
    gap: PADDING_GAP_LAYOUT,
    alignItems: "center",
  },
  thumb: {
    width: "122px",
    height: "154px",
    objectFit: "cover",
    backgroundColor: "var(--product-image-background)",
  },
  productInfo: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: "8px",
  },
  productName: {
    ...TYPOGRAPHY_STYLES["md"].bold,
    textTransform: "uppercase",
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  salePrice: {
    ...TYPOGRAPHY_STYLES["base"].regular,
    color: theme.palette.text.primary,
  },
  originalPrice: {
    ...TYPOGRAPHY_STYLES["xs"].regular,
    color: "#C4C4C4",
    textDecoration: "line-through",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sectionLabel: {
    ...TYPOGRAPHY_STYLES["base"].regular,
    textTransform: "uppercase",
  },
  labelBold: {
    ...TYPOGRAPHY_STYLES["base"].bold,
    textTransform: "uppercase",
  },
  swatches: {
    display: "flex",
    gap: 8,
    paddingBottom: 8,
    marginTop: 8,
  },
  swatchButton: {
    position: "relative",
    width: 24,
    minWidth: 24,
    height: 24,
    border: "1px solid #cccccc",
    padding: 0,
    cursor: "pointer",
    background: "transparent",
    borderRadius: 0,
    "&:hover": {
      background: "transparent",
    },
  },
  swatchActive: {
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: -8,
      height: 1,
      backgroundColor: "#27251F",
    },
  },
  swatchDisabled: {
    opacity: 0.6,
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(to bottom left, transparent calc(50% - 1px), #27251F, transparent calc(50% + 1px))",
      pointerEvents: "none",
    },
  },
  swatchImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  sizes: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
  },
  sizeButton: {
    position: "relative",
    minWidth: 22,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: theme.palette.text.primary,
    ...TYPOGRAPHY_STYLES.base.regular,
    padding: 0,
    borderRadius: 0,
    [theme.breakpoints.down("md")]: {
      fontSize: 12,
      minWidth: 20,
    },
    "&:hover": {
      background: "transparent",
    },
  },
  sizeActive: {
    color: "#111111",
    ...TYPOGRAPHY_STYLES.base.bold,
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: -2,
      height: 1,
      backgroundColor: "grey",
    },
  },
  sizeDisabled: {
    color: "#27251F",
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(to bottom left, transparent calc(50% - 1px), #27251F, transparent calc(50% + 1px))",
      pointerEvents: "none",
    },
  },
  guideLink: {
    ...TYPOGRAPHY_STYLES["base"].regular,
    textDecoration: "underline",
    textTransform: "uppercase",
    cursor: "pointer",
    color: theme.palette.text.secondary,
  },
  footer: {
    marginTop: theme.spacing(1),
  },
  updateButton: {
    "&&": {
      backgroundColor: "#0A0A0A",
      color: "#fff",
      borderRadius: "0px",
      padding: "12px 16px",
      ...TYPOGRAPHY_STYLES["md"].bold,
      textTransform: "none",
      "&:hover": {
        backgroundColor: "#000",
      },
    },
  },
}));

export default useStyles;
