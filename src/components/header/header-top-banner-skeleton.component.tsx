import { Box, Skeleton } from "@mui/material";

const HeaderTopBannerSkeleton = () => (
  <Box
    sx={{
      position: "relative",
      height: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      px: 2,
      backgroundColor: "#F4F4F5",
    }}
  >
    <Skeleton variant="rounded" width={56} height={20} sx={{ borderRadius: "12px" }} />
    <Skeleton variant="text" width="min(280px, 60vw)" height={18} />
    <Box sx={{ position: "absolute", right: 12 }}>
      <Skeleton variant="circular" width={20} height={20} />
    </Box>
  </Box>
);

export default HeaderTopBannerSkeleton;
