import { TRANSITION_TIME } from "@/utils/constants/style.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

interface StyleProps {
  width?: number | string | Record<string, number | string>;
  height?: number | string | Record<string, number | string>;
  isLink?: boolean;
}

const useStyles = makeStyles<{ props: StyleProps }>({ name: "ProductInfoCard" })((theme, { props }) => {
  const { width, height, isLink } = props;

  return {
    root: {
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      textDecoration: "none",
      color: "inherit",
      padding: "16px",
      boxSizing: "border-box",
      width: (width as any) || "100%",
      height: (height as any) || "100%",
      cursor: isLink ? "pointer" : "default",
    },
    mediaWrapper: {
      position: "relative",
      width: "100%",
      overflow: "hidden",
      marginBottom: "16px",
      // Không khóa chiều cao cứng — strip ngang (trust banner) giữ tỷ lệ gốc, tránh cover phóng mờ.
      lineHeight: 0,
    },
    media: {
      width: "100%",
      height: "auto",
      maxWidth: "100%",
      objectFit: "contain",
      objectPosition: "center",
      display: "block",
    },
    contentWrapper: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    textGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    title: {
      ...TYPOGRAPHY_STYLES.md.bold,
      textTransform: "uppercase",
      color: "#27251F",
    },
    subtitle: {
      ...TYPOGRAPHY_STYLES["xs"].regular,
      textTransform: "uppercase",
      color: "#666",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    actionLabel: {
      ...TYPOGRAPHY_STYLES["sm"].regular,
      textTransform: "uppercase",
      cursor: "pointer",
      transition: `opacity ${TRANSITION_TIME}`,
      display: "inline-block",
      textUnderlineOffset: "4px",
      textDecoration: "underline",
      color: "#27251F",
      "&:hover": {
        opacity: 0.6,
      },
    },
  };
});

export default useStyles;
