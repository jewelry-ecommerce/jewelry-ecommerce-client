import { Theme } from "@mui/material/styles";

const styleOverrides = (theme: Theme) => {
  return `
		.Toastify__toast-container {
			font-family: ${theme.typography.body1.fontFamily};
			font-size: ${theme.typography.body1.fontSize};
			line-height: ${theme.typography.body1.lineHeight};
			font-weight: ${theme.typography.body1.fontWeight};
			color: ${theme.palette.text.primary};
			z-index: ${theme.zIndex.snackbar};
		}
	`;
};

export default styleOverrides;
