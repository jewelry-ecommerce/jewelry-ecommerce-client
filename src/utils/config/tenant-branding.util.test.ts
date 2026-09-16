import { describe, expect, it } from "vitest";
import { DEFAULT_PRODUCT_IMAGE_SRC, resolveProductDefaultImageSrc } from "./tenant-branding.util";

describe("resolveProductDefaultImageSrc", () => {
  it("falls back to default product image when env is unset", () => {
    expect(resolveProductDefaultImageSrc()).toBe(DEFAULT_PRODUCT_IMAGE_SRC);
  });
});
