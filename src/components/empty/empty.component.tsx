import React from "react";
import { Box, Typography, Stack, SxProps, Theme } from "@mui/material";
import Image from "next/image";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { ButtonComponent } from "@/components/button/button.component";

interface EmptyComponentProps {
  url: string;
  title: string;
  subtitle: string;
  buttonText?: string;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  buttonSx?: SxProps<Theme>;
  titleSx?: SxProps<Theme>;
}

const EmptyComponent = ({ url, title, subtitle, buttonText, onClick, sx, buttonSx, titleSx }: EmptyComponentProps) => {
  return (
    <Stack sx={{ alignItems: "center", gap: "24px", ...sx }}>
      <Box sx={{ position: "relative", width: 160, height: 160 }}>
        <Image src={url} alt={title} fill style={{ objectFit: "contain" }} />
      </Box>
      <Stack sx={{ alignItems: "center", gap: "16px", textAlign: "center" }}>
        <Typography
          sx={{
            ...TYPOGRAPHY_STYLES["2xl"].bold,
            color: "#111827",
            textTransform: "uppercase",
            ...titleSx,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            ...TYPOGRAPHY_STYLES.base.regular,
            color: "#111827",
          }}
        >
          {subtitle}
        </Typography>
      </Stack>
      {buttonText && (
        <ButtonComponent
          onClick={onClick}
          content={buttonText}
          sx={{
            backgroundColor: "#0A0A0A",
            color: "#FFF",
            padding: "12px 50px",
            borderRadius: "0px",
            ...TYPOGRAPHY_STYLES.md.bold,
            ...buttonSx,
          }}
        />
      )}
    </Stack>
  );
};

export default EmptyComponent;
