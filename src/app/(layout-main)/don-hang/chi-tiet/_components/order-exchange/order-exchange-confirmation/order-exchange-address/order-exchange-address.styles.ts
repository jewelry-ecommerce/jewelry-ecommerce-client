import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(() => ({
  root: {
    marginBottom: "24px",
  },
  sectionTitle: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#6B7280",
    marginBottom: "16px",
  },
}));

export default useStyles;
