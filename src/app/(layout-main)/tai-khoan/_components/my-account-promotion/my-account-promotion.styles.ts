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
    [theme.breakpoints.down("md")]: {
      padding: "16px",
      gap: "16px",
    },
  },
  sectionTitle: {
    ...TYPOGRAPHY_STYLES.lg.bold,
    color: "#0A0A0A",
    textTransform: "uppercase",
  },
  voucherGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
    [theme.breakpoints.up("lg")]: {
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "16px",
    },
  },
}));

export default useStyles;
