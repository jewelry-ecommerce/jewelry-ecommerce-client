import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UTM_COOKIE_NAME, UTM_STORAGE_KEY } from "./utm.constants";
import {
  captureUtmFromQueryString,
  cleanUtmFromBrowserUrl,
  clearStoredUtmData,
  extractUtmFromSearchParams,
  readStoredUtmData,
  resetUtmStorageStateForTests,
} from "./utm.util";

describe("utm.util", () => {
  beforeEach(() => {
    resetUtmStorageStateForTests();
    localStorage.clear();
    document.cookie = `${UTM_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`;
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T07:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    resetUtmStorageStateForTests();
    localStorage.clear();
    document.cookie = `${UTM_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`;
  });

  it("extracts UTM params when utm_source is present", () => {
    const params = new URLSearchParams("utm_source=facebook&utm_medium=cpc&utm_campaign=summer_sale");
    expect(extractUtmFromSearchParams(params)).toEqual({
      utm_source: "facebook",
      utm_medium: "cpc",
      utm_campaign: "summer_sale",
      utm_term: null,
      utm_content: null,
      utm_click_time: "2026-06-19T07:00:00.000Z",
    });
  });

  it("returns null when utm_source is missing", () => {
    const params = new URLSearchParams("utm_medium=cpc");
    expect(extractUtmFromSearchParams(params)).toBeNull();
  });

  it("persists last-click UTM to localStorage and cookie", () => {
    captureUtmFromQueryString("?utm_source=facebook&utm_medium=cpc");
    captureUtmFromQueryString("?utm_source=zns&utm_medium=zns_msg");

    const stored = readStoredUtmData();
    expect(stored?.utm_source).toBe("zns");
    expect(stored?.utm_medium).toBe("zns_msg");
    expect(localStorage.getItem(UTM_STORAGE_KEY)).toContain('"utm_source":"zns"');
    expect(document.cookie).toContain(`${UTM_COOKIE_NAME}=`);
  });

  it("does not overwrite stored UTM on direct visits without utm_source", () => {
    captureUtmFromQueryString("?utm_source=facebook&utm_medium=cpc");
    captureUtmFromQueryString("");

    expect(readStoredUtmData()?.utm_source).toBe("facebook");
  });

  it("clears stored UTM data from memory, localStorage, and cookie", () => {
    captureUtmFromQueryString("?utm_source=facebook");
    clearStoredUtmData();

    expect(readStoredUtmData()).toBeNull();
    expect(localStorage.getItem(UTM_STORAGE_KEY)).toBeNull();

    const cookieEntry = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${UTM_COOKIE_NAME}=`))
      ?.slice(`${UTM_COOKIE_NAME}=`.length);
    expect(cookieEntry ? decodeURIComponent(cookieEntry) : null).toBeFalsy();
  });

  it("falls back to cookie when localStorage is empty", () => {
    const payload = JSON.stringify({
      utm_source: "zns",
      utm_medium: "zns_msg",
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
      utm_click_time: "2026-06-19T07:00:00.000Z",
    });
    document.cookie = `${UTM_COOKIE_NAME}=${encodeURIComponent(payload)}; path=/`;

    expect(readStoredUtmData()?.utm_source).toBe("zns");
  });

  it("migrates legacy utm_accessed_at to utm_click_time when reading stored data", () => {
    const payload = JSON.stringify({
      utm_source: "facebook",
      utm_medium: "cpc",
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
      utm_accessed_at: "2026-06-19T07:00:00.000Z",
    });
    document.cookie = `${UTM_COOKIE_NAME}=${encodeURIComponent(payload)}; path=/`;

    expect(readStoredUtmData()?.utm_click_time).toBe("2026-06-19T07:00:00.000Z");
  });

  it("uses in-memory fallback when persistent storage throws SecurityError", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });

    captureUtmFromQueryString("?utm_source=facebook&utm_medium=cpc");
    expect(readStoredUtmData()?.utm_source).toBe("facebook");

    setItemSpy.mockRestore();
  });

  it("removes utm params from browser URL via replaceState", () => {
    const replaceStateSpy = vi.spyOn(window.history, "replaceState").mockImplementation(() => undefined);
    const params = new URLSearchParams("utm_source=facebook&foo=bar");

    cleanUtmFromBrowserUrl("/san-pham", params);

    expect(replaceStateSpy).toHaveBeenCalledWith(window.history.state, "", "/san-pham?foo=bar");
    replaceStateSpy.mockRestore();
  });
});
