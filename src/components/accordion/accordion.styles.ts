import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles({ name: "Accordion" })((theme) => ({
  root: {
    "&:before": { display: "none" },
    borderBottom: "1px solid #F2F4F7",
    "&.Mui-expanded": { m: 0 },
    background: "transparent",
  },
  summary: {
    p: 0,
    "& .MuiAccordionSummary-content": { m: "12px 0" },
  },
  title: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#060606",
  },
  details: {
    p: "0 0 16px 0",
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#727272",
  },
}));

export default useStyles;
