import type { AtshBrotherProduct, AtshBrotherRecord, AtshBrothersData } from "@/app/(layout-main)/atsh/_utils/atsh-brothers.interface";
import { normalizeAtshLandingSeo } from "./atsh-landing-seo.util";
import { stripJsonComments } from "./json-comments.util";
import { BlockTypeCode } from "@/utils/api/cms/cms.enum";
import type { PageResponse } from "@/utils/api/cms/cms.interface";

export const ATSH_BROTHERS_CMS_PAGE_SLUG = "atsh";
export const ATSH_BROTHERS_JSON_TYPE = "atsh-brothers";

export function isAtshBrothersCommentKey(key: string): boolean {
  return key.startsWith("_");
}

function readAtshBrotherStringField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeAtshBrotherProduct(raw: unknown): AtshBrotherProduct | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const productSlug = readAtshBrotherStringField(record, "productSlug");
  const image = readAtshBrotherStringField(record, "image");

  if (!productSlug || !image) {
    return null;
  }

  const shortDescription = readAtshBrotherStringField(record, "shortDescription");
  const imagePosition = record.imagePosition;
  const product: AtshBrotherProduct = {
    productSlug,
    image,
    ...(shortDescription ? { shortDescription } : {}),
  };

  if (imagePosition === "left" || imagePosition === "right") {
    product.imagePosition = imagePosition;
  }

  return product;
}

function normalizeAtshBrotherRecord(raw: AtshBrotherRecord): AtshBrotherRecord {
  // Cast to unknown first to safely access fields that may be absent in old CMS records.
  const rawRecord = raw as unknown as Record<string, unknown>;

  // spiralKey: CMS-stable key mapping spiral slot + image file.
  // Fallback to slug for records created before this field was added.
  const spiralKey = readAtshBrotherStringField(rawRecord, "spiralKey") || raw.slug;

  // collectionSlug: the BE collection slug used for catalog API calls.
  // Fallback to spiralKey (which defaults to slug if spiralKey is absent).
  const collectionSlug = readAtshBrotherStringField(rawRecord, "collectionSlug") || spiralKey;

  const fullLookProductSlug = readAtshBrotherStringField(rawRecord, "fullLookProductSlug");
  const cardImage = readAtshBrotherStringField(rawRecord, "cardImage");

  const routesRecord = raw.routes && typeof raw.routes === "object" ? (raw.routes as unknown as Record<string, unknown>) : null;
  const collectionPage = routesRecord ? readAtshBrotherStringField(routesRecord, "collectionPage") : "";

  const normalizedBase: Partial<AtshBrotherRecord> = {
    spiralKey,
    collectionSlug,
    ...(cardImage ? { cardImage } : {}),
    ...(fullLookProductSlug ? { fullLookProductSlug } : {}),
    ...(collectionPage && raw.routes
      ? {
          routes: {
            ...raw.routes,
            collectionPage,
          },
        }
      : {}),
  };

  if (!Array.isArray(raw.products)) {
    return { ...raw, ...normalizedBase };
  }

  const products = raw.products
    .map((product) => normalizeAtshBrotherProduct(product))
    .filter((product): product is AtshBrotherProduct => product !== null);

  return {
    ...raw,
    ...normalizedBase,
    products,
  };
}

function isAtshBrothersPayload(value: unknown): value is AtshBrothersData {
  if (!value || typeof value !== "object") return false;

  const record = value as AtshBrothersData;
  if (record.type && record.type !== ATSH_BROTHERS_JSON_TYPE) return false;
  if (!Array.isArray(record.brothers) || record.brothers.length === 0) return false;

  return true;
}

export function parseAtshBrothersJsonContent(jsonContent: string): AtshBrothersData | null {
  const trimmed = jsonContent.trim();
  if (!trimmed) return null;

  try {
    const parsed: unknown = JSON.parse(stripJsonComments(trimmed));
    if (!isAtshBrothersPayload(parsed)) return null;

    const rawMeta = parsed.meta ?? {};
    const seo = normalizeAtshLandingSeo((rawMeta as { seo?: unknown }).seo);

    return {
      type: ATSH_BROTHERS_JSON_TYPE,
      meta: {
        ...rawMeta,
        ...(seo ? { seo } : {}),
      },
      brothers: parsed.brothers.map((brother) => normalizeAtshBrotherRecord(brother)),
    };
  } catch {
    return null;
  }
}

export function extractAtshBrothersFromCmsPage(page: PageResponse): AtshBrothersData | null {
  const jsonBlock = page.blocks?.find((block) => {
    if (block.blockTypeCode === BlockTypeCode.JSON_DISPLAY) return true;
    return Boolean(block.config?.jsonContent?.trim());
  });

  const jsonContent = jsonBlock?.config?.jsonContent;
  if (!jsonContent) return null;

  return parseAtshBrothersJsonContent(jsonContent);
}

export function resolveAtshBrothersData(page: PageResponse | null | undefined): AtshBrothersData | null {
  if (!page) {
    return null;
  }

  return extractAtshBrothersFromCmsPage(page);
}
