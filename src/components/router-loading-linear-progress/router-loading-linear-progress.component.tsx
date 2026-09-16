"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LinearProgress } from "@mui/material";
import useStyles from "./router-loading-linear-progress.styles";

/**
 * Thanh tiến trình (LinearProgress) hiển thị khi chuyển trang trong Next.js App Router.
 *
 * Cách hoạt động (App Router):
 * - Lắng nghe sự kiện thay đổi `pathname` qua `usePathname` hook.
 * - Khi pathname thay đổi: hiển thị thanh progress, chạy tăng giả lập, rồi ẩn sau 500ms.
 */
const RouterLoadingLinearProgress = () => {
  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const { classes } = useStyles();
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Route changed – show progress bar
    setProgress(0);
    setShowProgressBar(true);

    // Simulate progress increments
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 99) return old;
        return Math.min(old + Math.random() * 10, 99);
      });
    }, 100);

    // Complete and hide after 600ms
    const done = setTimeout(() => {
      clearInterval(timer);
      setProgress(100);
      hideTimerRef.current = setTimeout(() => setShowProgressBar(false), 400);
    }, 600);

    return () => {
      clearInterval(timer);
      clearTimeout(done);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [pathname]);

  if (!showProgressBar) return null;

  return <LinearProgress className={classes.root} variant="determinate" value={progress} />;
};

export default RouterLoadingLinearProgress;
