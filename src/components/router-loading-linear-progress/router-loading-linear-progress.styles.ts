import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles({
  name: "routerLoadingLinearProgress",
})((theme) => {
  return {
    root: {
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: theme.zIndex.backdrop + 1,
      width: "100%",
    },
  };
});

export default useStyles;
