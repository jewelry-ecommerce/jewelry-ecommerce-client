import { createTheme } from "@mui/material/styles";
import { TypographyOptions } from "@mui/material/styles/createTypography";

import generalStyles from "./general.styles";
import overridesStyles from "./overrides.styles";
import customStyles from "./custom.styles";

const muiTheme = createTheme();

const fontFamily = "var(--font-hanken-grotesk), sans-serif";

const typography: TypographyOptions = {
  fontFamily,
  fontWeightBold: 700,
  fontWeightSemiBold: 600,
  fontWeightMedium: 500,
  fontWeightRegular: 400,
  // fontWeightLight: 300,
  h1: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: muiTheme.typography.pxToRem(96),
    lineHeight: "118px",
  },
  h2: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: muiTheme.typography.pxToRem(60),
    lineHeight: "75px",
  },
  h3: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: muiTheme.typography.pxToRem(48),
    lineHeight: "60px",
  },
  h4: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: muiTheme.typography.pxToRem(34),
    lineHeight: "120%",
  },
  h5: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: muiTheme.typography.pxToRem(24),
    lineHeight: "130%",
  },
  h6: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: muiTheme.typography.pxToRem(20),
    lineHeight: "30px",
  },
  body1: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: muiTheme.typography.pxToRem(16),
    lineHeight: "26px",
  },
  body2: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: muiTheme.typography.pxToRem(14),
    lineHeight: "20px",
  },
  caption: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: muiTheme.typography.pxToRem(12),
    lineHeight: "16px",
  },
  overline: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: muiTheme.typography.pxToRem(10),
    lineHeight: "16px",
  },
  subtitle1: undefined,
  subtitle2: undefined,
};

typography.button = {
  fontFamily: fontFamily,
  fontWeight: 600,
  fontStyle: "normal",
  fontSize: 14,
  lineHeight: "24px",
  textTransform: "initial",
};

const defaultTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 810,
      lg: 1200,
      xl: 1512,
    },
  },
  palette: {
    primary: {
      main: "#2A2A2A",
    },
    common: {
      white: "#FFFFFF",
      colorButton: "#F37021",
      orange: "rgba(243, 112, 33, 1)",
    },
    text: {
      primary: "#1B1F22",
      secondary: "#676E76",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        body1: {
          fontFamily: "inherit",
          fontWeight: "inherit",
          fontSize: "inherit",
          lineHeight: "inherit",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: (themeParams: any) => `
				${generalStyles(themeParams)}
				${overridesStyles(themeParams)}
        ${customStyles(themeParams)}
			`,
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          zIndex: 1350,
        },
      },
    },
  },
  typography: typography,
  zIndex: {
    bottomBar: 950,
    mobileStepper: 1000,
    fab: 1050,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
    backdrop: 1350,
  },
  app: {
    shadows: [
      "-2px 22px 25px rgba(110, 131, 149, 0.12)",
      "0px 4px 35px rgba(76, 153, 239, 0.25)",
      "0px 4px 35px rgba(184, 113, 154, 0.25)",
      "0px 4px 35px rgba(117, 205, 179, 0.25)",
      "0px 4px 35px rgba(227, 144, 65, 0.25)",
    ],
  },
});

export default defaultTheme;
