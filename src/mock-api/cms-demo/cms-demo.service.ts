import type { PageResponse } from "@/utils/api/cms/cms.interface";
import { cmsDemoPageSchema, type CmsDemoPage } from "./cms-demo.schema";
import { readCmsDemoPages, writeCmsDemoPages } from "./cms-demo.repository";

export class CmsDemoError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}
let pendingWrite: Promise<unknown> = Promise.resolve();
export function saveCmsDemoPage(body: unknown): Promise<CmsDemoPage> {
  const operation = pendingWrite.then(() => persistPage(body));
  pendingWrite = operation.catch(() => undefined);
  return operation;
}
async function persistPage(body: unknown): Promise<CmsDemoPage> {
  const page = cmsDemoPageSchema.parse(body);
  const pages = await readCmsDemoPages();
  const existing = pages.find((entry) => entry.id === page.id);
  if (existing && existing.revision !== page.revision) {
    throw new CmsDemoError("CMS_CONFLICT", "Trang đã được cập nhật ở tab khác. Tải lại trước khi sửa.", 409);
  }
  if (pages.some((entry) => entry.slug === page.slug && entry.id !== page.id)) {
    throw new CmsDemoError("CMS_SLUG_TAKEN", "Slug đã được sử dụng bởi trang khác.", 409);
  }
  const saved = { ...page, revision: page.revision + 1 };
  await writeCmsDemoPages([...pages.filter((entry) => entry.id !== page.id), saved]);
  return saved;
}
export function toStorefrontPage(page: CmsDemoPage): PageResponse | null {
  if (page.status !== "PUBLISHED" || page.isActive === false) return null;
  return {
    page: {
      id: page.id,
      name: page.name,
      slug: page.slug,
      locale: page.locale || "vi-VN",
      seo: { ...page.seo, keywords: page.seo.keywords || null, canonicalUrl: page.seo.canonicalUrl || null },
    },
    // Envelope compatibility only; there is no layout authoring in this demo.
    layout: { id: "cms-demo", name: "CMS demo", targetDevice: "ALL", versionId: String(page.revision), versionName: "Demo" },
    blocks: page.blocks
      .filter((block) => block.isVisible)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(({ isVisible: _isVisible, ...block }) => ({ ...block, targetSegment: null })),
  };
}
export async function findCmsDemoPage(slug: string): Promise<CmsDemoPage | undefined> {
  return (await readCmsDemoPages()).find((page) => page.slug === slug);
}
