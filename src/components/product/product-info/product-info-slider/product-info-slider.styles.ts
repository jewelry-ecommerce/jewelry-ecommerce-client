import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";
import { makeStyles } from "tss-react/mui";

interface StyleProps {
  itemsToShow?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  width?: number | string;
  height?: number | string;
  isDesktop?: boolean;
}

const useStyles = makeStyles<{ props: StyleProps }>({ name: "ProductInfoSlider" })((theme, { props }) => {
  const { itemsToShow, width, height, isDesktop } = props;

  const show = {
    xs: itemsToShow?.xs ?? 1,
    sm: itemsToShow?.sm ?? 2,
    lg: itemsToShow?.lg ?? 3,
  };

  return {
    root: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      width: width || "100%",
      height: height || "auto",
      "&:hover": {
        "& .nav-button": {
          opacity: 1,
        },
        "& .nav-button-disabled": {
          opacity: 0.3,
        },
      },
    },
    carouselWrapper: {
      position: "relative",
      width: "100%",
      overflow: "hidden",
      borderLeft: "1px solid #E0E0E0",
    },
    viewport: {
      overflow: "hidden",
      width: "100%",
    },
    container: {
      display: "flex",
      backfaceVisibility: "hidden",
      touchAction: "pan-y",
      flexWrap: isDesktop ? "wrap" : "nowrap",
    },
    slideItem: {
      flex: `0 0 calc(100% / ${show.xs})`,
      minWidth: 0,
      borderRight: "1px solid #E0E0E0",
      borderTop: "1px solid #E0E0E0",
      borderBottom: "1px solid #E0E0E0",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      [theme.breakpoints.up("sm")]: {
        flex: `0 0 calc(100% / ${show.sm})`,
      },
      [theme.breakpoints.up("lg")]: {
        flex: `0 0 calc(100% / ${show.lg})`,
      },
    },
    navButton: {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 10,
      backgroundColor: "rgba(51, 51, 51, 0.56)",
      backdropFilter: "blur(4px)",
      borderRadius: "50%",
      padding: "4px",
      width: "40px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      transition: "opacity 0.2s, transform 0.2s, background-color 0.2s",
      opacity: 0,
      [theme.breakpoints.down("lg")]: {
        opacity: 1,
      },
      [theme.breakpoints.down("md")]: {
        width: "28px",
        height: "28px",
      },
      "&:hover": {
        backgroundColor: "rgba(51, 51, 51, 0.8)",
        transform: "translateY(-50%) scale(1.05)",
      },
    },
    disabled: {
      opacity: 0.3,
      cursor: "default",
      "&:hover": {
        backgroundColor: "rgba(51, 51, 51, 0.56)",
        transform: "translateY(-50%)",
      },
    },
    prevButton: {
      left: "16px",
    },
    firstSlide: {},
    nextButton: {
      right: "16px",
    },
  };
});

export default useStyles;
