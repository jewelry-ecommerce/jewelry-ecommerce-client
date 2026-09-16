import { describe, expect, it } from "vitest";
import { mockAtshBrothersData } from "./atsh-brothers.test-fixture";
import {
  isAtshExploreInPageScrollHref,
  mapAtshBrothersToSpiralCards,
  normalizeAtshInternalHref,
  resolveAtshBrotherCollectionSlug,
  resolveAtshBrotherSpiralKey,
  resolveAtshCollabLogos,
  resolveAtshExploreCta,
  resolveAtshHeroContent,
  resolveAtshSingerDetailRedirectHref,
  resolveAtshSpiralCardHref,
  resolveAtshSpiralProductsCta,
  ATSH_COLLAB_LOGOS_DEFAULTS,
} from "./atsh-brothers.util";
import type { AtshBrothersData } from "./atsh-brothers.interface";

describe("resolveAtshBrotherSpiralKey", () => {
  it("returns spiralKey when set", () => {
    const brother = mockAtshBrothersData.brothers[0];
    const withKey = { ...brother, spiralKey: "quang-hung-masterd", slug: "anh-trai-quang-hung" };
    expect(resolveAtshBrotherSpiralKey(withKey)).toBe("quang-hung-masterd");
  });

  it("falls back to slug when spiralKey is empty", () => {
    const brother = { ...mockAtshBrothersData.brothers[0], spiralKey: "", slug: "quang-hung-masterd" };
    expect(resolveAtshBrotherSpiralKey(brother)).toBe("quang-hung-masterd");
  });
});

describe("resolveAtshBrotherCollectionSlug", () => {
  it("returns collectionSlug when set", () => {
    const brother = {
      ...mockAtshBrothersData.brothers[0],
      spiralKey: "quang-hung-masterd",
      collectionSlug: "collection-qhm",
    };
    expect(resolveAtshBrotherCollectionSlug(brother)).toBe("collection-qhm");
  });

  it("falls back to spiralKey when collectionSlug is absent", () => {
    const brother = { ...mockAtshBrothersData.brothers[0], spiralKey: "quang-hung-masterd", collectionSlug: undefined };
    expect(resolveAtshBrotherCollectionSlug(brother)).toBe("quang-hung-masterd");
  });

  it("falls back to slug when both collectionSlug and spiralKey are empty", () => {
    const brother = {
      ...mockAtshBrothersData.brothers[0],
      slug: "quang-hung-masterd",
      spiralKey: "",
      collectionSlug: undefined,
    };
    expect(resolveAtshBrotherCollectionSlug(brother)).toBe("quang-hung-masterd");
  });
});

describe("normalizeAtshInternalHref", () => {
  it("keeps absolute path and hash as-is", () => {
    expect(normalizeAtshInternalHref("/san-pham/foo")).toBe("/san-pham/foo");
    expect(normalizeAtshInternalHref("#section")).toBe("#section");
  });

  it("strips origin from full URL", () => {
    expect(normalizeAtshInternalHref("https://shop.example.com/san-pham/foo?x=1#y")).toBe("/san-pham/foo?x=1#y");
  });

  it("returns empty for blank input", () => {
    expect(normalizeAtshInternalHref("")).toBe("");
    expect(normalizeAtshInternalHref("   ")).toBe("");
    expect(normalizeAtshInternalHref(undefined)).toBe("");
  });
});

describe("resolveAtshSpiralCardHref", () => {
  const brother = mockAtshBrothersData.brothers[0];

  it("returns collectionPage in collection mode", () => {
    expect(resolveAtshSpiralCardHref(brother, "collection")).toBe(brother.routes.collectionPage);
  });

  it("returns singerPage in singer mode", () => {
    expect(resolveAtshSpiralCardHref(brother, "singer")).toBe(brother.routes.singerPage);
  });

  it("returns undefined in collection mode when collectionPage is missing", () => {
    const withoutCollection = {
      ...brother,
      routes: { singerPage: brother.routes.singerPage, spiralSection: brother.routes.spiralSection },
    };
    expect(resolveAtshSpiralCardHref(withoutCollection, "collection")).toBeUndefined();
  });

  it("normalizes full URL collectionPage to path", () => {
    const withFullUrl = {
      ...brother,
      routes: {
        ...brother.routes,
        collectionPage: "https://example.com/san-pham/bst-qhm",
      },
    };
    expect(resolveAtshSpiralCardHref(withFullUrl, "collection")).toBe("/san-pham/bst-qhm");
  });
});

