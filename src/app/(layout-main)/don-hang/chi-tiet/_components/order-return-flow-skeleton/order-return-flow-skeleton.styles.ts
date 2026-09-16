import { makeStyles } from "tss-react/mui";

/** Mirrors `yeu-cau-doi-hang` / `yeu-cau-hoan-tien` page shell for loading state. */
const useStyles = makeStyles()((theme) => ({
  root: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#FFFFFF",
    [theme.breakpoints.down(810)]: {
      paddingBottom: "100px",
    },
  },
  container: {
    maxWidth: "640px",
    margin: "0 auto",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "0 16px",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "40px",
    padding: "40px 0 0 0",
    [theme.breakpoints.down(810)]: {
      gap: "24px",
      padding: "24px 0 0 0",
    },
    width: "100%",
  },
  selectAllRow: {
    paddingTop: "24px",
  },
  itemRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 0",
    borderBottom: "1px solid #EEEEEE",
    [theme.breakpoints.up(810)]: {
      gap: "16px",
      padding: "24px 0",
    },
  },
  itemThumb: {
    flexShrink: 0,
    borderRadius: "4px",
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  stickyFooter: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "24px 0 40px",
    backgroundColor: "transparent",
    [theme.breakpoints.down(810)]: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
      padding: "16px 20px",
      zIndex: 100,
      borderTop: "1px solid #EEEEEE",
    },
  },
  footerInner: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    [theme.breakpoints.down(810)]: {
      maxWidth: "640px",
    },
  },
}));

export default useStyles;
