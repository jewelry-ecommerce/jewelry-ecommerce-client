/** User-facing OTP / rate-limit copy — dùng chung đăng ký, đăng nhập OTP, quên MK, tra cứu đơn, đổi SĐT. */

export const API_RATE_LIMIT_MESSAGE = "Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau.";

export const API_UNKNOWN_ERROR_MESSAGE = "Đã xảy ra lỗi không xác định!";

export const API_SERVER_ERROR_MESSAGE = "Hệ thống đang bận hoặc gián đoạn kết nối. Vui lòng thử lại sau.";

export const API_NETWORK_ERROR_MESSAGE = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.";

export const OTP_DAILY_LIMIT_MESSAGE = "Đã vượt quá số lần gửi OTP trong ngày. Quý khách vẫn có thể mua hàng mà không cần đăng nhập.";

/** Đổi SĐT / tra cứu đơn — vượt hạn gửi OTP trong ngày. */
export const OTP_DAILY_LIMIT_RETRY_24H_MESSAGE = "Quý khách đã vượt quá số lần gửi OTP trong ngày. Vui lòng thử lại sau 24 giờ.";

/** CTA trên màn OTP khi vượt hạn gửi trong ngày. */
export const OTP_DAILY_LIMIT_HOME_BUTTON_LABEL = "Quay Lại Trang Chủ";

/** Toast ngắn khi chỉ cần báo vượt hạn mức (không thay UI full-page). */
export const OTP_DAILY_LIMIT_TOAST_MESSAGE = "Đã vượt quá số lần gửi OTP trong ngày.";

/** Số lần gửi OTP tối đa mỗi ngày (mỗi lần ZNS + fallback SMS = 1 lượt). */
export const OTP_MAX_SEND_PER_DAY = 5;

export const OTP_RESEND_SECONDS = 60;

export const OTP_INVALID_CODE_MESSAGE = "Mã OTP không chính xác";

/** Số lần nhập sai OTP trước khi khóa ô nhập và bắt buộc gửi lại mã. */
export const OTP_MAX_WRONG_ATTEMPTS = 3;

export const OTP_MAX_WRONG_ATTEMPTS_MESSAGE = "Bạn đã nhập sai quá 3 lần. Vui lòng yêu cầu OTP mới";

export const OTP_INCOMPLETE_CODE_MESSAGE = "Vui lòng nhập đủ 6 chữ số.";

export function resolveOtpWrongAttemptError(isLocked: boolean, fallbackMessage = OTP_INVALID_CODE_MESSAGE): string {
  return isLocked ? OTP_MAX_WRONG_ATTEMPTS_MESSAGE : fallbackMessage;
}

export const OTP_SEND_FAILED_MESSAGE = "Không thể gửi mã OTP. Vui lòng nhấn Gửi lại hoặc thử sau.";

export const OTP_SEND_FAILED_SHORT_MESSAGE = "Không thể gửi OTP";

export const OTP_RESEND_FAILED_MESSAGE = "Không thể gửi lại mã OTP. Vui lòng thử lại.";

export const OTP_RESEND_FAILED_SHORT_MESSAGE = "Không thể gửi lại mã OTP.";

export const OTP_VERIFY_SUCCESS_MESSAGE = "Xác thực OTP thành công";

export const OTP_VERIFY_FAILED_MESSAGE = "Xác thực OTP thất bại";

export const OTP_RESEND_SUCCESS_MESSAGE = "Đã gửi lại mã OTP";

export const OTP_RESEND_BLOCKED_24H_MESSAGE = "Mã OTP sẽ được gửi lại sau 24h.";

export const OTP_RESEND_READY_MESSAGE = "Mã OTP đã sẵn sàng để gửi lại.";

export function getOtpResendCountdownMessage(seconds: number): string {
  return `Mã OTP sẽ được gửi lại sau ${seconds}s.`;
}
