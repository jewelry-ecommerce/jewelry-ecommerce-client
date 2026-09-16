import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useStyles = makeStyles({ name: "ProductExpandableDescription" })((theme) => ({
  root: {
    display: "flex",
    padding: "24px 16px 16px 16px",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 8,
    alignSelf: "stretch",
    width: "100%",
    background: "#fff",
    [theme.breakpoints.down("sm")]: {
      padding: "16px 12px 12px 12px",
    },
  },
  title: {
    ...TYPOGRAPHY_STYLES["3xl"].bold,
    color: "#27251F",
    textTransform: "uppercase",
    [theme.breakpoints.down("sm")]: {
      ...TYPOGRAPHY_STYLES["2xl"].bold,
    },
  },
  descriptionCollapsed: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#000",
    lineHeight: "normal",
    width: "100%",
    margin: 0,
    whiteSpace: "normal",
    overflowWrap: "anywhere",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  descriptionExpanded: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#000",
    lineHeight: "normal",
    width: "100%",
    margin: 0,
    whiteSpace: "normal",
    overflowWrap: "anywhere",
  },
  toggleButton: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#000",
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
    textDecorationSkipInk: "none",
    textDecorationThickness: "auto",
    textUnderlineOffset: "auto",
    textUnderlinePosition: "from-font",
    textTransform: "uppercase",
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
  },
}));

export default useStyles;
