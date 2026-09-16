import React from "react";

declare module "@mui/material/styles" {
  // Typography
  interface CommonColors {
    black: "#2A2A2A";
    gold: "#F7D6A5";
    colorButton: string;
    orange: string;
  }

  interface PaletteOptions {
    common?: Partial<CommonColors>;
  }

  // zIndex
  interface ZIndex {
    backdrop: number;
    bottomBar: number;
  }

  interface Theme {
    app: {
      shadows: string[];
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    app?: {
      shadows?: string[];
    };
  }

  // export function createTheme(options?: CustomThemeOptions): CustomTheme;
}

declare module "@mui/material/styles/createTypography" {
  interface FontStyle extends Required<{
    fontWeightSemiBold?: React.CSSProperties["fontWeight"];
  }> {}
}
