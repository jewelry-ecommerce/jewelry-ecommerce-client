import { CtaAlignment } from "@/utils/api/cms/cms.enum";

export const CTA_MAX_BUTTONS = 3;
export const CTA_DEFAULTS = {
  textColor: "#0A0A0A",
  backgroundColor: "#FFFFFF",
  buttonTextColor: "#FFFFFF",
  borderColor: "transparent",
  borderRadius: 40,
} as const;
export const CTA_COLOR_PATTERN = /^(#[\da-f]{3}|#[\da-f]{6}|#[\da-f]{8}|transparent)$/i;
export const CTA_URL_PATTERN = /^(https?:\/\/[^\s]+|\/(?!\/)[^\s\\]*|[?#][^\s]*)$/i;
export const CTA_ALIGNMENT = {
  [CtaAlignment.LEFT]: { textAlign: "left", alignItems: "flex-start" },
  [CtaAlignment.CENTER]: { textAlign: "center", alignItems: "center" },
  [CtaAlignment.RIGHT]: { textAlign: "right", alignItems: "flex-end" },
} as const;