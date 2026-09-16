import { SxProps, Theme } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_ITEM, PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

type CheckoutAccountStyleProps = {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
};

export const getCheckboxStyles = (checked: boolean): SxProps<Theme> => ({
  backgroundColor: checked ? "#171717" : "transparent",
  color: "#FFFFFF",
  borderColor: checked ? "#171717" : "#DEDEDE",
});

const useStyles = makeStyles<CheckoutAccountStyleProps>()((theme, { user }) => ({
  rootWrapper: {
    gap: PADDING_GAP_LAYOUT,
  },

  container: {
    gap: user ? PADDING_GAP_LAYOUT : PADDING_GAP_ITEM,
  },

  guestInfoWrapper: {
    gap: PADDING_GAP_ITEM,
  },

  emailSectionWrapper: {
    gap: PADDING_GAP_LAYOUT,
  },

  guestDescription: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#27251F",
  },

  authLinksWrapper: {
    gap: "5px",
    ...TYPOGRAPHY_STYLES.md.regular,
  },

  secondaryText: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#27251F",
  },

  userProfileWrapper: {
    gap: "12px",
  },

  userAvatar: {
    width: 48,
    height: 48,
  },

  userName: {
    ...TYPOGRAPHY_STYLES.md.bold,
  },

  userEmail: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#6B7280",
  },

  authLink: {
    textDecoration: "underline",
    color: "#197CBD",
  },
}));

export default useStyles;
