import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildPreOrderGuestAccessHref } from "@/utils/api/pre-order/pre-order-detail.util";
import {
  buildGuestAccessHref,
  buildGuestOrderAccessHref,
  readGuestOrderAccessTokenFromFragment,
  readStoredGuestOrderAccessToken,
  scrubGuestOrderAccessFragment,
} from "./guest-order-access.util";

describe("guest order access URL handling", () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.history.replaceState({}, "", "/don-hang/khach");
  });

  it("keeps the credential in the fragment instead of the path or query", () => {
    const href = buildGuestOrderAccessHref("goa_v1.secret-value");

    expect(href).toBe("/don-hang/khach#access=goa_v1.secret-value");
    expect(href.split("#")[0]).not.toContain("secret-value");
  });

  it("builds pre-order guest access on /don-hang/dat-truoc", () => {
    expect(buildPreOrderGuestAccessHref("gpa_v1.secret-value")).toBe("/don-hang/dat-truoc#access=gpa_v1.secret-value");
    expect(buildGuestAccessHref("/don-hang/dat-truoc", "gpa_v1.secret-value")).toBe("/don-hang/dat-truoc#access=gpa_v1.secret-value");
  });

  it("reads and scrubs the fragment without dropping the page path", () => {
    window.history.replaceState({}, "", "/don-hang/khach?from=email#access=goa_v1.secret-value");

    expect(readGuestOrderAccessTokenFromFragment()).toBe("goa_v1.secret-value");
    scrubGuestOrderAccessFragment();
    expect(window.location.pathname).toBe("/don-hang/khach");
    expect(window.location.search).toBe("?from=email");
    expect(window.location.hash).toBe("");
  });

  it("reads access token from pre-order detail hash", () => {
    window.history.replaceState({}, "", "/don-hang/dat-truoc#access=gpa_v1.DF08PxC24U2");
    expect(readGuestOrderAccessTokenFromFragment()).toBe("gpa_v1.DF08PxC24U2");
  });

  it("reads only the guest token from the checkout session snapshot", () => {
    sessionStorage.setItem("latest_order", JSON.stringify({ orderCode: "SV_26ABC123", guestOrderAccessToken: "goa_v1.secret-value" }));

    expect(readStoredGuestOrderAccessToken()).toBe("goa_v1.secret-value");
  });

  it("returns null for invalid session JSON", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    sessionStorage.setItem("latest_order", "not-json");

    expect(readStoredGuestOrderAccessToken()).toBeNull();
    warn.mockRestore();
  });
});
