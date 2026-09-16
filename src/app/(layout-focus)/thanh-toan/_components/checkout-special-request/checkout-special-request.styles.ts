import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { SxProps, Theme } from "@mui/material";
import { makeStyles } from "tss-react/mui";

export const getVatCheckboxStyles = (isVat: boolean, readOnly = false): SxProps<Theme> => ({
  backgroundColor: isVat ? "#171717" : readOnly ? "#F2F4F7" : "transparent",
  color: "#FFFFFF",
  borderColor: isVat ? "#171717" : "#DEDEDE",
});

export const getOtherCheckboxStyles = (isOther: boolean, readOnly = false): SxProps<Theme> => ({
  backgroundColor: isOther ? "#171717" : readOnly ? "#F2F4F7" : "transparent",
  color: "#FFFFFF",
  borderColor: isOther ? "#171717" : "#DEDEDE",
});

const useStyles = makeStyles({ name: "CheckoutSpecialRequestSection" })((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: PADDING_GAP_LAYOUT,
  },

  sectionWrapper: {
    gap: PADDING_GAP_LAYOUT,
  },

  vatFieldsWrapper: {
    gap: "12px",
  },

  otherNoteWrapper: {
    marginLeft: theme.spacing(4),
  },

  textarea: {
    "& .MuiOutlinedInput-root": {
      color: "#707070",
      ...TYPOGRAPHY_STYLES.base.regular,
      "& fieldset": {
        borderColor: "#DEDEDE",
      },
      "&:hover fieldset": {
        borderColor: "#707070",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#707070",
      },
      "&.Mui-error fieldset": {
        borderColor: "#EF4444",
      },
      "&.Mui-disabled": {
        backgroundColor: "#F5F5F5",
        "& fieldset": {
          borderColor: "#DEDEDE",
        },
      },
    },
    "& .MuiFormHelperText-root": {
      marginLeft: 0,
      marginTop: 4,
      ...TYPOGRAPHY_STYLES.base.regular,
      color: "#EF4444",
      "&.Mui-error": {
        color: "#EF4444",
      },
    },
  },
}));

export default useStyles;
