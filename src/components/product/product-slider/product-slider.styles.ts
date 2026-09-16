import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles({ name: "ProductSlider" })((theme) => ({
  root: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  carouselWrapper: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    "&:hover": {
      "& .nav-button": {
        opacity: 1,
      },
      "& .nav-button-disabled": {
        opacity: 0.3,
      },
    },
  },
  viewport: {
    overflow: "hidden",
    width: "100%",
    willChange: "transform",
  },
  viewportNudgeStart: {
    animation: "$viewportNudgeStart 0.35s ease-out",
  },
  viewportNudgeEnd: {
    animation: "$viewportNudgeEnd 0.35s ease-out",
  },
  "@keyframes viewportNudgeStart": {
    "0%, 100%": { transform: "translateX(0)" },
    "35%": { transform: "translateX(14px)" },
  },
  "@keyframes viewportNudgeEnd": {
    "0%, 100%": { transform: "translateX(0)" },
    "35%": { transform: "translateX(-14px)" },
  },
  container: {
    display: "flex",
    alignItems: "stretch",
    backfaceVisibility: "hidden",
    touchAction: "pan-y",
  },
  slideItem: {
    display: "flex",
    flexDirection: "column",
    flex: "0 0 50%", // Mobile/Tablet: 2
    minWidth: 0,
    boxSizing: "border-box",
    [theme.breakpoints.up("lg")]: {
      flex: "0 0 25%", // PC: 4
    },
  },
  slideItemTwoColumns: {
    [theme.breakpoints.up("lg")]: {
      flex: "0 0 50%", // Always 2 columns
    },
  },
  slideItemThreeColumns: {
    [theme.breakpoints.between("md", "lg")]: {
      flex: "0 0 50%",
    },
    [theme.breakpoints.up("lg")]: {
      flex: "0 0 33.333%",
    },
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10,
    backgroundColor: "rgba(51, 51, 51, 0.56)",
    borderRadius: "44px",
    padding: "4px",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.2s, transform 0.2s, background-color 0.2s",
    [theme.breakpoints.down("lg")]: {
      opacity: 1,
    },
    [theme.breakpoints.down("md")]: {
      width: "28px",
      height: "28px",
    },
    "&:hover": {
      backgroundColor: "rgba(51, 51, 51, 0.8)",
      transform: "translateY(-50%) scale(1.1)",
    },
  },
  disabled: {
    cursor: "default",
    [theme.breakpoints.up("lg")]: {
      opacity: 0,
    },
    [theme.breakpoints.down("lg")]: {
      opacity: 0.3,
    },
    "&:hover": {
      backgroundColor: "rgba(51, 51, 51, 0.56)",
      transform: "translateY(-50%)",
    },
  },
  prevButton: {
    left: "16px",
  },
  nextButton: {
    right: "16px",
  },
}));

export default useStyles;
