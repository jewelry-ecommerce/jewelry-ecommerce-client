import { Theme } from "@mui/material/styles";

// TEMP(test): iOS input 16px bump — disabled while testing viewport user-scalable=no. Revert after QA.
// import iosInputStyles from "./ios-input.styles";

const styleOverrides = (_: Theme) => {
  // return `${iosInputStyles()}`;
  return "";
};

export default styleOverrides;
