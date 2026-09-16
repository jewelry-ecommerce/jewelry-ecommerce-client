import { STYLE } from "@/utils/constants";
import { styled, Typography } from "@mui/material";

export const TypographyFilter = styled(Typography)(({ theme }) => ({
  height: STYLE.HEIGHT_ELEMENT_OTHER,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: STYLE.BORDER_RADIUS_ELEMENT,
  "&:hover": { boxShadow: theme.shadows[1], color: theme.palette.primary.main },
  alignContent: "center",
  cursor: "pointer",
  textWrap: "nowrap",
  padding: `0px ${STYLE.PADDING_GAP_LAYOUT}`,
}));
