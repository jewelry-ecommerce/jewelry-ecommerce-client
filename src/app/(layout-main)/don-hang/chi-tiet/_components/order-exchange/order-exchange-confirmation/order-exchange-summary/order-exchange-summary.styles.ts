import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(() => ({
  root: {
    marginBottom: "48px",
  },
  sectionHeader: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#6B7280",
    textTransform: "none" as const,
    marginBottom: "24px",
  },
  label: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#27251F",
  },
  value: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: "#101828",
  },
  totalLabel: {
    ...TYPOGRAPHY_STYLES.lg.bold,
    color: "#000000",
  },
  totalValue: {
    ...TYPOGRAPHY_STYLES.lg.bold,
    color: "#000000",
  },
  footnote: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#9CA3AF",
    marginTop: "8px",
    lineHeight: 1.6,
    gap: "12px",
  },
}));

export default useStyles;
