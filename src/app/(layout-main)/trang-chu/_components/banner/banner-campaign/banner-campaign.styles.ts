import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { BANNER_CAMPAIGN_ASPECT_RATIO } from "./banner-campaign.constants";

const useStyles = makeStyles({ name: "BannerCampaign" })((theme) => ({
  root: {
    width: "100%",
    display: "flex",
    height: "auto",
  },
  bannerItem: {
    position: "relative",
    flex: 1,
    width: "100%",
    aspectRatio: BANNER_CAMPAIGN_ASPECT_RATIO.desktop,
    display: "block",
    overflow: "hidden",
    [theme.breakpoints.down(1200)]: {
      aspectRatio: BANNER_CAMPAIGN_ASPECT_RATIO.tablet,
    },
    [theme.breakpoints.down(810)]: {
      aspectRatio: BANNER_CAMPAIGN_ASPECT_RATIO.mobile,
    },
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.6s ease",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  titleOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "16px 24px",
    paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))",
    zIndex: 2,
    pointerEvents: "none",
    boxSizing: "border-box",
    [theme.breakpoints.down(810)]: {
      padding: "12px 16px",
      paddingBottom: "max(12px, env(safe-area-inset-bottom, 0px))",
    },
  },
  titleBar: {
    backgroundColor: "#00000080",
    padding: "12px",
    boxSizing: "border-box",
  },
  title: {
    ...TYPOGRAPHY_STYLES.base.regular,
    margin: 0,
    textTransform: "uppercase",
  },
}));

export default useStyles;
