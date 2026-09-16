import { describe, expect, it } from "vitest";
import { DEFAULT_FAVICON_SRC, DEFAULT_STOREFRONT_LOGO_SRC, resolveStorefrontLogoSrcMap, resolveStorefrontLogoUrl } from "./cms-logo.util";

describe("cms-logo.util", () => {
  it("falls back to default storefront logo when CMS and tenant branding are empty", () => {
    expect(resolveStorefrontLogoUrl("")).toBe(DEFAULT_STOREFRONT_LOGO_SRC);
    expect(resolveStorefrontLogoUrl(undefined, "")).toBe(DEFAULT_STOREFRONT_LOGO_SRC);
  });

  it("builds logo map with safe defaults when all CMS logo types are missing", () => {
    expect(resolveStorefrontLogoSrcMap({}, "")).toEqual({
      HEADER: DEFAULT_STOREFRONT_LOGO_SRC,
      FOOTER: DEFAULT_STOREFRONT_LOGO_SRC,
      AUTH: DEFAULT_STOREFRONT_LOGO_SRC,
      FAVICON: DEFAULT_FAVICON_SRC,
    });
  });

  it("builds logo map from CMS API response object format", () => {
    const apiResponse = {
      HEADER: { logoUrl: "https://cdn/header.svg", logoTheme: null, logoTargetUrl: "/" },
      AUTH: { logoUrl: "https://cdn/auth.svg", logoTheme: null, logoTargetUrl: "/" },
      FOOTER: { logoUrl: "https://cdn/footer.svg", logoTheme: null, logoTargetUrl: "/" },
      FAVICON: { logoUrl: "https://cdn/favicon.svg", logoTheme: null, logoTargetUrl: "/" },
    };
    expect(resolveStorefrontLogoSrcMap(apiResponse, "")).toEqual({
      HEADER: "https://cdn/header.svg",
      AUTH: "https://cdn/auth.svg",
      FOOTER: "https://cdn/footer.svg",
      FAVICON: "https://cdn/favicon.svg",
    });
  });
});
