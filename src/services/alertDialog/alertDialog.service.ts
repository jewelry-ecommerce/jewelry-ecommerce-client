import React from "react";
import { AppButtonProps } from "@/components/app-button/app-button.component";
import { eventBusService } from "@/services";
import { ALERT_DIALOG_FIRE } from "@/utils/constants/eventBusCommon.constants";

export type AlertDialogOptionsButton = {
  show?: boolean;
} & AppButtonProps;

export interface AlertDialogOptions {
  title?: React.ReactNode | string | null | number;
  content?: React.ReactNode | string | null | number;
  disabledActions?: boolean;
  actions?:
    | {
        payload?: any;
        name?: string;
        children?: React.ReactNode | string | null | number;
        buttonProps?: Omit<AppButtonProps, "children">;
      }[]
    | React.ReactNode
    | null;
  confirmButtonProps?: AlertDialogOptionsButton;
  cancelButtonProps?: AlertDialogOptionsButton;
}

/**
 * Kích hoạt hộp thoại xác nhận (Alert Dialog) thông qua EventBus.
 * - Nếu `message` là string: dùng làm nội dung (content), còn các tuỳ chọn lấy từ `options`.
 * - Nếu `message` là object `AlertDialogOptions`: dùng trực tiếp làm cấu hình dialog.
 * @returns Promise resolve khi người dùng bấm nút (trả về isConfirmed, name, payload),
 *          reject nếu bị huỷ.
 */
export const fire = (
  message?: string | AlertDialogOptions,
  options?: AlertDialogOptions,
): Promise<{
  isConfirmed?: boolean;
  name?: string;
  payload?: Object;
}> => {
  if (typeof message === "string") {
    const { content, ...otherOptions } = options || {};
    return eventBusService.asyncDispatch(ALERT_DIALOG_FIRE, {
      content: message,
      ...otherOptions,
    }) as Promise<{ isConfirmed?: boolean }>;
  }
  return eventBusService.asyncDispatch(ALERT_DIALOG_FIRE, message) as Promise<{
    isConfirmed?: boolean;
    name?: string;
    payload?: Object;
  }>;
};
