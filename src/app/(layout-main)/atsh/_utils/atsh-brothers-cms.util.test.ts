import { describe, expect, it } from "vitest";
import { extractAtshBrothersFromCmsPage, parseAtshBrothersJsonContent } from "./atsh-brothers-cms.util";
import { mockAtshBrothersData } from "@/app/(layout-main)/atsh/_utils/atsh-brothers.test-fixture";
import { BlockTypeCode } from "@/utils/api/cms/cms.enum";
import type { PageResponse } from "@/utils/api/cms/cms.interface";

describe("atsh-brothers-cms.util", () => {
  it("parses jsonContent from JSON_DISPLAY block", () => {
    const jsonContent = JSON.stringify(mockAtshBrothersData);
    const page = {
      page: {
        id: "1",
        name: "ATSH",
        slug: "atsh",
        locale: "vi-VN",
        seo: { title: null, description: null, keywords: null, canonicalUrl: null },
      },
      layout: { id: "1", name: "layout", targetDevice: "ALL", versionId: "1", versionName: "v1" },
      blocks: [
        {
          id: "block-1",
          blockTypeCode: BlockTypeCode.JSON_DISPLAY,
          sortOrder: 0,
          config: { jsonContent },
          targetSegment: null,
        },
      ],
    } satisfies PageResponse;

    const result = extractAtshBrothersFromCmsPage(page);
    expect(result?.brothers).toHaveLength(mockAtshBrothersData.brothers.length);
    expect(result?.meta.sharedContent?.discoverSectionTitle).toBe(mockAtshBrothersData.meta.sharedContent?.discoverSectionTitle);
  });

  it("returns null for invalid jsonContent", () => {
    expect(parseAtshBrothersJsonContent("")).toBeNull();
    expect(parseAtshBrothersJsonContent("{}")).toBeNull();
    expect(parseAtshBrothersJsonContent("{invalid")).toBeNull();
  });

  it("parses jsonContent with inline // comments (JSONC)", () => {
    const brother = mockAtshBrothersData.brothers[0];
    const jsonContent = `{
      "type": "atsh-brothers",
      "meta": ${JSON.stringify(mockAtshBrothersData.meta)},
      "brothers": [${JSON.stringify(brother)}]
    } // trailing comment`;

    const result = parseAtshBrothersJsonContent(jsonContent);
    expect(result?.brothers[0].slug).toBe(brother.slug);
  });

  it("ignores underscore comment keys in products when parsing", () => {
    const payload = {
      type: "atsh-brothers",
      meta: {},
      brothers: [
        {
          id: 1,
          slug: "demo",
          displayName: "Demo",
          roles: [],
          starName: null,
          images: { spiralCard: { filename: "a.png", path: "/a.png", alt: "A" } },
          content: {
            pageTitle: "T",
            introDescription: "D",
            fullLookTitle: "F",
            fullLookDescription: "F",
            galleryTitle: "G",
            galleryDescription: "G",
          },
          routes: { singerPage: "/atsh/singer/demo", spiralSection: "/bst-collab-tinhhasayhi#24-anh-trai" },
          products: [
            {
              _productSlug: "comment only",
              productSlug: "demo-product",
              _image: "comment only",
              image: "https://cdn.example.com/showcase.png",
            },
          ],
        },
      ],
    };

    const result = parseAtshBrothersJsonContent(JSON.stringify(payload));
    expect(result?.brothers[0].products).toEqual([
      {
        productSlug: "demo-product",
        image: "https://cdn.example.com/showcase.png",
      },
    ]);
  });

  it("normalizes meta.seo from JSON payload", () => {
    const payload = {
      type: "atsh-brothers",
      meta: {
        seo: {
          title: '  HEARTLOCKxTinh Hà "Say Hi" | BST Trang Sức Độc Quyền  ',
          keywords: " heartlock tinh hà ",
          descriptionPreOrder: " pre ",
          descriptionAfterPreOrder: " after ",
          preOrderEndsAt: " 2026-09-05T00:00:00+07:00 ",
          imageUrl: "  https://cdn.example.com/atsh-og.png  ",
        },
      },
      brothers: [mockAtshBrothersData.brothers[0]],
    };

    const result = parseAtshBrothersJsonContent(JSON.stringify(payload));
    expect(result?.meta.seo).toEqual({
      title: 'HEARTLOCKxTinh Hà "Say Hi" | BST Trang Sức Độc Quyền',
      keywords: "heartlock tinh hà",
      descriptionPreOrder: "pre",
      descriptionAfterPreOrder: "after",
      preOrderEndsAt: "2026-09-05T00:00:00+07:00",
      imageUrl: "https://cdn.example.com/atsh-og.png",
    });
  });
});
