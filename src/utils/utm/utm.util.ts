import type { UtmData } from "./utm.interface";
import { UTM_COOKIE_MAX_AGE_SECONDS, UTM_COOKIE_NAME, UTM_PARAM_KEYS, UTM_STORAGE_KEY } from "./utm.constants";

let memoryUtmData: UtmData | null = null;
let isPersistentStorageBlocked = false;

export function formatUtmClickTime(date = new Date()): string {
  return date.toISOString();
}

function isStorageAccessError(error: unknown): boolean {
  if (!(error instanceof DOMException)) return false;
  return error.name === "SecurityError" || error.name === "QuotaExceededError";
}

function setUtmCookie(value: string): void {
  if (typeof document === "undefined") return;

  const encoded = encodeURIComponent(value);
  document.cookie = `${UTM_COOKIE_NAME}=${encoded}; path=/; max-age=${UTM_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function getUtmCookie(): string | null {
  if (typeof document === "undefined") return null;

  const prefix = `${UTM_COOKIE_NAME}=`;
  const match = document.cookie.split("; ").find((entry) => entry.startsWith(prefix));
  if (!match) return null;

  try {
    const raw = decodeURIComponent(match.slice(prefix.length));
    if (!raw) return null;
    return raw;
  } catch {
    return null;
  }
}

function deleteUtmCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${UTM_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
}

function parseUtmData(raw: string | null | undefined): UtmData | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<UtmData> & { utm_accessed_at?: string };
    if (!parsed.utm_source || typeof parsed.utm_source !== "string") return null;

    return {
      utm_source: parsed.utm_source,
      utm_medium: parsed.utm_medium ?? null,
      utm_campaign: parsed.utm_campaign ?? null,
      utm_term: parsed.utm_term ?? null,
      utm_content: parsed.utm_content ?? null,
      utm_click_time: parsed.utm_click_time ?? parsed.utm_accessed_at ?? formatUtmClickTime(),
    };
  } catch {
    return null;
  }
}

function persistUtmData(data: UtmData): void {
  memoryUtmData = data;
  if (isPersistentStorageBlocked || typeof window === "undefined") return;

  const serialized = JSON.stringify(data);

  try {
    window.localStorage.setItem(UTM_STORAGE_KEY, serialized);
    setUtmCookie(serialized);
  } catch (error) {
    if (isStorageAccessError(error)) {
      isPersistentStorageBlocked = true;
      return;
    }
    throw error;
  }
}

export function extractUtmFromSearchParams(searchParams: URLSearchParams): UtmData | null {
  const utmSource = searchParams.get("utm_source")?.trim();
  if (!utmSource) return null;

  return {
    utm_source: utmSource,
    utm_medium: searchParams.get("utm_medium")?.trim() || null,
    utm_campaign: searchParams.get("utm_campaign")?.trim() || null,
    utm_term: searchParams.get("utm_term")?.trim() || null,
    utm_content: searchParams.get("utm_content")?.trim() || null,
    utm_click_time: formatUtmClickTime(),
  };
}

export function extractUtmFromQueryString(queryString: string): UtmData | null {
  const normalized = queryString.startsWith("?") ? queryString.slice(1) : queryString;
  if (!normalized) return null;
  return extractUtmFromSearchParams(new URLSearchParams(normalized));
}

/** Last-click wins when `utm_source` is present on the URL. */
export function captureUtmFromQueryString(queryString: string): UtmData | null {
  const extracted = extractUtmFromQueryString(queryString);
  if (!extracted) return null;

  persistUtmData(extracted);
  return extracted;
}

export function readStoredUtmData(): UtmData | null {
  if (memoryUtmData) return memoryUtmData;
  if (typeof window === "undefined") return null;

  if (!isPersistentStorageBlocked) {
    try {
      const fromLocalStorage = parseUtmData(window.localStorage.getItem(UTM_STORAGE_KEY));
      if (fromLocalStorage) {
        memoryUtmData = fromLocalStorage;
        return fromLocalStorage;
      }
    } catch (error) {
      if (isStorageAccessError(error)) {
        isPersistentStorageBlocked = true;
      }
    }
  }

  const fromCookie = parseUtmData(getUtmCookie());
  if (fromCookie) {
    memoryUtmData = fromCookie;
    return fromCookie;
  }

  return null;
}

export function clearStoredUtmData(): void {
  memoryUtmData = null;

  if (typeof window === "undefined") return;

  if (!isPersistentStorageBlocked) {
    try {
      window.localStorage.removeItem(UTM_STORAGE_KEY);
    } catch (error) {
      if (isStorageAccessError(error)) {
        isPersistentStorageBlocked = true;
      }
    }
  }

  deleteUtmCookie();
}

export function hasUtmParamsInSearchParams(searchParams: URLSearchParams): boolean {
  return UTM_PARAM_KEYS.some((key) => searchParams.has(key));
}

export function removeUtmParamsFromSearchParams(searchParams: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(searchParams.toString());
  UTM_PARAM_KEYS.forEach((key) => next.delete(key));
  return next;
}

export function cleanUtmFromBrowserUrl(pathname: string, searchParams: URLSearchParams): void {
  if (typeof window === "undefined") return;
  if (!hasUtmParamsInSearchParams(searchParams)) return;

  const nextParams = removeUtmParamsFromSearchParams(searchParams);
  const query = nextParams.toString();
  const nextUrl = query ? `${pathname}?${query}` : pathname;

  window.history.replaceState(window.history.state, "", nextUrl);
}

/** Test helper — reset in-memory fallback state between tests. */
export function resetUtmStorageStateForTests(): void {
  memoryUtmData = null;
  isPersistentStorageBlocked = false;
}
