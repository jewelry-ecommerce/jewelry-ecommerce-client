import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_ITEM, PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useStyles = makeStyles({ name: "CheckoutAddressSection" })((theme) => ({
  rootWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: PADDING_GAP_LAYOUT,
  },

  formSectionWrapper: {
    gap: PADDING_GAP_LAYOUT,
  },

  gridWrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    [theme.breakpoints.down(810)]: {
      gridTemplateColumns: "1fr",
    },
    gap: PADDING_GAP_LAYOUT,
  },

  addressBookBtn: {
    color: "#197CBD",
    cursor: "pointer",
    gap: PADDING_GAP_ITEM,
  },

  addressBookText: {
    color: "#197CBD",
    ...TYPOGRAPHY_STYLES.base.regular,
  },

  savedAddressBox: {
    padding: PADDING_GAP_LAYOUT,
    border: "1px solid #EAEAEA",
  },
  savedAddressContent: {
    gap: "4px",
    width: "100%",
  },

  savedAddressName: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#27251F",
  },

  savedAddressPhone: {
    ...TYPOGRAPHY_STYLES.md.regular,
    color: "#27251F",
  },

  savedAddressDetail: {
    ...TYPOGRAPHY_STYLES.md.regular,
    color: "#27251F",
  },

  editAddressLink: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#197CBD",
    textDecoration: "underline",
    textTransform: "none",
    border: "none",
    cursor: "pointer",
  },

  hintText: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#404040",
    ...TYPOGRAPHY_STYLES.sm.regular,
    marginTop: "12px",
  },
}));

export default useStyles;
