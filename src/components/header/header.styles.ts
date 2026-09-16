import { makeStyles } from "tss-react/mui";
import { keyframes } from "@emotion/react";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const marqueeAnimation = keyframes({
  "0%": { transform: "translateX(0)" },
  "100%": { transform: "translateX(-100%)" },
});

const fadeAnimation = keyframes({
  "0%, 100%": { opacity: 0 },
  "10%, 90%": { opacity: 1 },
});

interface StyleProps {
  bg?: string;
  color?: string;
  speed?: number;
}

const useStyles = makeStyles<{ props?: StyleProps }>({ name: "Header" })((theme, params) => {
  const props = params?.props || {};
  return {
    root: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      width: "100%",
      backgroundColor: "#FFFFFF",
      boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.05)",
    },
    topBanner: {
      backgroundColor: props.bg || "#C7F584",
      color: props.color || "#000000",
      height: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
    },
    bannerItemMarquee: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: "calc(100% - 40px)",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      "& > *": {
        display: "inline-block",
        whiteSpace: "nowrap",
        paddingLeft: "100%",
        animation: `${marqueeAnimation} ${props.speed || 10}s linear infinite`,
      },
    },
    bannerItemStatic: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    bannerItemFade: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      animation: `${fadeAnimation} ${props.speed || 15}s ease-in-out infinite`,
    },
    dealsBadge: {
      borderRadius: "12px",
      height: "25px",
      padding: "2px 8px",
      ...TYPOGRAPHY_STYLES.sm.bold,
    },
    closeButton: {
      position: "absolute",
      right: 10,
      top: 10,
      cursor: "pointer",
      zIndex: 1,
    },
    headerMain: {
      height: 64,
      position: "relative",
    },
    headerRight: {
      gap: "16px",
      [theme.breakpoints.down(811)]: {
        gap: "8px",
      },
    },
    menuItem: {
      ...TYPOGRAPHY_STYLES.base.regular,
      color: "#27251F",
      cursor: "pointer",
      position: "relative",
      transition: "color 0.2s ease",
      textTransform: "uppercase",
      padding: "20px 0",
      "&::after": {
        content: '""',
        position: "absolute",
        left: 0,
        bottom: 12,
        width: "100%",
        height: "2px",
        backgroundColor: "#27251F",
        display: "none",
      },
      "&:hover": {
        color: "#27251F",
        "&::after": {
          display: "block",
        },
      },
    },
    menuItemActive: {
      color: "#27251F",
      "&::after": {
        display: "block",
      },
    },
    megaMenu: {
      position: "absolute",
      top: "100%",
      left: 0,
      width: "100%",
      backgroundColor: "#FFFFFF",
      padding: "40px 0",
      boxShadow: "0px 10px 15px -3px rgba(0, 0, 0, 0.1)",
      zIndex: 99,
    },
    megaMenuContainer: {
      display: "flex",
      gap: "100px",
      paddingLeft: "calc(32px + 100px + 20px)",
      [theme.breakpoints.down("lg")]: {
        paddingLeft: "24px",
      },
    },
    megaMenuColumn: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      minWidth: "150px",
    },
    megaMenuTitle: {
      ...TYPOGRAPHY_STYLES.base.bold,
      color: "#27251F",
      textTransform: "uppercase",
    },
    megaMenuItemContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    megaMenuItem: {
      ...TYPOGRAPHY_STYLES.base.regular,
      color: "#27251F",
      cursor: "pointer",
      "&:hover": {
        textDecoration: "underline",
      },
    },
    megaMenuImage: {
      width: 400,
      height: 250,
      backgroundColor: "#F3F4F6",
      flexShrink: 0,
    },
    verticalDivider: {
      width: "1px",
      height: "22px",
      backgroundColor: "#C7C7C7",
      margin: "0 8px",
    },
    actionIcons: {
      gap: PADDING_GAP_LAYOUT,
      [theme.breakpoints.down(320)]: {
        gap: "12px",
      },
    },

    iconButton: {
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#333333",
      transition: "color 0.2s ease",
      "&:hover": {
        color: "#27251F",
      },
    },
    overlayBackdrop: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.3)",
      zIndex: 1200,
    },
    overlayContent: {
      position: "fixed",
      top: 0,
      right: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "#FFFFFF",
      zIndex: 1201,
      boxShadow: "-4px 0 10px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      [theme.breakpoints.up(811)]: {
        width: "50%",
        maxWidth: "50%",
      },
    },
    drawerHeader: {
      padding: "16px 0",
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
    },
    mobileTabList: {
      display: "flex",
      overflowX: "auto",
      gap: "24px",
      padding: "0 24px 16px 24px",
      borderBottom: "1px solid #E5E7EB",
      whiteSpace: "nowrap",
      "&::-webkit-scrollbar": {
        display: "none",
      },
      msOverflowStyle: "none",
      scrollbarWidth: "none",
    },
    mobileTabItem: {
      ...TYPOGRAPHY_STYLES.xl.bold,
      cursor: "pointer",
      color: "#A3A3A3",
      textTransform: "uppercase",
      paddingBottom: "8px",
      borderBottom: "2px solid transparent",
      transition: "all 0.2s ease",
    },
    mobileTabItemActive: {
      color: "#27251F",
      borderBottom: "2px solid #27251F",
    },
    mobileSubMenu: {
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      overflowY: "auto",
    },
    mobileGridContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "40px",
    },
    mobileGridColumns: {
      display: "flex",
      flexWrap: "wrap",
      gap: "16px",
    },
    mobileGridColumn: {
      flex: "1 1 calc(50% - 20px)",
      minWidth: "calc(50% - 20px)",
    },
    mobileGridImage: {
      width: "100%",
      height: 250,
      backgroundColor: "#F3F4F6",
      mt: 4,
    },
    logo: {
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
    },
  };
});

export default useStyles;
