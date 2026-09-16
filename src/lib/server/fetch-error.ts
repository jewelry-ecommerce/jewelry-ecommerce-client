/**
 * Node/undici often throws TypeError("fetch failed") with the real reason on `error.cause`.
 */
export const formatFetchFailureMessage = (error: unknown): string => {
  if (error == null) {
    return "Cannot connect to backend API";
  }

  const parts: string[] = [];

  const walk = (e: unknown, depth: number): void => {
    if (e == null || depth > 6) {
      return;
    }

    if (e instanceof AggregateError && Array.isArray(e.errors)) {
      for (const sub of e.errors) {
        walk(sub, depth + 1);
      }
      return;
    }

    if (e instanceof Error) {
      const msg = e.message?.trim();
      if (msg) {
        parts.push(msg);
      }
      const code = (e as NodeJS.ErrnoException).code;
      if (code && typeof code === "string") {
        parts.push(code);
      }
      walk((e as Error & { cause?: unknown }).cause, depth + 1);
    }
  };

  walk(error, 0);

  const seen = new Set<string>();
  const unique = parts.filter((p) => {
    if (seen.has(p)) {
      return false;
    }
    seen.add(p);
    return true;
  });

  return unique.length ? unique.join(" — ") : "Cannot connect to backend API";
};
