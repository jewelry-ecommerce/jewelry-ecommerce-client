import { makeStyles } from "tss-react/mui";
import { paginationItemClasses } from "@mui/material";
import { PADDING_GAP_ITEM_SMALL, PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useStyles = makeStyles({ name: "AppPagination" })((theme) => ({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    padding: `24px ${PADDING_GAP_LAYOUT}`,
    gap: PADDING_GAP_LAYOUT,
    [theme.breakpoints.up(810)]: {
      display: "grid",
      padding: `32px ${PADDING_GAP_LAYOUT}`,
      gridTemplateColumns: "1fr auto 1fr",
    },
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "center",
    gridColumn: 2,
  },
  pageSizeWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    gridColumn: 3,
    justifySelf: "end",
  },
  pageSizeText: {
    color: "#000000",
    ...TYPOGRAPHY_STYLES.sm.regular,
    [theme.breakpoints.up(810)]: {
      ...TYPOGRAPHY_STYLES.base.regular,
    },
  },
  pageSizeSelect: {
    backgroundColor: "#F5F5F5",
    "& .MuiSelect-select": {
      padding: `${PADDING_GAP_ITEM_SMALL} 28px ${PADDING_GAP_ITEM_SMALL} 12px`,
      minHeight: "unset",
      display: "flex",
      alignItems: "center",
      ...TYPOGRAPHY_STYLES.sm.bold,
    },
    "& .MuiSelect-icon": {
      fontSize: 16,
      right: 8,
      top: "calc(50% - 8px)",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
    [theme.breakpoints.up(810)]: {
      "& .MuiSelect-select": {
        ...TYPOGRAPHY_STYLES.md.bold,
      },
      "& .MuiSelect-icon": {
        fontSize: 20,
        right: 10,
        top: "calc(50% - 10px)",
      },
    },
  },
  pageSizeMenuPaper: {
    marginTop: 4,
    "& .MuiList-root": {
      paddingTop: 4,
      paddingBottom: 4,
    },
    "& .MuiMenuItem-root": {
      minHeight: "unset",
      padding: `${PADDING_GAP_ITEM_SMALL} 12px`,
      justifyContent: "center",
      ...TYPOGRAPHY_STYLES.sm.bold,
    },
    [theme.breakpoints.up(810)]: {
      "& .MuiMenuItem-root": {
        padding: `${PADDING_GAP_ITEM_SMALL} 12px`,
        ...TYPOGRAPHY_STYLES.md.bold,
      },
    },
  },
  root: {
    display: "flex",
    "& .MuiPagination-ul": {
      gap: "20px",
    },
  },
  paginationItem: {
    color: "#A3A3A3",
    backgroundColor: "transparent",
    minWidth: 18,
    height: 24,
    borderRadius: theme.shape.borderRadius,
    position: "relative",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    ...TYPOGRAPHY_STYLES.md.bold,
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.base.bold,
    },
    margin: 0,
    padding: 0,

    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      color: theme.palette.text.primary,
    },

    "& .MuiTouchRipple-root": {
      display: "none",
    },

    [`&.${paginationItemClasses.selected}`]: {
      backgroundColor: "transparent !important",
      color: "#000",

      "&::after": {
        content: '""',
        position: "absolute",
        bottom: 3,
        left: "50%",
        transform: "translateX(-50%)",
        width: 18,
        height: 2,
        backgroundColor: theme.palette.text.primary,
      },

      "&:hover": {
        backgroundColor: "transparent !important",
      },
    },

    [`&.${paginationItemClasses.disabled}`]: {
      opacity: 0.3,
    },

    [`&.${paginationItemClasses.ellipsis}`]: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 24,
      [theme.breakpoints.up("sm")]: {
        minWidth: 32,
      },
    },

    [`&.${paginationItemClasses.previousNext}`]: {
      minWidth: 24,
      width: 24,
      height: 24,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    [`& .${paginationItemClasses.icon}`]: {
      fontSize: 24,
      width: 24,
      height: 24,
      color: theme.palette.text.secondary,
      "& svg": {
        width: 24,
        height: 24,
      },
    },
  },
}));

export default useStyles;
