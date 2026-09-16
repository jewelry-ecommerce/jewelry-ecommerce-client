import React, { useEffect, useRef, useState } from "react";
import { eventBusService } from "@/services";
import { ALERT_DIALOG_FIRE } from "@/utils/constants/eventBusCommon.constants";
import { AlertDialogOptions } from "@/services/alertDialog";
import { isEmpty } from "@/utils/helpers/common";

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import AppButton from "@/components/app-button/app-button.component";

import { useEventCallback } from "@/hooks";

import useStyles from "./alert-dialog.styles";

const defaultConfirmButtonProps: Partial<AlertDialogOptions["confirmButtonProps"]> = {
  show: true,
  children: "Ok",
  color: "primary",
  variant: "contained",
};
const defaultCancelButtonProps: Partial<AlertDialogOptions["cancelButtonProps"]> = {
  show: true,
  children: "Cancel",
  color: "primary",
  variant: "outlined",
};

/**
 * Component dialog xác nhận (Confirm Dialog) toàn cục cho app.
 *
 * Cách hoạt động:
 * - Lắng nghe event `ALERT_DIALOG_FIRE` từ EventBus.
 * - Khi `alertDialogService.fire(...)` được gọi từ bất kỳ đâu trong app,
 *   component tự động hiển thị dialog với title/content/actions tùy chỉnh.
 * - Hỗ trợ 3 kiểu nút:
 *   1. Mặc định: Confirm + Cancel.
 *   2. Custom actions array (nhiều nút với payload riêng).
 *   3. Custom ReactNode hoàn toàn.
 * - Trả về Promise resolve với `{ isConfirmed, name, payload }` khi user bấm nút.
 *
 * Được mount 1 lần duy nhất trong `layout.tsx`.
 */
const AlertDialog = () => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<AlertDialogOptions>({
    title: "",
    content: "",
    actions: null,
    disabledActions: false,
    confirmButtonProps: {
      ...defaultConfirmButtonProps,
      children: defaultConfirmButtonProps.children,
    },
    cancelButtonProps: {
      ...defaultCancelButtonProps,
      children: defaultCancelButtonProps.children,
    },
  });

  const { title, content, disabledActions, actions, confirmButtonProps, cancelButtonProps } = options;

  const { show: confirmButtonPropsShow, ...otherConfirmButtonProps } = confirmButtonProps || {};
  const { show: cancelButtonPropsShow, ...otherCancelButtonProps } = cancelButtonProps || {};

  const resolveRef = useRef<Function | null>(null);
  const resolve = resolveRef.current;

  const handleClose = (params: any) => {
    setOpen(false);
    resolve && resolve(params);
    removePromiseMethod();
  };
  const removePromiseMethod = () => {
    resolveRef.current = null;
  };

  const updateOptions = useEventCallback((data: any, resolveFromPromise: any) => {
    resolveRef.current = resolveFromPromise;
    setOptions({
      ...options,
      ...data,
      confirmButtonProps: {
        ...defaultConfirmButtonProps,
        children: defaultConfirmButtonProps.children,
        ...data?.confirmButtonProps,
      },
      cancelButtonProps: {
        ...defaultCancelButtonProps,
        children: defaultCancelButtonProps.children,
        ...data?.cancelButtonProps,
      },
    });
    setOpen(true);
  });

  const { classes, cx } = useStyles();

  useEffect(() => {
    eventBusService.on(ALERT_DIALOG_FIRE, updateOptions);
    return () => {
      eventBusService.remove(ALERT_DIALOG_FIRE, updateOptions);
      removePromiseMethod();
    };
  }, []);

  return (
    <Dialog
      open={open}
      classes={{
        paper: classes.dialogPaper,
      }}
      maxWidth="sm"
      onClose={() => handleClose({ isConfirmed: false })}
    >
      {!isEmpty(title) && (
        <DialogTitle className={classes.dialogTitle} align="center">
          <Typography fontWeight={700} align="center" component="span">
            {title}
          </Typography>
        </DialogTitle>
      )}
      {!isEmpty(content) && (
        <DialogContent className={classes.dialogContent}>
          <Typography align="center">{content}</Typography>
        </DialogContent>
      )}
      {!disabledActions && (
        <DialogActions className={classes.dialogActions}>
          {Array.isArray(actions) ? (
            actions.map((action, actIndex) => (
              <AppButton
                key={actIndex}
                onClick={() => handleClose({ payload: action.payload, name: action.name })}
                color="primary"
                autoFocus
                {...action.buttonProps}
              >
                {action.children}
              </AppButton>
            ))
          ) : actions ? (
            actions
          ) : (
            <React.Fragment>
              {cancelButtonPropsShow && (
                <AppButton
                  {...otherCancelButtonProps}
                  className={cx(otherCancelButtonProps?.className && otherCancelButtonProps.className)}
                  onClick={() => handleClose({ isConfirmed: false })}
                />
              )}
              {confirmButtonPropsShow && (
                <AppButton
                  {...otherConfirmButtonProps}
                  className={cx(otherConfirmButtonProps?.className && otherConfirmButtonProps.className)}
                  onClick={() => handleClose({ isConfirmed: true })}
                />
              )}
            </React.Fragment>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AlertDialog;
