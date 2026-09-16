import { IOS_INPUT_MIN_FONT_SIZE_PX, IOS_INPUT_TOUCH_MEDIA } from "@/utils/constants/ios-input.constant";

/** Skip inputs with inline font-size (e.g. OTP 24px) — already >= 16px, no fix needed. */
const NO_INLINE_FONT_SIZE = ':not([style*="font-size"])';

const inputSelectors = () =>
  `input.MuiInputBase-input.MuiInputBase-input${NO_INLINE_FONT_SIZE}:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="hidden"]):not([type="image"]),
      textarea.MuiInputBase-input.MuiInputBase-input${NO_INLINE_FONT_SIZE},
      select.MuiInputBase-input.MuiInputBase-input${NO_INLINE_FONT_SIZE},
      input${NO_INLINE_FONT_SIZE}:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="hidden"]):not([type="image"]),
      textarea${NO_INLINE_FONT_SIZE},
      select${NO_INLINE_FONT_SIZE}`;

/**
 * Mobile iOS: bump inputs below 16px to 16px to prevent auto-zoom; skip inline >= 16px.
 *
 * TEMP(test): disabled in general.styles.ts — testing viewport user-scalable=no instead. Revert after QA.
 */
const iosInputStyles = () => {
  const minFontSize = `${IOS_INPUT_MIN_FONT_SIZE_PX}px`;

  // return `
  //   @supports (-webkit-touch-callout: none) {
  //     @media ${IOS_INPUT_TOUCH_MEDIA} {
  //       ${inputSelectors()} {
  //         font-size: max(${minFontSize}, 1em) !important;
  //       }
  //     }
  //   }
  // `;
  return "";
};

export default iosInputStyles;
