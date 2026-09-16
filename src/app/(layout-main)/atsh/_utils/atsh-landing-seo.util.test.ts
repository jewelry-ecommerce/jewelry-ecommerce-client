import { describe, expect, it } from "vitest";
import {
  ATSH_LANDING_SEO_DEFAULTS,
  isAtshPreOrderPeriod,
  normalizeAtshLandingSeo,
  resolveAtshLandingSeo,
  resolveAtshLandingSeoDescription,
  resolveAtshLandingSeoImageUrl,
} from "./atsh-landing-seo.util";

describe("normalizeAtshLandingSeo", () => {
  it("returns undefined for empty object", () => {
    expect(normalizeAtshLandingSeo({})).toBeUndefined();
  });

  it("trims and keeps known fields", () => {
    expect(
      normalizeAtshLandingSeo({
        title: "  Title  ",
        keywords: " a, b ",
        descriptionPreOrder: " pre ",
        descriptionAfterPreOrder: " after ",
        preOrderEndsAt: " 2026-09-05T00:00:00+07:00 ",
        imageUrl: "  https://cdn.example.com/atsh-og.png  ",
      }),
    ).toEqual({
      title: "Title",
      keywords: "a, b",
      descriptionPreOrder: "pre",
      descriptionAfterPreOrder: "after",
      preOrderEndsAt: "2026-09-05T00:00:00+07:00",
      imageUrl: "https://cdn.example.com/atsh-og.png",
    });
  });
});

describe("isAtshPreOrderPeriod", () => {
  it("is true before preOrderEndsAt", () => {
    expect(isAtshPreOrderPeriod("2026-09-05T00:00:00+07:00", new Date("2026-09-04T23:59:59+07:00"))).toBe(true);
  });

  it("is false at and after preOrderEndsAt", () => {
    expect(isAtshPreOrderPeriod("2026-09-05T00:00:00+07:00", new Date("2026-09-05T00:00:00+07:00"))).toBe(false);
    expect(isAtshPreOrderPeriod("2026-09-05T00:00:00+07:00", new Date("2026-09-05T00:00:01+07:00"))).toBe(false);
  });

  it("is false for invalid or missing endsAt", () => {
    expect(isAtshPreOrderPeriod(undefined, new Date("2026-01-01T00:00:00+07:00"))).toBe(false);
    expect(isAtshPreOrderPeriod("not-a-date", new Date("2026-01-01T00:00:00+07:00"))).toBe(false);
  });
});

describe("resolveAtshLandingSeoDescription", () => {
  it("uses pre-order description before cutoff", () => {
    const result = resolveAtshLandingSeoDescription(
      {
        descriptionPreOrder: "PRE",
        descriptionAfterPreOrder: "AFTER",
        preOrderEndsAt: "2026-09-05T00:00:00+07:00",
      },
      new Date("2026-08-20T10:00:00+07:00"),
    );
    expect(result).toEqual({
      description: "PRE",
      isPreOrderPeriod: true,
      preOrderEndsAt: "2026-09-05T00:00:00+07:00",
    });
  });

  it("uses after-pre-order description from cutoff", () => {
    const result = resolveAtshLandingSeoDescription(
      {
        descriptionPreOrder: "PRE",
        descriptionAfterPreOrder: "AFTER",
        preOrderEndsAt: "2026-09-05T00:00:00+07:00",
      },
      new Date("2026-09-05T00:00:00+07:00"),
    );
    expect(result.description).toBe("AFTER");
    expect(result.isPreOrderPeriod).toBe(false);
  });

  it("falls back to defaults when seo fields are missing", () => {
    const before = resolveAtshLandingSeoDescription(undefined, new Date("2026-08-01T00:00:00+07:00"));
    expect(before.description).toBe(ATSH_LANDING_SEO_DEFAULTS.descriptionPreOrder);
    expect(before.isPreOrderPeriod).toBe(true);

    const after = resolveAtshLandingSeoDescription(undefined, new Date("2026-10-01T00:00:00+07:00"));
    expect(after.description).toBe(ATSH_LANDING_SEO_DEFAULTS.descriptionAfterPreOrder);
    expect(after.isPreOrderPeriod).toBe(false);
  });
});

describe("resolveAtshLandingSeo", () => {
  it("resolves full SEO payload from meta.seo", () => {
    const resolved = resolveAtshLandingSeo(
      {
        seo: {
          title: "Custom Title",
          keywords: "kw1 kw2",
          descriptionPreOrder: "PRE",
          descriptionAfterPreOrder: "AFTER",
          preOrderEndsAt: "2026-09-05T00:00:00+07:00",
          imageUrl: "https://cdn.example.com/share.png",
        },
      },
      new Date("2026-09-10T00:00:00+07:00"),
    );

    expect(resolved).toEqual({
      title: "Custom Title",
      keywords: "kw1 kw2",
      description: "AFTER",
      imageUrl: "https://cdn.example.com/share.png",
      preOrderEndsAt: "2026-09-05T00:00:00+07:00",
      isPreOrderPeriod: false,
    });
  });
});

describe("resolveAtshLandingSeoImageUrl", () => {
  it("keeps absolute CDN urls", () => {
    expect(resolveAtshLandingSeoImageUrl("https://cdn.example.com/a.png", "https://shop.example")).toBe("https://cdn.example.com/a.png");
  });

  it("prefixes site url for relative paths", () => {
    expect(resolveAtshLandingSeoImageUrl("/image/atsh/hero-bg-desktop-1.png", "https://shop.example/")).toBe(
      "https://shop.example/image/atsh/hero-bg-desktop-1.png",
    );
  });

  it("falls back to default image path", () => {
    expect(resolveAtshLandingSeoImageUrl(undefined, "https://shop.example")).toBe(
      `https://shop.example${ATSH_LANDING_SEO_DEFAULTS.imageUrl}`,
    );
  });
});
