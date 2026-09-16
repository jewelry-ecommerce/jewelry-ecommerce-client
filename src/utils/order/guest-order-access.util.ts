const GUEST_ORDER_ACCESS_FRAGMENT_KEY = "access";
const LATEST_ORDER_STORAGE_KEY = "latest_order";

/** Build guest deep-link: path + `#access=<token>` (token không đưa lên query/path). */
export function buildGuestAccessHref(path: string, token: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedPath}#${GUEST_ORDER_ACCESS_FRAGMENT_KEY}=${encodeURIComponent(token)}`;
}

export const buildGuestOrderAccessHref = (token: string): string => buildGuestAccessHref("/don-hang/khach", token);

export const buildAbsoluteGuestOrderAccessUrl = (token: string): string => {
  if (typeof window === "undefined") return buildGuestOrderAccessHref(token);
  return `${window.location.origin}${buildGuestOrderAccessHref(token)}`;
};

export const buildAbsoluteGuestAccessUrl = (path: string, token: string): string => {
  if (typeof window === "undefined") return buildGuestAccessHref(path, token);
  return `${window.location.origin}${buildGuestAccessHref(path, token)}`;
};

export const readGuestOrderAccessTokenFromFragment = (): string | null => {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
  return new URLSearchParams(hash).get(GUEST_ORDER_ACCESS_FRAGMENT_KEY)?.trim() || null;
};

export const scrubGuestOrderAccessFragment = (): void => {
  if (typeof window === "undefined" || !window.location.hash) return;
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
};

export const readStoredGuestOrderAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(LATEST_ORDER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { guestOrderAccessToken?: unknown };
    return typeof parsed.guestOrderAccessToken === "string" ? parsed.guestOrderAccessToken : null;
  } catch {
    return null;
  }
};
