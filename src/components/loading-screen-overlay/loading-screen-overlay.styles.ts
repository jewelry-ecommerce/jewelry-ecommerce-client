import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles({
  name: "loadingScreenOverlay",
})((theme) => {
  return {
    root: {
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    content: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: theme.spacing(2),
    },
    loadingIcon: {
      fontSize: 40,
      color: theme.palette.common.white,
    },
  };
});

export default useStyles;
