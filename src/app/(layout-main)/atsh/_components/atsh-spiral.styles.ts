import { makeStyles } from "tss-react/mui";

const useAtshSpiralStyles = makeStyles({ name: "AtshSpiral" })((theme) => ({
  section: {
    position: "relative",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    padding: 0,
  },
  inner: {
    position: "relative",
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    padding: 0,
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
  },
  pageFrame: {
    position: "relative",
    width: "100%",
    height: "100%",
    minHeight: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    isolation: "isolate",
    overflow: "hidden",
    [theme.breakpoints.up("lg")]: {
      width: "100%",
    },
  },
  stageScaleWrap: {
    position: "relative",
    flexShrink: 0,
    transformOrigin: "center center",
    overflow: "hidden",
  },
  /** Design-size box; scaled via stageScaleWrap to fill viewport */
  stage: {
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
  },
  gallery: {
    position: "absolute",
    inset: 0,
  },
  centerLogoWrap: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%) translateZ(0px)",
    transformStyle: "preserve-3d",
    pointerEvents: "none",
    width: 160,
    height: 128,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    [theme.breakpoints.up("md")]: {
      width: 240,
      height: 192,
    },
  },
  centerLogoImg: {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "contain",
  },
  ctaWrap: {
    position: "fixed",
    right: 24,
    bottom: 24,
    zIndex: 50,
    pointerEvents: "auto",
    [theme.breakpoints.down("md")]: {
      right: 16,
      bottom: 16,
    },
  },
  ctaButton: {
    borderRadius: 12,
    background: "transparent",
    color: "#FFF",
    fontFamily: "var(--font-hanken-grotesk), sans-serif",
    fontWeight: 700,
    textTransform: "none",
    padding: 0,
    minHeight: 0,
  },
}));

export default useAtshSpiralStyles;
