import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useStyles = makeStyles({ name: "Footer" })((theme) => ({
  root: {
    width: "100%",
    backgroundColor: "#171717",
    padding: "40px 16px",
    [theme.breakpoints.down("lg")]: {
      padding: "32px 16px",
    },
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "24px",
    [theme.breakpoints.down("lg")]: {
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "32px 16px",
    },
    [theme.breakpoints.down("md")]: {
      gridTemplateColumns: "1fr",
      gap: "24px",
    },
  },
  column: {
    display: "flex",
    flexDirection: "column",
  },
  columnTitle: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#FFFFFF",
    textTransform: "uppercase",
    marginBottom: "16px",
  },
  linkList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  linkItem: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#FFFFFF",
    cursor: "pointer",
    transition: "opacity 0.2s",
    "&:hover": {
      opacity: 0.8,
    },
  },
  divider: {
    height: "1px",
    backgroundColor: "#929292",
    marginTop: "40px",
    marginBottom: "16px",
    width: "100%",
    [theme.breakpoints.down("lg")]: {
      marginTop: "24px",
    },
  },
  bottomBar: {
    width: "100%",
    gap: "8px",
  },
  copyrightText: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#FFFFFF",
    "& p": {
      margin: 0,
    },
    "& p + p": {
      marginTop: 4,
    },
  },
  socialAndCert: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "16px",
    flex: 1,
  },
  socialIcons: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },
  socialIcon: {
    cursor: "pointer",
    transition: "transform 0.2s",
    "&:hover": {
      transform: "scale(1.1)",
    },
  },
  logo: {
    marginBottom: "20px",
    display: "block",
    [theme.breakpoints.up("lg")]: {
      display: "none",
      marginBottom: "32px",
    },
    [theme.breakpoints.down("md")]: {
      marginBottom: "24px",
    },
  },
  logoPC: {
    display: "none",
    [theme.breakpoints.up("lg")]: {
      display: "flex",
    },
  },
  footerLogoDesktop: {
    height: 46,
    width: "auto",
    maxWidth: "100%",
  },
}));

export default useStyles;
