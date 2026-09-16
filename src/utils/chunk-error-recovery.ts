// Shared helpers for detecting and recovering from ChunkLoadError. Used by
// both the React ErrorBoundary (in-tree errors during render) and a global
// window listener (errors that escape React, e.g. async dynamic imports).
//
// Strategy: on first occurrence, hard-reload the page once so the browser
// fetches a fresh HTML/build manifest. The reload flag in sessionStorage
// prevents an infinite loop when the upstream is genuinely broken.

export const CHUNK_RELOAD_FLAG = "__chunk_reload_attempt__";
export const CHUNK_RELOAD_TTL_MS = 10_000;

export const isChunkLoadError = (error: unknown): boolean => {
  if (!error) {
    return false;
  }

  const err = error as { name?: string; message?: string };
  const name = err.name ?? "";
  const message = err.message ?? "";

  return (
    name === "ChunkLoadError" ||
    /Loading chunk [\w-]+ failed/i.test(message) ||
    /Loading CSS chunk [\w-]+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message)
  );
};

export const tryRecoverFromChunkError = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const previousAttempt = Number(window.sessionStorage.getItem(CHUNK_RELOAD_FLAG) || 0);
    const now = Date.now();

    if (previousAttempt && now - previousAttempt < CHUNK_RELOAD_TTL_MS) {
      return false;
    }

    window.sessionStorage.setItem(CHUNK_RELOAD_FLAG, String(now));
    window.location.reload();
    return true;
  } catch {
    window.location.reload();
    return true;
  }
};
