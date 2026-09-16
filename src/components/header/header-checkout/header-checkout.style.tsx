import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => {
  return {
    root: {
      position: "sticky",
      top: 0,
      zIndex: 100,
      width: "100%",
      backgroundColor: "#FFFFFF",
      borderBottom: "1px solid #F2F2F2",
    },
    headerMain: {
      height: 54,
      position: "relative",
      padding: `0 ${PADDING_GAP_LAYOUT}`,
    },
    logo: {
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
    },
    actionIcons: {
      position: "absolute",
      right: 16,
      gap: `${PADDING_GAP_LAYOUT}`,
    },
    iconButton: {
      cursor: "pointer",
      color: "#333333",
    },
  };
});

export default useStyles;
