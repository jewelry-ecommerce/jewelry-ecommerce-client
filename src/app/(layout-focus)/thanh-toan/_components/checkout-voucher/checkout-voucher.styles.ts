import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_ITEM, PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useStyles = makeStyles()((theme) => ({
  root: {
    gap: PADDING_GAP_LAYOUT,
  },
  voucherWrapper: {
    border: "1px solid #D4D4D4",
    borderRadius: "4px",
    padding: `14px ${PADDING_GAP_LAYOUT}`,
    cursor: "pointer",
  },

  label: {
    ...TYPOGRAPHY_STYLES.base.regular,
    lineHeight: "150%",
    color: "#6B7280",
  },

  arrowIcon: {
    fontSize: "18px",
    color: "#737373 !important",
  },

  modalContent: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "0 20px 16px",
    [theme.breakpoints.down(810)]: {
      padding: PADDING_GAP_LAYOUT,
    },
  },

  inputContainer: {
    gap: PADDING_GAP_ITEM,
  },

  inputWrapper: {
    gap: "24px",
    [theme.breakpoints.down(810)]: {
      gap: PADDING_GAP_LAYOUT,
    },
    "& > :first-child": {
      flex: 1,
    },
  },

  voucherButton: {
    "&&": {
      backgroundColor: "#0A0A0A",
      color: "#FFFFFF",
      textTransform: "none",
      padding: `12px ${PADDING_GAP_LAYOUT}`,
      ...TYPOGRAPHY_STYLES.md.bold,
      whiteSpace: "nowrap",
      flexShrink: 0,
      borderRadius: 0,
      [theme.breakpoints.up(810)]: {
        minWidth: 200,
      },
      "&:hover": {
        backgroundColor: "#333333",
      },
      "&.Mui-disabled": {
        backgroundColor: "#F5F5F5",
        color: "#BDBDBD",
      },
    },
  },

  voucherSection: {
    marginTop: "24px",
    gap: PADDING_GAP_LAYOUT,
  },

  sectionTitle: {
    ...TYPOGRAPHY_STYLES.md.bold,
    textTransform: "uppercase",
    marginBottom: "16px",
  },

  voucherList: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
    [theme.breakpoints.up(810)]: {
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "16px",
    },
  },

  voucherItem: {
    display: "flex",
    alignItems: "stretch",
    cursor: "pointer",
    position: "relative",
    backgroundColor: "transparent",
    marginBottom: "4px",
  },

  disabled: {
    opacity: 0.4,
    "& *": {
      pointerEvents: "none",
    },
  },

  voucherImage: {
    width: "100px",
    height: "100px",
    flexShrink: 0,
    position: "relative",
    zIndex: 1,
    // style răng cưa cho voucher
    maskImage: "radial-gradient(circle at 0px 5px, transparent 3px, black 3.5px)",
    maskSize: "100% 10px",
    maskPosition: "0 0",
    WebkitMaskImage: "radial-gradient(circle at 0px 5px, transparent 3px, black 3.5px)",
    WebkitMaskSize: "100% 10px",
    WebkitMaskPosition: "0 0",
  },

  voucherInfo: {
    flex: 1,
    padding: `${PADDING_GAP_ITEM} ${PADDING_GAP_LAYOUT}`,
    border: "1px solid #E5E5E5",
    borderLeft: "none",
    gap: "12px",
  },

  infoText: {
    gap: "4px",
    overflow: "hidden",
  },

  voucherTitle: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: "#171717",
    display: "-webkit-box",
    WebkitLineClamp: 1,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  voucherSubtitle: {
    ...TYPOGRAPHY_STYLES.xs.regular,
    color: "#707070",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  voucherCondition: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    width: "fit-content !important",
    textTransform: "none",
    textDecoration: "underline",
    color: "#27251F",
    cursor: "pointer",
  },

  checkboxWrapper: {
    width: 24,
    height: 24,
    flexShrink: 0,
  },

  footer: {
    flexShrink: 0,
    padding: `${PADDING_GAP_LAYOUT} 20px`,
    borderTop: "1px solid #E5E5E5",
  },

  modalTitleWrapper: {
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    gap: PADDING_GAP_LAYOUT,
    padding: `${PADDING_GAP_LAYOUT} 20px`,
  },

  voucherLimitCaption: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#737373",
    display: "block",
    marginTop: PADDING_GAP_ITEM,
  },

  chipContainer: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "4px",
    minHeight: 36,
    padding: `0 ${PADDING_GAP_ITEM}`,
    marginTop: PADDING_GAP_LAYOUT,
  },

  voucherChip: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: "6px 12px",
    borderRadius: "5px",
    gap: PADDING_GAP_ITEM,
    width: "fit-content",
  },

  chipLabel: {
    ...TYPOGRAPHY_STYLES.base.bold,
    textTransform: "uppercase",
  },

  chipIcon: {
    fontSize: "18px",
    cursor: "pointer",
    color: "#707070",
  },

  modalPaper: {
    width: "800px",
    height: "90vh",
    maxHeight: "90vh",
    maxWidth: "calc(100% - 32px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    [theme.breakpoints.down(810)]: {
      width: "100%",
      height: "100%",
      maxHeight: "none",
      maxWidth: "none",
      margin: 0,
      borderRadius: 0,
    },
  },
}));

export default useStyles;
