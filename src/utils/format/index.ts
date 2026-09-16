import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

/** Storefront luôn hiển thị lịch theo giờ Việt Nam, không phụ thuộc timezone máy/SSR. */
export const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";

function parseInVietnam(date: Date | string) {
  if (typeof date === "string") {
    const trimmed = date.trim();
    // YYYY-MM-DD: giữ đúng ngày lịch, không lệch UTC → VN
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return dayjs.tz(trimmed, VIETNAM_TIMEZONE);
  }
  return dayjs(date).tz(VIETNAM_TIMEZONE);
}

export const formatMethodOtp = (method: string) => {
  switch (method) {
    case "SMS":
      return "SMS";
    case "CALL":
      return "Cuộc gọi";
    case "ZNS":
      return "Zalo";
    default:
      return method;
  }
};

export const formatDate = (date?: Date | string | null): string => {
  if (!date) return "";
  const d = parseInVietnam(date);
  return d.isValid() ? d.format("DD/MM/YYYY") : "";
};

/**
 * Chuẩn hóa value ngày hiển thị khi BE có thể trả ISO.
 * - `DD/MM/YYYY` (hoặc chuỗi bắt đầu bằng ngày) → giữ nguyên (BE đã display-ready)
 * - ISO datetime → DD/MM/YYYY theo Asia/Ho_Chi_Minh
 * - `YYYY-MM-DD` → ngày lịch VN, không +1 ngày giả định UTC 17:00
 */
export function toVietnamDisplayDate(value?: string | null): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  // BE fulfillmentSummary / notes đã format sẵn — không convert lại
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(trimmed)) return trimmed;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = dayjs.tz(trimmed, VIETNAM_TIMEZONE);
    return d.isValid() ? d.format("DD/MM/YYYY") : trimmed;
  }

  return formatDate(trimmed) || trimmed;
}

export const getOrderDate = (date?: Date | string | null): string => {
  if (!date) return "";
  const d = parseInVietnam(date);
  return d.isValid() ? d.format("DD/MM/YYYY | HH:mm") : "";
};

export const getDateISO = (date?: Date | string | null): string | undefined => {
  if (date == null) return undefined;

  if (typeof date === "string") {
    const trimmed = date.trim();
    if (!trimmed) return undefined;
    const parsed = parseInVietnam(trimmed);
    if (parsed.isValid()) return parsed.format("YYYY-MM-DD");
    return trimmed.includes("T") ? trimmed.split("T")[0] : trimmed;
  }

  const d = parseInVietnam(date);
  return d.isValid() ? d.format("YYYY-MM-DD") : undefined;
};

export const diffInMinutes = (date?: Date | string | null): number => {
  if (!date) return 0;
  return dayjs().diff(dayjs(date), "minute");
};

export const diffInHours = (date?: Date | string | null): number => {
  if (!date) return 0;
  return dayjs().diff(dayjs(date), "hour");
};

export const diffInDays = (date?: Date | string | null): number => {
  if (!date) return 0;
  return dayjs().diff(dayjs(date), "day");
};

export const resolveElapsedMs = (dateValue?: Date | string | null, now: number = Date.now()): number | null => {
  if (!dateValue) return null;
  const timestamp = new Date(dateValue).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(now - timestamp, 0);
};

export const getNowISO = (): string => {
  return dayjs().toISOString();
};

export const getSubstractISO = (value: number, unit: dayjs.ManipulateType): string => {
  return dayjs().subtract(value, unit).toISOString();
};

export const getCurrentYear = (): number => {
  return dayjs().tz(VIETNAM_TIMEZONE).year();
};
