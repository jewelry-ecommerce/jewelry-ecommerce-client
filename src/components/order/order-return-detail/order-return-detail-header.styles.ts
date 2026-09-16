import { makeStyles } from "tss-react/mui";
import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useStyles = makeStyles()((theme) => ({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    [theme.breakpoints.down(810)]: {
      flexDirection: "column",
      gap: PADDING_GAP_LAYOUT,
    },
  },

  headerMain: {
    flexWrap: "wrap",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    gap: PADDING_GAP_LAYOUT,
  },

  withdrawActions: {
    gap: PADDING_GAP_LAYOUT,
    [theme.breakpoints.down(810)]: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "#FFFFFF",
      padding: PADDING_GAP_LAYOUT,
      borderTop: "1px solid #D4D4D4",
      zIndex: 1000,
      "& > button": {
        flex: 1,
      },
    },
  },
}));

export default useStyles;
