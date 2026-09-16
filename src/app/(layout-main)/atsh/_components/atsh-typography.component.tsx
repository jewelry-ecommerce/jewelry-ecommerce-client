import { Typography, TypographyProps } from "@mui/material";
import localFont from "next/font/local";
import { ReactNode } from "react";

/** Fz Jaapokki Subtract — brand font used by ATSH hero headline */
export const atshJaapokkiFont = localFont({
  src: "../../../../../public/fonts/Fz-Jaapokki-Regular.otf",
  display: "swap",
  variable: "--font-atsh-jaapokki",
});

const atshJaapokkiFontFamily = `var(--font-atsh-jaapokki), ${atshJaapokkiFont.style.fontFamily}`;

interface AtshTypographyProps extends TypographyProps {
  children: ReactNode;
}

export function AtshTypography({ children, className, sx, ...rest }: AtshTypographyProps) {
  return (
    <Typography
      className={`${atshJaapokkiFont.className} ${atshJaapokkiFont.variable} ${className ?? ""}`}
      sx={[{ fontFamily: atshJaapokkiFontFamily }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...rest}
    >
      {children}
    </Typography>
  );
}

export default AtshTypography;
