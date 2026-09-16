import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useStyles = makeStyles()((theme) => ({
  sidebarRoot: {
    width: "320px",
    gap: "8px",
    [theme.breakpoints.down("lg")]: {
      width: "268px",
    },
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
  },
  sidebarItem: {
    width: "100%",
    padding: "8px 16px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    border: "none",
    background: "transparent",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#F5F5F5",
    },
  },
  sidebarItemActive: {
    backgroundColor: "#27251F !important",
  },
  sidebarItemLogout: {
    borderTop: "1px solid #E3E3E3",
    marginTop: "8px",
    paddingTop: "16px",
  },
  itemLeft: {
    gap: "8px",
  },
  iconBox: {
    width: "40px",
    height: "40px",
    backgroundColor: "#F5F5F5",
    borderRadius: "100px",
    padding: "8px",
    transition: "all 0.2s ease-in-out",
    [theme.breakpoints.down("lg")]: {
      width: "32px",
      height: "32px",
    },
  },
  iconBoxActive: {
    backgroundColor: "#fff",
  },
  label: {
    ...TYPOGRAPHY_STYLES.md.regular,
    color: "#27251F",
    [theme.breakpoints.down("lg")]: {
      ...TYPOGRAPHY_STYLES.base.regular,
      whiteSpace: "nowrap",
    },
  },
  labelActive: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#fff",
    [theme.breakpoints.down("lg")]: {
      ...TYPOGRAPHY_STYLES.base.bold,
      whiteSpace: "nowrap",
    },
  },
  arrowIcon: {
    color: "#101828",
    transition: "all 0.2s ease-in-out",
  },
  arrowIconActive: {
    color: "#fff",
  },
}));

export default useStyles;
