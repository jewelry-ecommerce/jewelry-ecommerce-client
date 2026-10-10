import { z } from "zod";
import { BlockTypeCode } from "@/utils/api/cms/cms.enum";

export const cmsDemoConfigSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  placementCode: z.string().optional(),
  header: z.object({ title: z.string().default(""), subtitle: z.string().default("") }).passthrough().optional(),
  display: z.object({ columns: z.number().int().min(1).max(6).optional(), limit: z.number().int().positive().optional() }).passthrough().optional(),
  items: z
    .array(
      z.object({
        imageUrl: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        actionText: z.string().optional(),
        actionUrl: z.string().optional(),
        label: z.string().optional(),
      }).passthrough(),
    )
    .optional(),
  dataSource: z.object({
    filterType: z.enum(["NONE", "CATEGORY", "COLLECTION", "CAMPAIGN", "NEW_ARRIVALS", "BEST_SELLERS", "MOST_FAVORITED", "MANUAL_PRODUCTS", "CMS_STOREFRONT"]),
    productIds: z.array(z.string()).optional(),
  }).passthrough().optional(),
}).passthrough();
export const cmsDemoBlockSchema = z.object({
  id: z.string().min(1),
  blockTypeCode: z.enum(BlockTypeCode),
  sortOrder: z.number().int().nonnegative(),
  isVisible: z.boolean(),
  config: cmsDemoConfigSchema,
});
export const cmsDemoPageSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
    revision: z.number().int().nonnegative(),
    locale: z.string().optional(),
    isActive: z.boolean().optional(),
    seo: z.object({
      title: z.string(),
      description: z.string(),
      keywords: z.string().optional(),
      imageUrl: z.string().optional(),
      canonicalUrl: z.string().optional(),
    }),
    blocks: z.array(cmsDemoBlockSchema),
  })
  .superRefine((page, context) => {
    if (new Set(page.blocks.map((block) => block.id)).size !== page.blocks.length) {
      context.addIssue({ code: "custom", message: "ID block không được trùng", path: ["blocks"] });
    }
    if (page.status === "PUBLISHED" && !page.blocks.some((block) => block.isVisible)) {
      context.addIssue({ code: "custom", message: "Cần ít nhất một block hiển thị trước khi publish", path: ["blocks"] });
    }
  });
export type CmsDemoPage = z.infer<typeof cmsDemoPageSchema>;
