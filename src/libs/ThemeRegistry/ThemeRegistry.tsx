"use client";

import React, { useMemo } from "react";
import * as locales from "@mui/material/locale";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import defaultTheme from "@/assets/theme";

type SupportedLocales = keyof typeof locales;

interface ThemeRegistryProps {
  children: React.ReactNode;
  locale?: string;
}

const baseTheme = createTheme(defaultTheme);

export default function ThemeRegistry({ children, locale = "enUS" }: ThemeRegistryProps) {
  const safeLocale = (locale.replace("-", "") as SupportedLocales) || "enUS";

  const themeWithLocale = useMemo(() => createTheme(baseTheme, locales[safeLocale] ?? {}), [safeLocale]);

  return (
    <ThemeProvider theme={themeWithLocale}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
