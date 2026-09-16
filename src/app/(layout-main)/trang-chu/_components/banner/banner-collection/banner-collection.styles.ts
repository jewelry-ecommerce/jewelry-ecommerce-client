import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { STYLE } from "@/utils/constants";
import { siteHeaderHeightCssVar } from "@/utils/constants/layout.constant";

const useStyles = makeStyles({ name: "BannerCollection" })((theme) => ({
  root: {
    width: "100%",
    aspectRatio: "1512 / 804",
    height: `calc(100svh - ${siteHeaderHeightCssVar()})`,
    boxSizing: "border-box",
    position: "relative",
    backgroundColor: "#000",
    [theme.breakpoints.down("lg")]: {
      aspectRatio: "810 / 880",
    },
    [theme.breakpoints.down("md")]: {
      aspectRatio: "420 / 620",
    },
  },
  slider: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    position: "relative",
  },
  slideContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  media: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  contentOverlay: {
    position: "absolute",
    bottom: "68px",
    left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center",
    color: "#fff",
    width: "90%",
    maxWidth: "100%",
    zIndex: 2,
  },
  title: {
    ...TYPOGRAPHY_STYLES["2xl"].bold,
    marginBottom: STYLE.PADDING_GAP_LAYOUT,
    textTransform: "uppercase",
  },
  subtitle: {
    ...TYPOGRAPHY_STYLES.md.regular,
    marginBottom: STYLE.PADDING_GAP_LAYOUT,
    maxWidth: "628px",
  },
  actions: {
    gap: STYLE.PADDING_GAP_LAYOUT,
    flexWrap: "wrap",
  },
  actionsStack: {
    flexDirection: "column",
    gap: STYLE.PADDING_GAP_ITEM,
    flexWrap: "wrap",
  },
  button: {
    ...TYPOGRAPHY_STYLES.md.bold,
    minWidth: "100px",
    height: "35px",
    padding: "6px 12px",
    borderRadius: "0",
    textTransform: "none",
    position: "relative",
    transition: `all ${STYLE.TRANSITION_TIME} ease`,
    whiteSpace: "nowrap",
  },
}));

export default useStyles;
