import React from "react";
import eventBus from "@/services/eventBus";
import { LOADING_SCREEN_OVERLAY_CLOSE, LOADING_SCREEN_OVERLAY_FIRE } from "@/utils/constants/eventBusCommon.constants";

export interface LoadingScreenOverlayOptions {
  content: React.ReactNode;
}

/**
 * Hiển thị màn hình loading overlay thông qua EventBus.
 * - Nếu `message` là string: dùng làm nội dung hiển thị, các tuỳ chọn còn lại lấy từ `options`.
 * - Nếu `message` là object `LoadingScreenOverlayOptions`: dùng trực tiếp làm cấu hình.
 * @returns Promise resolve khi overlay sẵn sàng.
 */
export const fire = (message?: string | LoadingScreenOverlayOptions, options?: LoadingScreenOverlayOptions) => {
  if (typeof message === "string") {
    const { content, ...otherOptions } = options || {};
    return eventBus.asyncDispatch(LOADING_SCREEN_OVERLAY_FIRE, {
      content: message,
      ...otherOptions,
    });
  }
  return eventBus.asyncDispatch(LOADING_SCREEN_OVERLAY_FIRE, message);
};

/**
 * Ẩn / đóng màn hình loading overlay đang hiển thị.
 * @returns Promise resolve khi overlay đã được đóng.
 */
export const close = () => {
  return eventBus.asyncDispatch(LOADING_SCREEN_OVERLAY_CLOSE);
};
