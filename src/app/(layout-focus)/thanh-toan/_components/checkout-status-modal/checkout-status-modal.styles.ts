import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useStyles = makeStyles({ name: "CheckoutStatusModal" })((theme) => ({
  modalPaper: {
    borderRadius: 0,
    maxWidth: "600px",
    width: "100%",
    overflow: "visible",
  },
  dialogContent: {
    marginTop: "64px",
    padding: `${PADDING_GAP_LAYOUT} 40px 40px`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
  },
  imageWrapper: {
    width: 240,
    height: 174,
    flexShrink: 0,
  },
  imageWrapperPayoo: {
    width: 240,
    height: 155,
    flexShrink: 0,
  },
  image: {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    height: "auto",
  },
  contentWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: PADDING_GAP_LAYOUT,
  },
  title: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    color: "#27251F",
    textTransform: "uppercase",
    textAlign: "center",
  },
  description: {
    ...TYPOGRAPHY_STYLES.xl.regular,
    color: "#27251F",
    textAlign: "center",
  },
  totalsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    width: "100%",
    [theme.breakpoints.down(810)]: {
      gridTemplateColumns: "1fr",
    },
  },
  totalBox: {
    border: "1px solid #E5E5E5",
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },
  totalBoxNew: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  totalLabel: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    textTransform: "uppercase",
    color: "#525252",
  },
  totalLabelNew: {
    color: "#DC2626",
  },
  totalValue: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    color: "#0A0A0A",
    overflowWrap: "anywhere",
  },
  totalValueNew: {
    color: "#DC2626",
  },
  changedItems: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  changedItem: {
    width: "100%",
    border: "1px solid #E5E5E5",
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },
  changedItemName: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: "#0A0A0A",
    overflowWrap: "anywhere",
  },
  changedItemPrice: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#525252",
    overflowWrap: "anywhere",
  },
  buttonWrapper: {
    display: "flex",
    gap: PADDING_GAP_LAYOUT,
    flexDirection: "row",
    width: "100%",
    [theme.breakpoints.down(810)]: {
      flexDirection: "column",
    },
  },
  buttonWrapperStack: {
    flexDirection: "column",
  },
  primaryButton: {
    "&&": {
      flex: 1,
      padding: `12px ${PADDING_GAP_LAYOUT}`,
      backgroundColor: "#0A0A0A",
      color: "#FFFFFF",
      borderRadius: 0,
      ...TYPOGRAPHY_STYLES.md.bold,
      textTransform: "none",
      "&:hover": {
        backgroundColor: "#171717",
      },
    },
  },
  secondaryButton: {
    "&&": {
      flex: 1,
      padding: `12px ${PADDING_GAP_LAYOUT}`,
      backgroundColor: "#FFFFFF",
      color: "#0A0A0A",
      border: "1px solid #0A0A0A",
      borderRadius: 0,
      ...TYPOGRAPHY_STYLES.md.bold,
      textTransform: "none",
      "&:hover": {
        backgroundColor: "#F4F4F5",
      },
    },
  },
}));

export default useStyles;
