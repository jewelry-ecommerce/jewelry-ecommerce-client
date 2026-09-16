import { Theme } from "@mui/material/styles";
import { keyframes } from "tss-react";

const styleOverrides = (theme: Theme) => {
  return `
    .app-glowLightBorder {
      --angle: 0deg;
      border: 0.5px solid;
      border-image: linear-gradient(var(--angle), #FFFFFF -5.74%, rgba(255, 255, 255, 0) 11.29%, #FFFFFF 33.03%, rgba(255, 255, 255, 0) 60.04%, #FFFFFF 84.13%, rgba(255, 255, 255, 0) 107.03%) 1;
      position: relative;
      @property --angle {
        syntax: "<angle>";
        initial-value: 0deg;
        inherits: false;
      }
    }
    
    .app-glowLightBorder-blurBackground::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(180deg, #313131 0%, rgba(0, 0, 0, 0) 100%);
      filter: drop-shadow(0px 2px 40px rgba(0, 0, 0, 0.5));
    }

    .app-glowLightBorder-effect {
      animation: borderLight-rotating 6s linear infinite;
    }

    @keyframes borderLight-rotating {
      from {
        --angle: 0deg;
      }
      to {
        --angle: 360deg;
      }
    }
	`;
};

export default styleOverrides;
