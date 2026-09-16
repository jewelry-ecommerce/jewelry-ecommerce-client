import { describe, expect, it } from "vitest";
import {
  bucketCdnWidth,
  buildProductCardCdnTransform,
  DEFAULT_PRODUCT_CARD_CDN_TRANSFORM,
  isSameCdnTransform,
  PRODUCT_CARD_ASPECT_RATIO,
} from "./product-card-image-size.util";

describe("bucketCdnWidth", () => {
  it("rounds up to the nearest step", () => {
    expect(bucketCdnWidth(1)).toBe(25);
    expect(bucketCdnWidth(25)).toBe(25);
    expect(bucketCdnWidth(26)).toBe(50);
    expect(bucketCdnWidth(350)).toBe(350);
  });

  it("falls back to the step for invalid values", () => {
    expect(bucketCdnWidth(0)).toBe(25);
    expect(bucketCdnWidth(-10)).toBe(25);
    expect(bucketCdnWidth(Number.NaN)).toBe(25);
  });
});

describe("buildProductCardCdnTransform", () => {
  it("matches 1x design size when dpr is 1", () => {
    expect(buildProductCardCdnTransform(350, 1)).toEqual({
      width: 350,
      height: 440,
      quality: 95,
      format: "webp",
    });
  });

  it("defaults to retina 3x of the design card size", () => {
    expect(DEFAULT_PRODUCT_CARD_CDN_TRANSFORM).toEqual(buildProductCardCdnTransform(350, 3));
    expect(DEFAULT_PRODUCT_CARD_CDN_TRANSFORM.width).toBe(1050);
    expect(DEFAULT_PRODUCT_CARD_CDN_TRANSFORM.height).toBe(Math.round(1050 * PRODUCT_CARD_ASPECT_RATIO));
  });

  it("multiplies CSS width by devicePixelRatio for retina", () => {
    const transform = buildProductCardCdnTransform(168, 3);
    expect(transform.width).toBe(525);
    expect(transform.height).toBe(Math.round(525 * PRODUCT_CARD_ASPECT_RATIO));
    expect(transform.format).toBe("webp");
    expect(transform.quality).toBe(95);
  });

  it("caps devicePixelRatio at 3", () => {
    const at3 = buildProductCardCdnTransform(100, 3);
    const at4 = buildProductCardCdnTransform(100, 4);
    expect(at4).toEqual(at3);
  });

  it("buckets width so nearby sizes share one CDN URL", () => {
    const a = buildProductCardCdnTransform(326, 1);
    const b = buildProductCardCdnTransform(340, 1);
    expect(a).toEqual(b);
    expect(a.width).toBe(350);
  });
});

describe("isSameCdnTransform", () => {
  it("compares width height quality and format", () => {
    expect(isSameCdnTransform(DEFAULT_PRODUCT_CARD_CDN_TRANSFORM, { ...DEFAULT_PRODUCT_CARD_CDN_TRANSFORM })).toBe(true);
    expect(
      isSameCdnTransform(DEFAULT_PRODUCT_CARD_CDN_TRANSFORM, {
        ...DEFAULT_PRODUCT_CARD_CDN_TRANSFORM,
        width: 400,
      }),
    ).toBe(false);
  });
});