describe("resolveAtshSingerDetailRedirectHref", () => {
  it("uses collectionPage when present", () => {
    expect(resolveAtshSingerDetailRedirectHref(mockAtshBrothersData.brothers[0])).toBe(
      mockAtshBrothersData.brothers[0].routes.collectionPage,
    );
  });

  it("falls back to /bst-collab-tinhhasayhi when brother or collectionPage is missing", () => {
    expect(resolveAtshSingerDetailRedirectHref(undefined)).toBe("/bst-collab-tinhhasayhi");
    const withoutCollection = {
      ...mockAtshBrothersData.brothers[0],
      routes: {
        singerPage: "/atsh/singer/x",
        spiralSection: "/bst-collab-tinhhasayhi#24-anh-trai",
      },
    };
    expect(resolveAtshSingerDetailRedirectHref(withoutCollection)).toBe("/bst-collab-tinhhasayhi");
  });
});

describe("mapAtshBrothersToSpiralCards", () => {
  it("includes brothers whose spiralKey matches ATSH_SPIRAL_BROTHER_SLUG_ORDER even when slug differs", () => {
    const brothersData: AtshBrothersData = {
      ...mockAtshBrothersData,
      brothers: mockAtshBrothersData.brothers.map((b) =>
        b.slug === "quang-hung-masterd" ? { ...b, slug: "anh-trai-quang-hung-masterd", spiralKey: "quang-hung-masterd" } : b,
      ),
    };

    const cards = mapAtshBrothersToSpiralCards(brothersData);
    expect(cards.some((c) => c.href?.includes("quang-hung-masterd") || c.href?.includes("collection="))).toBe(true);
  });

  it("hides brothers missing from ATSH_SPIRAL_BROTHER_SLUG_ORDER (spiralKey not in order)", () => {
    const brothersData: AtshBrothersData = {
      ...mockAtshBrothersData,
      brothers: [{ ...mockAtshBrothersData.brothers[0], spiralKey: "unknown-spiral-key", slug: "unknown-spiral-key" }],
    };

    const cards = mapAtshBrothersToSpiralCards(brothersData);
    expect(cards).toHaveLength(0);
  });

  it("links card to routes.collectionPage by default (nav target = collection)", () => {
    const collectionPage = "/san-pham/bst-anh-trai-quang-hung";
    const brothersData: AtshBrothersData = {
      ...mockAtshBrothersData,
      brothers: mockAtshBrothersData.brothers.map((b) =>
        b.slug === "quang-hung-masterd"
          ? {
              ...b,
              routes: { ...b.routes, collectionPage },
            }
          : b,
      ),
    };

    const cards = mapAtshBrothersToSpiralCards(brothersData);
    const qhmCard = cards.find((c) => c.href === collectionPage);
    expect(qhmCard).toBeDefined();
  });
});

describe("resolveAtshSpiralProductsCta", () => {
  it("uses CMS spiralProductsCta when present", () => {
    const data: AtshBrothersData = {
      ...mockAtshBrothersData,
      meta: {
        sharedContent: {
          spiralProductsCta: {
            label: "Xem BST collab",
            href: "/san-pham?collection=tinh-ha-say-hi",
          },
        },
      },
    };

    expect(resolveAtshSpiralProductsCta(data)).toEqual({
      label: "Xem BST collab",
      href: "/san-pham?collection=tinh-ha-say-hi",
    });
  });

  it("falls back to defaults when spiralProductsCta is absent", () => {
    const data: AtshBrothersData = {
      ...mockAtshBrothersData,
      meta: { sharedContent: {} },
    };

    expect(resolveAtshSpiralProductsCta(data)).toEqual({
      label: "Xem tất cả sản phẩm",
      href: "/san-pham",
    });
  });
});

