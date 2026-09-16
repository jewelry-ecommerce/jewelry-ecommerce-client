import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_ITEM, PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useStyles = makeStyles()((theme) => ({
  modalPaper: {
    width: "600px",
    height: "auto",
    maxHeight: "90vh",
    maxWidth: "calc(100% - 32px)",
    display: "flex",
    flexDirection: "column",
    borderRadius: "0",
    [theme.breakpoints.down(810)]: {
      width: "100%",
      height: "100%",
      maxHeight: "none",
      maxWidth: "none",
      margin: 0,
      borderRadius: 0,
    },
  },

  modalTitleWrapper: {
    display: "flex",
    flexDirection: "column",
    padding: `${PADDING_GAP_LAYOUT} 20px`,
    borderBottom: "1px solid #E5E5E5",
    [theme.breakpoints.down(810)]: {
      padding: PADDING_GAP_LAYOUT,
      "& .MuiTypography-root": {
        ...TYPOGRAPHY_STYLES.lg.bold,
      },
    },
  },

  modalContent: {
    display: "flex",
    flexDirection: "column",
    padding: 0,
    flex: 1,
    overflowY: "auto",
  },

  footer: {
    padding: `${PADDING_GAP_LAYOUT} 20px`,
    borderTop: "1px solid #EAEAEA",
    [theme.breakpoints.down(810)]: {
      padding: PADDING_GAP_LAYOUT,
    },
  },

  addButton: {
    "&&": {
      border: "1px solid #0A0A0A",
      color: "#0A0A0A",
      borderRadius: "0",
      padding: `12px ${PADDING_GAP_LAYOUT}`,
      gap: PADDING_GAP_ITEM,
      ...TYPOGRAPHY_STYLES.md.bold,
      textTransform: "none",
      "&:hover": {
        backgroundColor: "#F5F5F5",
      },
      [theme.breakpoints.down(810)]: {
        padding: "12px 16px",
        ...TYPOGRAPHY_STYLES.base.bold,
      },
    },
  },
}));

export default useStyles;
