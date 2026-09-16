import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useStyles = makeStyles({ name: "MyAccountAddressDialog" })((theme) => ({
  modalContentWrapper: {
    gap: "16px",
    width: "100%",
  },
  gridTwoColumns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    width: "100%",
    [theme.breakpoints.down(810)]: {
      gridTemplateColumns: "1fr",
    },
  },
  gridTwoColumnsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    width: "100%",
  },
  checkboxWrapper: {
    marginTop: "24px",
    display: "flex",
    alignItems: "center",
  },
  defaultAddressWarning: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#DC2626",
  },
  submitButton: {
    backgroundColor: "#0A0A0A",
    color: "#FFFFFF",
    borderRadius: 4,
    padding: "12px 24px",
    ...TYPOGRAPHY_STYLES.md.bold,
    height: 50,
    "&:hover": {
      backgroundColor: "#171717",
    },
    "&:disabled": {
      backgroundColor: "#EAEAEA",
      color: "#A1A1AA",
    },
  },
}));

export default useStyles;
