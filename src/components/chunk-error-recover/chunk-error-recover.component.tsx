"use client";

import { useEffect } from "react";

import { isChunkLoadError, tryRecoverFromChunkError } from "@/utils/chunk-error-recovery";

// Window-level safety net for ChunkLoadError that escapes the React tree
// (typically async dynamic imports triggered outside the render phase, e.g.
// from event handlers, useEffect, or webpack's runtime chunk fetch). The
// React ErrorBoundary handles errors thrown during render; this listener
// catches the leftovers.
export default function ChunkErrorRecover() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error) || isChunkLoadError({ name: "", message: event.message })) {
        if (tryRecoverFromChunkError()) {
          event.preventDefault();
        }
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        if (tryRecoverFromChunkError()) {
          event.preventDefault();
        }
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
