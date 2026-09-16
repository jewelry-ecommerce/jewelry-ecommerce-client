/** Chuẩn hóa SĐT VN theo BRD (brdLogin): chỉ số, +84 → 0… */
export const normalizePhoneDigits = (raw: string): string => {
  let s = raw.replace(/\s+/g, "").trim();
  if (s.startsWith("+84")) {
    s = `0${s.slice(3)}`;
  } else if (s.startsWith("84") && s.length >= 2) {
    s = `0${s.slice(2)}`;
  }
  return s.replace(/\D/g, "");
};

/**
 * BRD bước 1 SĐT:
 * - Bắt đầu 0: tối thiểu 10 chữ số (0 + 9 số)
 * - Không bắt đầu 0: tối thiểu 9 chữ số; sau chuẩn hóa thành 0xxxxxxxxx
 * - Dưới 9 hoặc trên 10 (sau chuẩn) → không hợp lệ
 */
export function validatePhoneBrd(raw: string): { ok: true; normalized: string } | { ok: false; message: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, message: "Vui lòng nhập số điện thoại" };
  }

  const digits = normalizePhoneDigits(trimmed);
  if (!digits) {
    return { ok: false, message: "Vui lòng nhập số điện thoại" };
  }

  if (digits.startsWith("0")) {
    if (digits.length < 10 || digits.length > 10) {
      return { ok: false, message: "Vui lòng nhập đúng số điện thoại" };
    }
    return { ok: true, normalized: digits };
  }

  if (digits.length < 9 || digits.length > 10) {
    return { ok: false, message: "Vui lòng nhập đúng số điện thoại" };
  }

  if (digits.length === 10) {
    return { ok: false, message: "Vui lòng nhập đúng số điện thoại" };
  }

  const normalized = `0${digits}`;
  if (normalized.length !== 10) {
    return { ok: false, message: "Vui lòng nhập đúng số điện thoại" };
  }

  return { ok: true, normalized };
}
