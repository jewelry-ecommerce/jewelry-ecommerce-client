import { makeStyles } from "tss-react/mui";
import { STYLE } from "@/utils/constants";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useStyles = makeStyles({ name: "Newsletter" })((theme) => ({
  container: {
    width: "100%",
    padding: STYLE.PADDING_GAP_LAYOUT,
    backgroundColor: "#F4F4F4",
    height: "240px",
  },
  title: {
    ...TYPOGRAPHY_STYLES.md.bold,
    textAlign: "center",
    marginBottom: "24px",
    textTransform: "uppercase",
  },
  inputWrapper: {
    width: "100%",
    maxWidth: "600px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: STYLE.PADDING_GAP_LAYOUT,
  },
  textField: {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: STYLE.BORDER_RADIUS_ELEMENT_SMALL,
      transition: "all 0.2s ease",
      paddingRight: "4px",
      "& fieldset": {
        borderColor: "#DEDEDE",
      },
      "&:hover fieldset": {
        borderColor: "#DEDEDE !important",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#DEDEDE !important",
        borderWidth: "1px !important",
      },
      "&.Mui-focused": {
        boxShadow: "none !important",
      },
      "&.Mui-error.Mui-focused": {
        boxShadow: "none !important",
        "& fieldset": {
          borderColor: theme.palette.error.main + " !important",
        },
      },
    },
    "& .MuiInputBase-input": {
      padding: `${STYLE.PADDING_GAP_LAYOUT}`,
      ...TYPOGRAPHY_STYLES.base.regular,
      "&::placeholder": {
        color: "#9CA3AF",
        opacity: 1,
      },
      "&:-webkit-autofill": {
        // fix autofill background của trình duyệt
        WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.default} inset !important`,
        WebkitTextFillColor: "#000000 !important",
      },
    },
  },
  sendIcon: {
    padding: 0,
    marginRight: "8px",
    color: theme.palette.grey[800],
    transition: "transform 0.2s ease, color 0.2s ease",
    "&:hover": {
      color: theme.palette.common.black,
      backgroundColor: "transparent",
    },
    "&.Mui-disabled": {
      opacity: 0.3,
    },
  },
  feedbackMsg: {
    marginTop: "12px",
    ...TYPOGRAPHY_STYLES.sm.regular,
    textAlign: "center",
    minHeight: "20px",
  },
  checkboxWrapper: {
    "& .MuiCheckbox-root:hover": {
      backgroundColor: "transparent",
    },
    "& .MuiTypography-root": {
      ...TYPOGRAPHY_STYLES.sm.regular,
      color: "#000000",
    },
  },
}));

export default useStyles;
