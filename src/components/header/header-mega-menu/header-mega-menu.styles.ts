import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useStyles = makeStyles({ name: "HeaderMegaMenu" })((theme) => ({
  drawerPaperPC: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "none",
    width: "auto",
  },
  drawerPaperMobile: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "none",
    [theme.breakpoints.between("md", "lg")]: {
      width: "50%",
    },
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
  },
  contentContainer: {
    padding: "20px 16px",
    height: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    [theme.breakpoints.down("lg")]: {
      padding: "16px",
    },
  },
  scrollContainer: {
    overflowY: "auto",
    flex: 1,
    minHeight: 0,
    "&::-webkit-scrollbar": {
      width: 0,
      height: 0,
      display: "none",
    },
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  mobileScrollArea: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    gap: "24px",
    overflow: "hidden",
  },
  pcMenuLink: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#27251F",
    textDecoration: "none",
    cursor: "pointer",
    textTransform: "uppercase",
    lineHeight: 1.7,
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      bottom: 0,
      width: "100%",
      height: "2px",
      backgroundColor: "#27251F",
      display: "none",
    },
    "&:hover::after": {
      display: "block",
    },
  },
  subHeaderTitle: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    color: "#27251F",
    textTransform: "uppercase",
    textDecoration: "none",
  },
  closeBtn: {
    cursor: "pointer",
  },
  gridContainer: {
    display: "flex",
    flex: 1,
    gap: "24px",
    overflow: "hidden",
    [theme.breakpoints.down("lg")]: {
      marginBottom: "40px",
      flexDirection: "row",
      overflowX: "auto",
      "&::-webkit-scrollbar": {
        width: 0,
        height: 0,
        display: "none",
      },
      scrollbarWidth: "none",
    },
  },
  gridColumn: {
    height: "100%",
    width: "100%",
    gap: "16px",
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: 0,
    },
    scrollbarWidth: "none",
  },
  categoryItem: {
    cursor: "pointer",
    gap: "10px",
  },
  categoryText: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#27251F",
    textTransform: "uppercase",
  },
  categoryTextActive: {
    ...TYPOGRAPHY_STYLES.base.bold,
  },
  mobileMenuNav: {
    gap: "24px",
    overflowX: "auto",
    overflowY: "visible",
    alignItems: "flex-start",
    whiteSpace: "nowrap",
    width: "100%",
    minWidth: 0,
    flexShrink: 0,
    "& > *": {
      flexShrink: 0,
    },
    "&::-webkit-scrollbar": {
      height: 0,
      width: 0,
      display: "none",
    },
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  footerDivider: {
    borderTop: "1px solid #F3F4F6",
    margin: "0 -16px",
    width: "calc(100% + 32px)",
  },
  footerItem: {
    cursor: "pointer",
    color: "#27251F",
    ...TYPOGRAPHY_STYLES.md.regular,
    textTransform: "uppercase",
  },
}));

export default useStyles;
