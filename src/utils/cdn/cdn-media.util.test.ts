import { afterEach, expect, test, vi } from "vitest";
import { normalizeCdnMediaUrl } from "./cdn-media.util";

afterEach(() => {
  vi.unstubAllEnvs();
});

test("leaves Cloudinary and data URLs unchanged", () => {
  expect(normalizeCdnMediaUrl("https://res.cloudinary.com/x/a.jpg")).toBe("https://res.cloudinary.com/x/a.jpg");
  expect(normalizeCdnMediaUrl("data:image/png;base64,aa")).toBe("data:image/png;base64,aa");
});

test("prefixes local storefront file paths and wraps Cloudinary fetch", () => {
  vi.stubEnv("NEXT_PUBLIC_CONTENT_API_URL", "https://jewelry-ecommerce-be-java.onrender.com/api/v1");
  vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "dcvr6sf2");
  const absolute =
    "https://jewelry-ecommerce-be-java.onrender.com/api/v1/storefront/files/images/2026/11/a.jpg";
  expect(normalizeCdnMediaUrl("/api/v1/storefront/files/images/2026/11/a.jpg")).toBe(
    `https://res.cloudinary.com/dcvr6sf2/image/fetch/f_auto,q_auto,w_900/${encodeURIComponent(absolute)}`,
  );
});

test("wraps absolute BE storefront file URLs with Cloudinary fetch", () => {
  const absolute =
    "https://jewelry-ecommerce-be-java.onrender.com/api/v1/storefront/files/images/2026/11/b.jpg";
  expect(normalizeCdnMediaUrl(absolute)).toBe(
    `https://res.cloudinary.com/dcvr6sf2/image/fetch/f_auto,q_auto,w_900/${encodeURIComponent(absolute)}`,
  );
});

test("returns relative path unchanged when BE origin env is missing", () => {
  vi.stubEnv("NEXT_PUBLIC_CONTENT_API_URL", "");
  vi.stubEnv("API_BE_URL", "");
  expect(normalizeCdnMediaUrl("/api/v1/storefront/files/images/a.jpg")).toBe("/api/v1/storefront/files/images/a.jpg");
});
