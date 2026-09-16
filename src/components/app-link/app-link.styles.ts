import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles({
  name: "appLink",
})(() => {
  return {
    colorInitial: {
      "&:hover": {
        color: "inherit",
      },
    },
  };
});

export default useStyles;
