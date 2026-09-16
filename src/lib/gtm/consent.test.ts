import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_ACCEPTED,
  COOKIE_CONSENT_REJECTED,
  GOOGLE_CONSENT_GRANTED_STATE,
  GOOGLE_CONSENT_DENIED_STATE,
  normalizeCookieConsentValue,
  getGoogleConsentModeState,
  updateGoogleConsentMode,
  getCookieConsent,
  isCookieConsentAccepted,
  setCookieConsent,
} from "./consent";

describe("gtm/consent", () => {
  beforeEach(() => {
    vi.stubGlobal("document", {
      cookie: "",
    });
    vi.stubGlobal("window", {
      dataLayer: undefined,
      gtag: undefined,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("normalizeCookieConsentValue", () => {
    it("should return accepted when value is accepted", () => {
      expect(normalizeCookieConsentValue("accepted")).toBe(COOKIE_CONSENT_ACCEPTED);
    });

    it("should return rejected when value is rejected", () => {
      expect(normalizeCookieConsentValue("rejected")).toBe(COOKIE_CONSENT_REJECTED);
    });

    it("should return null for invalid values", () => {
      expect(normalizeCookieConsentValue("invalid")).toBeNull();
      expect(normalizeCookieConsentValue("")).toBeNull();
      expect(normalizeCookieConsentValue(null)).toBeNull();
      expect(normalizeCookieConsentValue(undefined)).toBeNull();
    });
  });

  describe("getGoogleConsentModeState", () => {
    it("should return GRANTED_STATE for accepted", () => {
      expect(getGoogleConsentModeState("accepted")).toEqual(GOOGLE_CONSENT_GRANTED_STATE);
    });

    it("should return DENIED_STATE for rejected or other values", () => {
      expect(getGoogleConsentModeState("rejected")).toEqual(GOOGLE_CONSENT_DENIED_STATE);
      expect(getGoogleConsentModeState("invalid")).toEqual(GOOGLE_CONSENT_DENIED_STATE);
      expect(getGoogleConsentModeState(null)).toEqual(GOOGLE_CONSENT_DENIED_STATE);
      expect(getGoogleConsentModeState()).toEqual(GOOGLE_CONSENT_DENIED_STATE);
    });
  });

  describe("updateGoogleConsentMode", () => {
    it("should initialize dataLayer and gtag and push update if gtag is undefined", () => {
      updateGoogleConsentMode("accepted");
      expect(Array.isArray(window.dataLayer)).toBe(true);
      expect(typeof window.gtag).toBe("function");

      // Verify what was pushed
      expect(window.dataLayer![0]).toEqual(["consent", "update", GOOGLE_CONSENT_GRANTED_STATE]);
    });

    it("should call existing gtag if it is defined", () => {
      const mockGtag = vi.fn();
      window.gtag = mockGtag;
      updateGoogleConsentMode("rejected");

      expect(mockGtag).toHaveBeenCalledWith("consent", "update", GOOGLE_CONSENT_DENIED_STATE);
      expect(window.dataLayer).toEqual([]); // Initialized but empty because mock doesn't push
    });
  });

  describe("getCookieConsent", () => {
    it("should return null if no cookie is set", () => {
      document.cookie = "";
      expect(getCookieConsent()).toBeNull();
    });

    it("should return accepted if cookie is accepted", () => {
      document.cookie = `${COOKIE_CONSENT_KEY}=accepted`;
      expect(getCookieConsent()).toBe(COOKIE_CONSENT_ACCEPTED);
    });

    it("should return rejected if cookie is rejected", () => {
      document.cookie = `other_cookie=value; ${COOKIE_CONSENT_KEY}=rejected; another=123`;
      expect(getCookieConsent()).toBe(COOKIE_CONSENT_REJECTED);
    });

    it("should return null if cookie value is invalid", () => {
      document.cookie = `${COOKIE_CONSENT_KEY}=invalid`;
      expect(getCookieConsent()).toBeNull();
    });
  });

  describe("isCookieConsentAccepted", () => {
    it("should return true if cookie is accepted", () => {
      document.cookie = `${COOKIE_CONSENT_KEY}=accepted`;
      expect(isCookieConsentAccepted()).toBe(true);
    });

    it("should return false if cookie is not accepted", () => {
      document.cookie = `${COOKIE_CONSENT_KEY}=rejected`;
      expect(isCookieConsentAccepted()).toBe(false);

      document.cookie = "";
      expect(isCookieConsentAccepted()).toBe(false);
    });
  });

  describe("setCookieConsent", () => {
    it("should set the cookie correctly with max-age, path, SameSite and Secure", () => {
      setCookieConsent("accepted");
      expect(document.cookie).toContain(`${COOKIE_CONSENT_KEY}=accepted; path=/; max-age=31536000; SameSite=Lax; Secure`);
    });
  });
});
