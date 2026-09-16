import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useStyles = makeStyles()((theme) => ({
  sectionCard: {
    padding: "24px",
    backgroundColor: "#fff",
    border: "1px solid #F4F4F5",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    [theme.breakpoints.down(810)]: {
      padding: "16px",
      gap: "16px",
    },
  },
  addressItem: {
    padding: "16px",
    border: "1px solid #F4F4F5",
    backgroundColor: "#fff",
    gap: "8px",
  },
  name: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#27251F",
  },
  badge: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#197CBD",
    border: "1px solid #197CBD",
    borderRadius: "4px",
    padding: "4px 8px",
    marginLeft: "12px",
    [theme.breakpoints.down(810)]: {
      display: "none",
    },
  },
  badgeMobile: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#197CBD",
    border: "1px solid #197CBD",
    borderRadius: "4px",
    padding: "4px 8px",
    width: "fit-content",
    [theme.breakpoints.up(810)]: {
      display: "none",
    },
  },
  actionLink: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#197CBD",
    textDecoration: "underline",
    cursor: "pointer",
  },
  divider: {
    width: "1px",
    height: "12px",
    backgroundColor: "#D1D5DB",
  },
  detailsText: {
    ...TYPOGRAPHY_STYLES.md.regular,
    color: "#27251F",
  },
  addButton: {
    padding: "6px 12px",
    border: "1px solid #0A0A0A",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  addButtonText: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: "#0A0A0A ",
  },
  addButtonMobile: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    padding: "6px 12px",
    border: "1px solid #0A0A0A",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    textTransform: "uppercase",
    [theme.breakpoints.up(810)]: {
      display: "none",
    },
  },
}));

export default useStyles;
