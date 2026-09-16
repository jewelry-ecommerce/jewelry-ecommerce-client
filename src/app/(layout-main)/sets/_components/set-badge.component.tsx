// set term
import { Box, Typography } from "@mui/material";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const SetBadge = () => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.5,
      width: "fit-content",
      flexShrink: 0,
      borderRadius: "13px",
      background: "var(--set-key-badge-background)",
      padding: "4px 6px",
    }}
  >
    <Typography
      sx={{
        ...TYPOGRAPHY_STYLES.xs.bold,
        color: "var(--set-key-badge-color)",
        whiteSpace: "nowrap",
      }}
    >
      Limited Edition - Stella Set
    </Typography>
  </Box>
);

export default SetBadge;
