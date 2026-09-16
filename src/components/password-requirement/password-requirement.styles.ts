import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const usePasswordRequirementStyles = makeStyles({ name: "PasswordRequirement" })((theme) => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  title: {
    ...TYPOGRAPHY_STYLES.md.bold,
    marginBottom: theme.spacing(1),
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  text: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#16A34A",
  },
  textDisabled: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#737373",
  },
  iconChecked: {
    color: "#16A34A",
    fontSize: 20,
  },
  iconUnChecked: {
    color: "#9CA3AF",
    fontSize: 20,
  },
  hintMargin: {
    marginBottom: theme.spacing(3),
  },
}));

export default usePasswordRequirementStyles;
