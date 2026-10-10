import { beforeEach, describe, expect, it, vi } from "vitest";
import { BlockTypeCode } from "@/utils/api/cms/cms.enum";
import type { CmsDemoPage } from "./cms-demo.schema";
import { cmsDemoPageSchema } from "./cms-demo.schema";
import { saveCmsDemoPage, toStorefrontPage } from "./cms-demo.service";

const repository = vi.hoisted(() => ({ pages: [] as CmsDemoPage[] }));
vi.mock("./cms-demo.repository", () => ({
  readCmsDemoPages: async () => structuredClone(repository.pages),
  writeCmsDemoPages: async (pages: CmsDemoPage[]) => {
    repository.pages = structuredClone(pages);
  },
}));
const draft = (): CmsDemoPage => ({
  id: "demo-1",
  name: "Trang demo",
  slug: "demo-cms",
  status: "DRAFT",
  revision: 0,
  seo: { title: "Demo", description: "" },
  blocks: [
    {
      id: "b1",
      blockTypeCode: BlockTypeCode.INFO_CARDS,
      sortOrder: 1,
      isVisible: true,
      config: { header: { title: "Thông tin", subtitle: "" }, items: [{ title: "Demo" }] },
    },
  ],
});
beforeEach(() => {
  repository.pages = [];
});
describe("CMS admin to storefront", () => {
  it("persists drafts but does not expose them publicly", async () => {
    const page = await saveCmsDemoPage(draft());
    expect(page.revision).toBe(1);
    expect(repository.pages).toEqual([page]);
    expect(toStorefrontPage(page)).toBeNull();
  });
  it("publishes visible blocks in order and unpublishes", async () => {
    const page = draft();
    page.blocks.push({ ...page.blocks[0], id: "b2", sortOrder: 0 });
    page.blocks.push({ ...page.blocks[0], id: "hidden", isVisible: false });
    const saved = await saveCmsDemoPage({ ...page, status: "PUBLISHED" });
    expect(toStorefrontPage(saved)?.blocks.map((block) => block.id)).toEqual(["b2", "b1"]);
    expect(toStorefrontPage(await saveCmsDemoPage({ ...saved, status: "DRAFT" }))).toBeNull();
  });
  it("rejects duplicate slugs, stale updates and allows retry after an error", async () => {
    const page = await saveCmsDemoPage(draft());
    await expect(saveCmsDemoPage(draft())).rejects.toMatchObject({ code: "CMS_CONFLICT" });
    await expect(saveCmsDemoPage({ ...draft(), id: "other" })).rejects.toMatchObject({ code: "CMS_SLUG_TAKEN" });
    expect((await saveCmsDemoPage({ ...page, name: "Updated" })).name).toBe("Updated");
  });
  it("validates slug, duplicate block IDs and publish without visible blocks", () => {
    expect(cmsDemoPageSchema.safeParse({ ...draft(), slug: "../invalid" }).success).toBe(false);
    expect(cmsDemoPageSchema.safeParse({ ...draft(), blocks: [draft().blocks[0], draft().blocks[0]] }).success).toBe(false);
    expect(cmsDemoPageSchema.safeParse({ ...draft(), status: "PUBLISHED", blocks: [] }).success).toBe(false);
  });
  it("preserves source carousel and gallery settings through save and publish", async () => {
    const page = draft();
    page.blocks[0].config = {
      header: { title: "Source configuration", subtitle: "" },
      seeMore: { enabled: true, text: "Xem thêm", url: "/san-pham" },
      dataSource: { filterType: "CATEGORY", categorySlugs: ["nhan"], sort: "newest" },
      display: { columns: 3, mobileColumns: 1 },
      items: [{ imageUrl: "/api/demo-cms/media/example.png", actionType: "MIX_MATCH",
        mixMatchSkus: [{ variationId: "sku-test", sortOrder: 1 }] }],
    };
    const saved = await saveCmsDemoPage({ ...page, status: "PUBLISHED" });
    expect(saved.blocks[0].config).toEqual(page.blocks[0].config);
    expect(toStorefrontPage(saved)?.blocks[0].config).toEqual(page.blocks[0].config);
  });
});
