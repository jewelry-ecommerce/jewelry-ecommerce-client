import { InputLabel, styled } from "@mui/material";

export const InputLabelCustom = styled(InputLabel)(({ theme }) => ({
  display: "flex",
  backgroundColor: theme.palette.background.paper,
  paddingLeft: "8px",
  paddingRight: `9px`,
  transform: `translate(10px, -9px) scale(0.75)`,
}));
