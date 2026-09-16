// set term
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles({ name: "SetListingSection" })((theme) => ({
  root: { width: "100%" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    [theme.breakpoints.down("lg")]: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  },
}));

export default useStyles;
