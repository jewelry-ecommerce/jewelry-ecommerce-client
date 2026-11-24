import { afterEach, expect, test, vi } from "vitest";
import { normalizeCdnMediaUrl } from "./cdn-media.util";

afterEach(() => {
  vi.unstubAllEnvs();
});

test("leaves Cloudinary and data URLs unchanged", () => {
  expect(normalizeCdnMediaUrl("https://res.cloudinary.com/x/a.jpg")).toBe("https://res.cloudinary.com/x/a.jpg");
  expect(normalizeCdnMediaUrl("data:image/png;base64,aa")).toBe("data:image/png;base64,aa");
});

test("does not wrap absolute BE storefront URLs with Cloudinary fetch", () => {
  const absolute =
    "https://jewelry-ecommerce-be-java.onrender.com/api/v1/storefront/files/images/2026/11/b.jpg";
  expect(normalizeCdnMediaUrl(absolute)).toBe(absolute);
});

test("prefixes relative storefront paths with BE origin only", () => {
  vi.stubEnv("NEXT_PUBLIC_CONTENT_API_URL", "https://jewelry-ecommerce-be-java.onrender.com/api/v1");
  expect(normalizeCdnMediaUrl("/api/v1/storefront/files/images/2026/11/a.jpg")).toBe(
    "https://jewelry-ecommerce-be-java.onrender.com/api/v1/storefront/files/images/2026/11/a.jpg",
  );
});

test("returns relative path unchanged when BE origin env is missing", () => {
  vi.stubEnv("NEXT_PUBLIC_CONTENT_API_URL", "");
  vi.stubEnv("API_BE_URL", "");
  expect(normalizeCdnMediaUrl("/api/v1/storefront/files/images/a.jpg")).toBe("/api/v1/storefront/files/images/a.jpg");
});
