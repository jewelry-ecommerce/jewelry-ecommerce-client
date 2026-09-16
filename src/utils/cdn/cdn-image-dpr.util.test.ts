import { describe, expect, it } from "vitest";
import { CDN_IMAGE_MAX_TRANSFORM_HEIGHT, CDN_IMAGE_MAX_TRANSFORM_WIDTH, clampCdnImageTransformSize } from "./cdn-image.util";
import { CDN_IMAGE_MAX_DPR, clampCdnImageDevicePixelRatio, scaleCdnTransformByDevicePixelRatio } from "./cdn-image-dpr.util";

describe("clampCdnImageDevicePixelRatio", () => {
  it("clamps invalid and sub-1 values to 1", () => {
    expect(clampCdnImageDevicePixelRatio(0)).toBe(1);
    expect(clampCdnImageDevicePixelRatio(0.5)).toBe(1);
    expect(clampCdnImageDevicePixelRatio(Number.NaN)).toBe(1);
  });

  it("ceils fractional ratios and caps at max", () => {
    expect(clampCdnImageDevicePixelRatio(1.5)).toBe(2);
    expect(clampCdnImageDevicePixelRatio(2.625)).toBe(CDN_IMAGE_MAX_DPR);
    expect(clampCdnImageDevicePixelRatio(4)).toBe(CDN_IMAGE_MAX_DPR);
  });
});

describe("clampCdnImageTransformSize", () => {
  it("leaves transforms within max unchanged", () => {
    const transform = { width: 420, height: 620, quality: 95, format: "webp" as const };
    expect(clampCdnImageTransformSize(transform)).toEqual(transform);
  });

  it("scales down uniformly when width exceeds max", () => {
    const result = clampCdnImageTransformSize({
      width: 4536,
      height: 2412,
      quality: 95,
      format: "webp",
    });
    expect(result.width).toBeLessThanOrEqual(CDN_IMAGE_MAX_TRANSFORM_WIDTH);
    expect(result.height).toBeLessThanOrEqual(CDN_IMAGE_MAX_TRANSFORM_HEIGHT);
    expect(result.width).toBe(CDN_IMAGE_MAX_TRANSFORM_WIDTH);
    expect(result.height).toBe(Math.round(2412 * (CDN_IMAGE_MAX_TRANSFORM_WIDTH / 4536)));
  });
});

describe("scaleCdnTransformByDevicePixelRatio", () => {
  it("leaves 1x transforms unchanged when within max", () => {
    const transform = { width: 420, height: 620, quality: 95, format: "webp" as const };
    expect(scaleCdnTransformByDevicePixelRatio(transform, 1)).toEqual(transform);
  });

  it("scales width and height by dpr when result fits max", () => {
    expect(scaleCdnTransformByDevicePixelRatio({ width: 200, height: 200, quality: 95, format: "webp" }, 3)).toEqual({
      width: 600,
      height: 600,
      quality: 95,
      format: "webp",
    });
  });

  it("does not request sizes larger than CDN max after retina scale", () => {
    const result = scaleCdnTransformByDevicePixelRatio({ width: 1512, height: 804, quality: 95, format: "webp" }, 3);
    expect(result.width).toBeLessThanOrEqual(CDN_IMAGE_MAX_TRANSFORM_WIDTH);
    expect(result.height).toBeLessThanOrEqual(CDN_IMAGE_MAX_TRANSFORM_HEIGHT);
  });
});
