export const COOKIE_CONSENT_KEY = "cookie_consent";
export const COOKIE_CONSENT_ACCEPTED = "accepted";
export const COOKIE_CONSENT_REJECTED = "rejected";

const COOKIE_CONSENT_REGEX = new RegExp("(^| )" + COOKIE_CONSENT_KEY + "=([^;]+)");

export type CookieConsentValue = typeof COOKIE_CONSENT_ACCEPTED | typeof COOKIE_CONSENT_REJECTED;

export type GoogleConsentStatus = "granted" | "denied";

export type GoogleConsentModeState = {
  ad_storage: GoogleConsentStatus;
  analytics_storage: GoogleConsentStatus;
  ad_user_data: GoogleConsentStatus;
  ad_personalization: GoogleConsentStatus;
};

export const GOOGLE_CONSENT_GRANTED_STATE: GoogleConsentModeState = {
  ad_storage: "granted",
  analytics_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
};

export const GOOGLE_CONSENT_DENIED_STATE: GoogleConsentModeState = {
  ad_storage: "denied",
  analytics_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};

export function normalizeCookieConsentValue(value?: string | null): CookieConsentValue | null {
  if (value === COOKIE_CONSENT_ACCEPTED || value === COOKIE_CONSENT_REJECTED) {
    return value;
  }
  return null;
}

export function getGoogleConsentModeState(consentValue?: CookieConsentValue | string | null): GoogleConsentModeState {
  return consentValue === COOKIE_CONSENT_ACCEPTED ? GOOGLE_CONSENT_GRANTED_STATE : GOOGLE_CONSENT_DENIED_STATE;
}

export function updateGoogleConsentMode(consentValue: CookieConsentValue): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];

  if (typeof window.gtag !== "function") {
    window.gtag = function (...args: GtagArgument[]) {
      window.dataLayer?.push(args);
    };
  }

  window.gtag("consent", "update", getGoogleConsentModeState(consentValue));
}

/** Gets the cookie consent value directly from `document.cookie`. Only run this in browser environment. */
export function getCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(COOKIE_CONSENT_REGEX);
  if (match) {
    const val = match[2];
    if (val === COOKIE_CONSENT_ACCEPTED || val === COOKIE_CONSENT_REJECTED) {
      return val as CookieConsentValue;
    }
  }
  return null;
}

/** Checks if the current cookie consent is accepted. Only run this in browser environment. */
export function isCookieConsentAccepted(): boolean {
  return getCookieConsent() === COOKIE_CONSENT_ACCEPTED;
}

/** Sets the cookie consent. */
export function setCookieConsent(value: CookieConsentValue): void {
  if (typeof window === "undefined") return;
  // 365 days
  const maxAge = 365 * 24 * 60 * 60;
  document.cookie = `${COOKIE_CONSENT_KEY}=${value}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
}
