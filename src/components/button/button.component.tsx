import { Button, ButtonProps, CircularProgress, Stack, Typography } from "@mui/material";
import React from "react";
import { STYLE } from "@/utils/constants";
export interface ButtonComponentProps extends ButtonProps {
  content?: string;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  size?: "small" | "medium" | "large";
}

export const ButtonComponent = ({
  content,
  loading = false,
  startIcon,
  endIcon,
  variant = "contained",
  sx,
  size = "small",
  ...rest
}: ButtonComponentProps) => {
  return (
    <Button
      {...rest}
      variant={variant}
      disableRipple
      startIcon={startIcon && !loading ? startIcon : undefined}
      endIcon={endIcon && !loading ? endIcon : undefined}
      sx={{
        minWidth: 100,
        textTransform: "none",
        borderRadius: STYLE.BORDER_RADIUS_ELEMENT,
        ...sx,
      }}
    >
      {loading ? (
        <Stack sx={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <CircularProgress size={STYLE.FONT_SIZE_LOADING[size]} sx={{ color: "inherit" }} />
        </Stack>
      ) : (
        <Typography sx={{ transform: `translateY(0.5px)`, whiteSpace: "nowrap" }}>{content}</Typography>
      )}
    </Button>
  );
};
