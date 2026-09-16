import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useStyles = makeStyles()((theme) => ({
  sectionCard: {
    padding: "24px",
    backgroundColor: "#fff",
    border: "1px solid #F4F4F5",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    [theme.breakpoints.down(810)]: {
      padding: "16px",
    },
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
  },
  sectionTitle: {
    ...TYPOGRAPHY_STYLES.lg.bold,
    color: "#27251F",
    textTransform: "uppercase",
  },
  editButton: {
    ...TYPOGRAPHY_STYLES.md.bold,
    padding: "6px 12px",
    backgroundColor: "transparent",
    color: "#0A0A0A",
    border: "1px solid #0A0A0A",
    cursor: "pointer",
    transition: "all 0.2s",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.sm.bold,
      padding: "6px",
    },
    "&:disabled": {
      opacity: 0.4,
      cursor: "not-allowed",
      border: "1px solid #0A0A0A",
    },
  },
  infoGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  infoCol: {
    display: "contents",
  },
  infoItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "24PX",
  },
  infoLabel: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#737373",
    width: "160px",
    flexShrink: 0,
    [theme.breakpoints.down(810)]: {
      width: "120px",
    },
  },
  infoValue: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#27251F",
  },
}));

export default useStyles;
