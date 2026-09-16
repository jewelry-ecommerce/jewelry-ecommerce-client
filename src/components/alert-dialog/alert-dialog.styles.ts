import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => {
  return {
    dialogPaper: {},
    dialogTitle: {
      padding: theme.spacing(3.75),
    },
    dialogContent: {
      padding: theme.spacing(3.75),
    },
    dialogActions: {
      gap: theme.spacing(2),
      justifyContent: "center",
      padding: theme.spacing(0, 3.75, 3.75),
      "> .MuiButton-root": {
        marginLeft: 0,
        minWidth: 100,
      },
    },
    dialogActionsButton: {},
  };
});

export default useStyles;
