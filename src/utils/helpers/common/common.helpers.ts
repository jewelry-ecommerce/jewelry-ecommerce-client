import dayjs from "dayjs";
import { toast } from "react-toastify";
import _round from "lodash/round";
import { MediaType } from "@/utils/api/banner/banner.enum";

export const isMobile = () => {
  return typeof window !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = () => {
  return (
    typeof window !== "undefined" &&
    (["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) ||
      navigator.userAgent.includes("Mac"))
  );
};

export const isEmpty = (val: any) => {
  return ["", null, undefined].includes(val) || (Array.isArray(val) && val.length === 0);
};

export const isNumber = (number: any) => {
  return !isEmpty(number) && !isNaN(Number(number));
};

export const formatNumber = (number?: number | string, options?: Intl.NumberFormatOptions) => {
  if (!isNumber(number)) return number;
  const locale = window.NextPublic.lang;
  return new Intl.NumberFormat(locale, options).format(Number(number));
};

export const decodeHTML = (input: string) => {
  const e = document.createElement("textarea");
  e.innerHTML = input;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue || "";
};

export const formatFormData = (data: Object) => {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === "undefined") return;
    if (Array.isArray(value) && value.some((v) => v instanceof File)) {
      fd.append(`${key}[]`, value as any);
    } else {
      fd.append(key, typeof value === "string" || value instanceof File ? value : JSON.stringify(value));
    }
  });
  return fd;
};

export const checkAndNoticeToastError = (error: string, loading: boolean) => {
  if (!!error && !loading) toast.error(error);
};

export const parseStyles = (stringStyles: string | React.CSSProperties) =>
  typeof stringStyles === "string"
    ? stringStyles.split(";").reduce((acc, style) => {
        const colonPosition = style.indexOf(":");

        if (colonPosition === -1) {
          return acc;
        }

        const camelCaseProperty = style
            .substr(0, colonPosition)
            .trim()
            .replace(/^-ms-/, "ms-")
            .replace(/-./g, (c) => c.substr(1).toUpperCase()),
          value = style.substr(colonPosition + 1).trim();

        return value ? { ...acc, [camelCaseProperty]: value } : acc;
      }, {})
    : {};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const dayjsLocale = () => dayjs.locale(typeof window === "undefined" ? "en" : window.NextPublic.lang);

export const formatFileSize = (fileSize: number) => {
  return fileSize > 1000000 ? `${_round(fileSize / 1000000, 1)}MB` : `${_round(fileSize / 1000, 1)}KB`;
};

export const getMediaType = (src?: string, type?: MediaType): MediaType => {
  if (type) return type;
  if (!src) return MediaType.IMAGE;

  const cleanSrc = src.split("?")[0].split("#")[0];
  const extension = cleanSrc.split(".").pop()?.toLowerCase();

  const videoExtensions = ["mp4", "webm", "ogg", "mov"];
  const gifExtensions = ["gif"];

  if (!extension) return MediaType.IMAGE;
  if (videoExtensions.includes(extension)) return MediaType.VIDEO;
  if (gifExtensions.includes(extension)) return MediaType.GIF;

  return MediaType.IMAGE;
};

// getMediaType('image.jpg?width=500')  => IMAGE
// getMediaType('video.mp4?token=abc')  => VIDEO
// getMediaType('animation.gif?token=abc')  => GIF

export const parsePriceValue = (value?: string | null): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
