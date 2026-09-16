const GTM_CONTAINER_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;

export function getGtmId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  if (!id) {
    return undefined;
  }
  if (!GTM_CONTAINER_ID_PATTERN.test(id)) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[GTM] NEXT_PUBLIC_GTM_ID must be a Tag Manager container ID (GTM-XXXX), not a GA4 Measurement ID (G-XXXX). Current value: "${id}"`,
      );
    }
    return undefined;
  }
  return id;
}

export function isGtmEnabled(): boolean {
  return Boolean(getGtmId());
}

export const scheduleTracking = (task: () => void): void => {
  if (typeof window === "undefined") return;
  const run = () => {
    try {
      task();
    } catch {
      /* analytics must not break the app */
    }
  };
  window.setTimeout(run, 0);
};