describe("resolveAtshExploreCta", () => {
  it("uses CMS exploreCta when present", () => {
    const data: AtshBrothersData = {
      ...mockAtshBrothersData,
      meta: {
        sharedContent: {
          exploreCta: {
            label: "Khám phá BST",
            href: "/san-pham?collection=tinh-ha",
          },
        },
      },
    };

    expect(resolveAtshExploreCta(data)).toEqual({
      label: "Khám phá BST",
      href: "/san-pham?collection=tinh-ha",
    });
  });

  it("keeps href empty when exploreCta href is absent", () => {
    const data: AtshBrothersData = {
      ...mockAtshBrothersData,
      meta: { sharedContent: {} },
    };

    expect(resolveAtshExploreCta(data)).toEqual({
      label: "Khám phá ngay",
      href: "",
    });
  });
});

describe("isAtshExploreInPageScrollHref", () => {
  it("treats #24-anh-trai as in-page scroll", () => {
    expect(isAtshExploreInPageScrollHref("#24-anh-trai")).toBe(true);
    expect(isAtshExploreInPageScrollHref("/bst-collab-tinhhasayhi#24-anh-trai")).toBe(true);
    expect(isAtshExploreInPageScrollHref("/san-pham")).toBe(false);
    expect(isAtshExploreInPageScrollHref("")).toBe(false);
  });
});

describe("resolveAtshHeroContent", () => {
  it("uses CMS hero content when present", () => {
    const data: AtshBrothersData = {
      ...mockAtshBrothersData,
      meta: {
        sharedContent: {
          hero: {
            headline: "Custom Headline",
            title: "Custom Title",
            description: "Custom description",
          },
        },
      },
    };

    expect(resolveAtshHeroContent(data)).toEqual({
      headline: "Custom Headline",
      title: "Custom Title",
      description: "Custom description",
    });
  });

  it("returns empty object when hero is absent", () => {
    const data: AtshBrothersData = {
      ...mockAtshBrothersData,
      meta: { sharedContent: {} },
    };

    expect(resolveAtshHeroContent(data)).toEqual({});
  });
});

describe("resolveAtshCollabLogos", () => {
  it("returns defaults when sharedAssets is absent", () => {
    expect(resolveAtshCollabLogos(mockAtshBrothersData)).toEqual(ATSH_COLLAB_LOGOS_DEFAULTS);
  });

  it("uses collabLogos order and sizes from CMS", () => {
    const data: AtshBrothersData = {
      ...mockAtshBrothersData,
      meta: {
        ...mockAtshBrothersData.meta,
        sharedAssets: {
          collabLogos: [
            {
              id: "atsh",
              src: "https://cdn.example.com/atsh.png",
              alt: "Say Hi",
              width: 240,
              height: 192,
            },
            {
              id: "heartlock",
              src: "https://cdn.example.com/heartlock.svg",
              alt: "Heartlock",
              width: 232,
              height: 121,
            },
          ],
        },
      },
    };

    expect(resolveAtshCollabLogos(data).map((logo) => logo.id)).toEqual(["atsh", "heartlock"]);
    expect(resolveAtshCollabLogos(data)[0]).toMatchObject({
      src: "https://cdn.example.com/atsh.png",
      width: 240,
      height: 192,
    });
  });

  it("falls back to heartlockLogo/atshLogo strings when collabLogos is empty", () => {
    const data: AtshBrothersData = {
      ...mockAtshBrothersData,
      meta: {
        ...mockAtshBrothersData.meta,
        sharedAssets: {
          heartlockLogo: "https://cdn.example.com/hl.svg",
          atshLogo: "https://cdn.example.com/atsh.png",
          collabLogos: [],
        },
      },
    };

    const logos = resolveAtshCollabLogos(data);
    expect(logos[0].src).toBe("https://cdn.example.com/hl.svg");
    expect(logos[1].src).toBe("https://cdn.example.com/atsh.png");
    expect(logos[0].width).toBe(232);
    expect(logos[1].width).toBe(240);
  });

  it("skips invalid collabLogos entries", () => {
    const data: AtshBrothersData = {
      ...mockAtshBrothersData,
      meta: {
        ...mockAtshBrothersData.meta,
        sharedAssets: {
          collabLogos: [
            { src: "", width: 100, height: 50 },
            { src: "/image/atsh/ok.png", width: 240, height: 192 },
          ],
        },
      },
    };

    expect(resolveAtshCollabLogos(data)).toHaveLength(1);
    expect(resolveAtshCollabLogos(data)[0].src).toBe("/image/atsh/ok.png");
  });
});
