import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useStyles = makeStyles({ name: "ProductSizeGuideDrawer" })((theme) => ({
  drawerPaper: {
    width: 480,
    maxWidth: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.common.white,
    [theme.breakpoints.down("md")]: {
      width: "100%",
      maxHeight: "100%",
    },
  },
  root: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    minHeight: 0,
    alignSelf: "stretch",
    maxWidth: "480px",
    [theme.breakpoints.down("md")]: {
      width: "100%",
      maxWidth: "100%",
    },
  },
  header: {
    flexShrink: 0,
    padding: "16px 20px",
    width: "100%",
    borderBottom: "1px solid #E5E5E5",
    [theme.breakpoints.down("md")]: {
      padding: "8px 14px",
    },
  },
  title: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    color: "#27251f",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    [theme.breakpoints.down("md")]: {
      fontSize: 16,
      lineHeight: "140%",
    },
  },
  body: {
    width: "100%",
    flex: 1,
    minHeight: 0,
    padding: "24px 20px",
    overflowY: "auto",
    [theme.breakpoints.down("md")]: {
      padding: "16px 14px",
    },
  },
  section: {
    marginBottom: "32px",
  },
  sectionTitle: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: "#27251F",
    textTransform: "uppercase",
    marginBottom: "12px",
  },
  textList: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  textItem: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#27251F",
  },
  imageList: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    marginTop: "20px",
  },
  imageWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  guideImage: {
    width: "100%",
    height: "auto",
    objectFit: "contain",
  },
  footerNote: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#27251F",
  },
  footerLink: {
    color: "rgba(25, 124, 189, 1)",
    textDecoration: "underline",
    textDecorationColor: "currentColor",
  },
}));

export default useStyles;
