// set term
import { Box, Typography } from "@mui/material";
import { Stars02 } from "@untitledui/icons";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const SetKeyBadge = () => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.5,
      width: "fit-content",
      borderRadius: "13px",
      background: "var(--set-key-badge-background)",
      padding: "4px 6px",
    }}
  >
    <Stars02 size={16} color="var(--set-key-badge-color)" />
    <Typography sx={{ color: "var(--set-key-badge-color)", ...TYPOGRAPHY_STYLES.sm.semiBold }}>Signature Piece</Typography>
  </Box>
);

export default SetKeyBadge;
