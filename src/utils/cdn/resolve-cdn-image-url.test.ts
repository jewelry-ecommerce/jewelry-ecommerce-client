import { describe, expect, it } from "vitest";
import { CDN_IMAGE_PRESETS } from "./cdn-image.presets";
import { resolveCdnImageUrl } from "./resolve-cdn-image-url";

const ORIGINAL = "https://media.sevagoretail.jewelry/tenant/media/abc/original.jpg";

describe("resolveCdnImageUrl", () => {
  it("applies retina-baked preset to original CDN urls", () => {
    const href = resolveCdnImageUrl({ src: ORIGINAL, preset: "categoryNav" });
    const expected = CDN_IMAGE_PRESETS.categoryNav;
    expect(href).toContain(`/w${expected.width}_h${expected.height}_q${expected.quality}.webp`);
    expect(expected.width).toBeGreaterThanOrEqual(160 * 2);
  });

  it("does not downgrade an already-transformed retina url when only preset is passed", () => {
    const retinaSrc = "https://media.sevagoretail.jewelry/tenant/media/abc/w480_h480_q90.webp";
    expect(resolveCdnImageUrl({ src: retinaSrc, preset: "categoryNav" })).toBe(retinaSrc);
  });

  it("allows explicit transform to replace an existing segment", () => {
    const retinaSrc = "https://media.sevagoretail.jewelry/tenant/media/abc/w480_h480_q90.webp";
    const href = resolveCdnImageUrl({
      src: retinaSrc,
      transform: { width: 200, height: 200, quality: 95, format: "webp" },
    });
    expect(href).toContain("/w200_h200_q95.webp");
  });

  it("applies retina banner preset larger than CSS 1× for fullscreen desktop", () => {
    const href = resolveCdnImageUrl({ src: ORIGINAL, preset: "bannerFullscreen" });
    const expected = CDN_IMAGE_PRESETS.bannerFullscreen;
    expect(href).toContain(`/w${expected.width}_h${expected.height}_`);
    expect(expected.width).toBeGreaterThan(1512);
  });
});
