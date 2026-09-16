import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles({ name: "CheckoutView" })((theme) => ({
  root: {
    width: "100%",
    maxWidth: "1116px",
    margin: "0 auto",
    padding: PADDING_GAP_LAYOUT,
    paddingBottom: "100px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    [theme.breakpoints.up(1199)]: {
      flexDirection: "row",
      padding: "40px 0 100px",
      paddingBottom: "60px",
      gap: "58px",
      alignItems: "flex-start",
    },
    [theme.breakpoints.down(1198)]: {
      paddingBottom: `calc(110px + env(safe-area-inset-bottom, 0px))`,
    },
    [theme.breakpoints.down(500)]: {
      paddingBottom: `calc(160px + env(safe-area-inset-bottom, 0px))`,
    },
    "@media (max-width: 350px)": {
      paddingBottom: `calc(180px + env(safe-area-inset-bottom, 0px))`,
    },
  },

  leftColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "40px",
    [theme.breakpoints.down(810)]: {
      gap: "24px",
    },
    width: "100%",
  },

  rightColumn: {
    width: "100%",
    position: "sticky",
    top: "64px",
    display: "flex",
    flexDirection: "column",
    gap: PADDING_GAP_LAYOUT,
    [theme.breakpoints.up("lg")]: {
      width: "420px",
    },
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    border: "1px solid #E5E5E5",
    padding: `24px ${PADDING_GAP_LAYOUT}`,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  submitButton: {
    "&&": {
      padding: `12px ${PADDING_GAP_LAYOUT}`,
      ...TYPOGRAPHY_STYLES.md.bold,
      textTransform: "none",
      backgroundColor: "#0A0A0A",
      color: "#FFFFFF",
      borderRadius: 0,
      marginTop: 0,
      flexShrink: 0,
      "&:hover": {
        backgroundColor: "#262626",
      },
      "&.Mui-disabled": {
        backgroundColor: "#E5E5E5",
        color: "#A3A3A3",
      },
      [theme.breakpoints.down(810)]: {
        padding: "12px 8px",
        ...TYPOGRAPHY_STYLES.base.bold,
      },
      "@media (max-width: 350px)": {
        width: "100%",
        padding: "12px 16px",
      },
    },
  },

  mobileHeader: {
    width: "100%",
    [theme.breakpoints.up("lg")]: {
      display: "none",
    },
  },

  desktopProductList: {
    display: "none",
    [theme.breakpoints.up("lg")]: {
      display: "block",
    },
  },

  termsText: {
    marginTop: "16px",
    color: "#525252",
    fontSize: "14px",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  },

  checkbox: {
    padding: 0,
    marginTop: "2px",
  },

  demoHelperWrapper: {
    display: "flex",
    gap: theme.spacing(1),
    padding: `${theme.spacing(2)} ${PADDING_GAP_LAYOUT}`,
    opacity: 0.3,
    "&:hover": {
      opacity: 1,
    },
    [theme.breakpoints.up("lg")]: {
      padding: `0 16px ${theme.spacing(2)} 16px`,
    },
  },

  mobileStickyFooter: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    boxSizing: "border-box",
    gap: PADDING_GAP_LAYOUT,
    padding: PADDING_GAP_LAYOUT,
    paddingBottom: `calc(${PADDING_GAP_LAYOUT} + env(safe-area-inset-bottom, 0px))`,
    backgroundColor: "#FFFFFF",
    borderTop: "1px solid #EAEAEA",
    boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.08)",
    zIndex: 1300,
    alignItems: "center",
    transform: "translate3d(0, 0, 0)",
    WebkitBackfaceVisibility: "hidden",
    backfaceVisibility: "hidden",
    isolation: "isolate",
    [theme.breakpoints.up(1199)]: {
      display: "none",
    },
    [theme.breakpoints.down(380)]: {
      flexDirection: "column",
      alignItems: "stretch",
      gap: "10px",
      padding: "12px 16px",
      paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
    },
  },

  mobileStickyLeft: {
    gap: "4px",
    minWidth: 0,
    [theme.breakpoints.down(370)]: {
      flex: "none",
      width: "100%",
    },
  },

  mobileStickyTotal: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    flexWrap: "nowrap",
    gap: "8px",
    width: "100%",
    "& .MuiTypography-root": {
      ...TYPOGRAPHY_STYLES.md.bold,
      color: "#000000",
      whiteSpace: "nowrap",
    },
    "& .MuiTypography-root:first-of-type": {
      flexShrink: 0,
    },
    "& .MuiTypography-root:last-of-type": {
      flexShrink: 0,
      marginLeft: "auto",
    },
  },

  mobileStickySavings: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    flexWrap: "nowrap",
    gap: "8px",
    width: "100%",
    "& .MuiTypography-root": {
      ...TYPOGRAPHY_STYLES.sm.regular,
      color: "#000000",
      whiteSpace: "nowrap",
    },
    "& .MuiTypography-root:first-of-type": {
      flexShrink: 0,
    },
    "& .MuiTypography-root:last-of-type": {
      flexShrink: 0,
      marginLeft: "auto",
    },
  },

  desktopOnly: {
    display: "none",
    [theme.breakpoints.up(1199)]: {
      display: "block",
    },
  },

  mobileOnly: {
    display: "block",
    [theme.breakpoints.up(1199)]: {
      display: "none",
    },
  },
}));

export default useStyles;
