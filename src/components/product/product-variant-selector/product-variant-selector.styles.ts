import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useStyles = makeStyles({ name: "ProductVariantSelector" })((theme) => ({
  section: {
    paddingBottom: 6,
  },
  sectionLabel: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#5a5a5a",
  },
  guideLink: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#404040",
    [theme.breakpoints.down("md")]: {
      fontSize: 10,
    },
  },
  swatches: {
    display: "flex",
    gap: 8,
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
  swatchDisabled: {
    opacity: 0.6,
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(to bottom left, transparent calc(50% - 1px), #27251F, transparent calc(50% + 1px))",
      pointerEvents: "none",
      zIndex: 1,
    },
  },
  swatchActive: {
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: -8,
      height: 2,
      backgroundColor: "#111111",
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
  sizeDisabled: {
    color: "#27251F",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(to bottom left, transparent calc(50% - 1px), #27251F, transparent calc(50% + 1px))",
      pointerEvents: "none",
      zIndex: 1,
    },
  },
  sizeButton: {
    position: "relative",
    height: 24,
    minHeight: 24,
    minWidth: "min-content",
    width: "auto",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: theme.palette.text.primary,
    ...TYPOGRAPHY_STYLES.base.regular,
    padding: "0 6px",
    borderRadius: 0,
    [theme.breakpoints.down("md")]: {
      fontSize: 12,
      minWidth: "min-content",
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
      bottom: -8,
      height: 2,
      backgroundColor: "#111111",
    },
  },
  labelBold: {
    ...TYPOGRAPHY_STYLES.base.bold,
  },
}));

export default useStyles;
