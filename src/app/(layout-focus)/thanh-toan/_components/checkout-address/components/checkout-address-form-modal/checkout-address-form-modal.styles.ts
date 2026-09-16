import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles({ name: "CheckoutAddressFormModal" })((theme) => ({
  modalPaper: {
    padding: 0,
    borderRadius: 0,
    maxWidth: "650px",
    width: "100%",
    [theme.breakpoints.down(810)]: {
      width: "100%",
      margin: PADDING_GAP_LAYOUT,
    },
    height: "fit-content",
  },
  modalTitleWrapper: {
    padding: `${PADDING_GAP_LAYOUT} 20px !important`,
  },
  modalContent: {
    padding: `${PADDING_GAP_LAYOUT} 20px !important`,
  },
  modalContentWrapper: {
    gap: PADDING_GAP_LAYOUT,
    width: "100%",
  },
  gridTwoColumns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: PADDING_GAP_LAYOUT,
    width: "100%",
    [theme.breakpoints.down(810)]: {
      gridTemplateColumns: "1fr",
    },
  },
  gridTwoColumnsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: PADDING_GAP_LAYOUT,
    width: "100%",
  },
  checkboxWrapper: {
    marginTop: "24px",
  },
  footer: {
    padding: "0 20px 16px 20px",
    marginTop: "40px",
  },
  submitButton: {
    "&&": {
      backgroundColor: "#0A0A0A",
      color: "#FFFFFF",
      borderRadius: 0,
      padding: `12px ${PADDING_GAP_LAYOUT}`,
      ...TYPOGRAPHY_STYLES.md.bold,
      textTransform: "none",
      "&:hover": {
        backgroundColor: "#171717",
      },
      "&:disabled": {
        backgroundColor: "#EAEAEA",
        color: "#A1A1AA",
      },
    },
  },
  closeButton: {
    position: "absolute",
    right: 8,
    top: 12,
    color: theme.palette.grey[500],
  },
}));

export default useStyles;
