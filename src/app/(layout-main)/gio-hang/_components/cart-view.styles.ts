import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useCartViewStyles = makeStyles({ name: "CartViewComponent" })((theme) => ({
  root: {
    padding: "40px 100px 60px 100px",
    [theme.breakpoints.down(1199)]: {
      padding: `${PADDING_GAP_LAYOUT} ${PADDING_GAP_LAYOUT} 60px ${PADDING_GAP_LAYOUT}`,
    },
  },
  title: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: "40px",
    [theme.breakpoints.down(810)]: {
      marginBottom: "16px",
    },
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: theme.spacing(3),
    [theme.breakpoints.up("lg")]: {
      gridTemplateColumns: "1fr 340px",
      gap: theme.spacing(4),
    },
  },
  itemsSlot: {
    borderRight: "1px solid",
    borderColor: theme.palette.divider,
    paddingRight: 56,
    [theme.breakpoints.down("lg")]: {
      borderRight: "none",
      paddingRight: 0,
    },
  },
  productHeader: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 160px 180px",
    gap: 16,
    alignItems: "center",
    width: "100%",
    paddingBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    // Mobile: chỉ còn tiêu đề sản phẩm — không giữ cột 160/180 khiến chữ bị ép xuống dòng.
    [theme.breakpoints.down("md")]: {
      display: "block",
      gridTemplateColumns: "unset",
    },
  },
  productHeaderTitle: {
    ...TYPOGRAPHY_STYLES.md.bold,
    justifySelf: "start",
    [theme.breakpoints.down("md")]: {
      whiteSpace: "nowrap",
    },
  },
  productHeaderQty: {
    ...TYPOGRAPHY_STYLES.md.bold,
    textAlign: "center",
    justifySelf: "center",
    width: "100%",
    paddingLeft: 24,
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  productHeaderTotal: {
    ...TYPOGRAPHY_STYLES.md.bold,
    textAlign: "right",
    justifySelf: "end",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  selectAllRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
  },
  selectAllLeft: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: theme.spacing(1),
    minWidth: 0,
  },
  selectAllActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.spacing(1.5),
    marginLeft: "auto",
  },
  selectAllText: {
    ...TYPOGRAPHY_STYLES.base.regular,
  },
  bulkWishlistButton: {
    "&&": {
      display: "flex",
      padding: "6px",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      color: "#0A0A0A",
      textAlign: "center",
      border: "1px solid #0A0A0A",
      borderRadius: 0,
      backgroundColor: "transparent",
      minWidth: "auto",
      ...TYPOGRAPHY_STYLES.sm.regular,
      lineHeight: 1,
      textTransform: "none",
      "&.Mui-disabled": {
        color: "#A3A3A3",
        borderColor: "#D4D4D4",
      },
    },
  },
  bulkDeleteButton: {
    "&&": {
      display: "flex",
      padding: "6px",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      textAlign: "center",
      borderRadius: 0,
      textTransform: "none",
      minWidth: "auto",
      ...TYPOGRAPHY_STYLES.md.regular,
    },
  },
  itemRow: {
    gap: theme.spacing(1.5),
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  // set term
  setItemRow: {
    alignItems: "flex-start",
  },
  // set term
  setItemCheckbox: {
    alignSelf: "flex-start",
    marginTop: 95,
    [theme.breakpoints.down("md")]: {
      marginTop: 63,
    },
  },
  itemBox: {
    flex: 1,
    minWidth: 0,
  },
  summarySlot: {
    minWidth: 0,
    width: "100%",
    [theme.breakpoints.up("lg")]: {
      gridColumn: 2,
    },
  },
  summaryCol: {
    width: "100%",
    borderLeft: "none",
    position: "static",
    backgroundColor: theme.palette.background.paper,
    padding: 0,
    alignSelf: "stretch",
    transition: "transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 380ms ease, box-shadow 420ms ease, padding 320ms ease",
    [theme.breakpoints.up("lg")]: {
      width: "auto",
      // borderLeft: `1px solid ${theme.palette.divider}`,
      borderTop: "none",
      padding: 0,
      paddingLeft: theme.spacing(3),
      position: "sticky",
      top: 120,
      alignSelf: "start",
      backgroundColor: "transparent",
    },
  },
  summaryMobileBar: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1300,
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    paddingBottom: `calc(${theme.spacing(2)} + env(safe-area-inset-bottom, 0px))`,
    boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.08)",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  summaryLabel: {
    ...TYPOGRAPHY_STYLES.base.regular,
  },
  summaryValue: {
    ...TYPOGRAPHY_STYLES.base.regular,
  },
  summarySubRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(0.75),
  },
  summarySubLabel: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: theme.palette.text.secondary,
  },
  summarySubLabelBold: {
    ...TYPOGRAPHY_STYLES.sm.bold,
  },
  summarySubValue: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: theme.palette.text.secondary,
  },
  summaryList: {
    paddingLeft: 20, // tạo khoảng thụt vào
    listStyleType: "disc", // dấu chấm tròn
    paddingBottom: 6,
    marginBlock: 0,
  },

  summaryItem: {
    marginBottom: 4,
  },
  summaryDivider: {
    marginBottom: theme.spacing(2),
  },
  summaryTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  summaryTotalReward: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTotalLabel: {
    ...TYPOGRAPHY_STYLES.base.regular,
  },
  summaryTotalValue: {
    ...TYPOGRAPHY_STYLES["xl"].bold,
    color: theme.palette.text.primary,
  },
  summaryReward: {
    ...TYPOGRAPHY_STYLES.base.bold,
    textAlign: "center",
  },
  summaryRewardIcon: {
    width: 15,
    height: 15,
    flexShrink: 0,
  },
  summaryButton: {
    "&&": {
      ...TYPOGRAPHY_STYLES.md.bold,
      width: "100%",
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      borderRadius: 0,
      paddingTop: theme.spacing(1.1),
      paddingBottom: theme.spacing(1.1),
      textTransform: "none",
      marginBottom: theme.spacing(1.2),
      transition: "background 0.2s",
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
  summaryButtonOutlined: {
    "&&": {
      ...TYPOGRAPHY_STYLES.md.bold,
      width: "100%",
      borderRadius: 0,
      paddingTop: theme.spacing(1.1),
      paddingBottom: theme.spacing(1.1),
      textTransform: "none",
    },
  },
  selectAllCheckbox: {
    backgroundColor: "rgba(199, 245, 132, 1)",
    borderRadius: 4,
    padding: 2,
  },
  BoxCheckbox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: 20,
    minWidth: 20,
    alignSelf: "center",
  },
  checkBox: {
    border: "none",
    padding: 0,
    width: 20,
    height: 20,
    minWidth: 20,
    minHeight: 20,
    // marginLeft: -2,
  },
  containerSummary: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
  },
}));

export default useCartViewStyles;
