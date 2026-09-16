import packageJson from "@@/package.json";

export type FaroAppMeta = {
  name: string;
  namespace?: string;
  version?: string;
  environment?: string;
};

export type ResolvedFaroConfig = {
  url: string;
  app: FaroAppMeta;
};

const FARO_COLLECTOR_URL_PATTERN = /^https?:\/\/.+/i;

/** Grafana Faro app identity — cố định trong code, không cần env. */
const FARO_APP_NAME = "trading-fe-storefront";
const FARO_APP_NAMESPACE = "sevago-retail";

export function parseFaroCollectorUrl(raw: string | undefined): string | undefined {
  const url = raw?.trim();
  if (!url || !FARO_COLLECTOR_URL_PATTERN.test(url)) {
    return undefined;
  }
  return url;
}

export function getFaroCollectorUrl(): string | undefined {
  const url = parseFaroCollectorUrl(process.env.NEXT_PUBLIC_FARO_URL);
  if (!url && process.env.NEXT_PUBLIC_FARO_URL?.trim() && process.env.NODE_ENV === "development") {
    console.warn(
      `[Faro] NEXT_PUBLIC_FARO_URL must be an absolute http(s) URL (e.g. http://localhost:12347/collect). Current: "${process.env.NEXT_PUBLIC_FARO_URL.trim()}"`,
    );
  }
  return url;
}

export function getFaroAppMeta(): FaroAppMeta {
  const environment = process.env.NEXT_PUBLIC_VERCEL_ENV?.trim() || process.env.NODE_ENV || "development";

  return {
    name: FARO_APP_NAME,
    namespace: FARO_APP_NAMESPACE,
    version: packageJson.version,
    environment,
  };
}

export function isFaroEnabled(): boolean {
  return Boolean(getFaroCollectorUrl());
}

export function getResolvedFaroConfig(): ResolvedFaroConfig | undefined {
  const url = getFaroCollectorUrl();
  if (!url) {
    return undefined;
  }
  return { url, app: getFaroAppMeta() };
}

/** Observability must not block the main thread. */
export const scheduleFaro = (task: () => void): void => {
  if (typeof window === "undefined") {
    return;
  }
  const run = () => {
    try {
      task();
    } catch {
      /* observability must not break the app */
    }
  };
  window.setTimeout(run, 0);
};
