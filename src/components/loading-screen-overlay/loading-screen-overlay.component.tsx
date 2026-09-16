"use client";

import { useState, useRef, useEffect } from "react";

import eventBusService from "@/services/eventBus";
import { LOADING_SCREEN_OVERLAY_CLOSE, LOADING_SCREEN_OVERLAY_FIRE } from "@/utils/constants/eventBusCommon.constants";
import type { LoadingScreenOverlayOptions } from "@/services/loadingScreenOverlay";

import { Backdrop, CircularProgress, Typography } from "@mui/material";

import useStyles from "./loading-screen-overlay.styles";

/**
 * Overlay loading toàn trang (Backdrop + CircularProgress).
 *
 * Cách hoạt động:
 * - Lắng nghe 2 event qua EventBus:
 *   - `LOADING_SCREEN_OVERLAY_FIRE`: hiển thị overlay với nội dung tùy chỉnh.
 *   - `LOADING_SCREEN_OVERLAY_CLOSE`: ẩn overlay.
 * - Gọi qua `loadingScreenOverlayService.fire(message)` và `.close()` từ bất kỳ đâu.
 * - Giữ `resolve/reject` của Promise để hàm gọi có thể `await` kết quả nếu cần.
 *
 * Được mount 1 lần duy nhất trong `_app.tsx`.
 */
const LoadingScreenOverlay = () => {
  const { classes } = useStyles();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<LoadingScreenOverlayOptions>({
    content: "",
  });
  const resolveRef = useRef(null);
  const rejectRef = useRef(null);

  const fire = (data: LoadingScreenOverlayOptions, resolveFromPromise: any, rejectFromPromise: any) => {
    resolveRef.current = resolveFromPromise;
    rejectRef.current = rejectFromPromise;
    setOptions({
      ...options,
      ...data,
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
  };

  useEffect(() => {
    eventBusService.on(LOADING_SCREEN_OVERLAY_FIRE, fire);
    eventBusService.on(LOADING_SCREEN_OVERLAY_CLOSE, close);
    return () => {
      eventBusService.remove(LOADING_SCREEN_OVERLAY_FIRE, fire);
      eventBusService.remove(LOADING_SCREEN_OVERLAY_CLOSE, close);
    };
  }, []);

  return (
    <Backdrop className={classes.root} open={open}>
      <div className={classes.content}>
        <CircularProgress className={classes.loadingIcon} />
        {options.content && (
          <Typography fontWeight={700} color="common.white">
            {options.content}
          </Typography>
        )}
      </div>
    </Backdrop>
  );
};

export default LoadingScreenOverlay;
