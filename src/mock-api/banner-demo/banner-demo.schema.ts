import { z } from 'zod';
import { BannerLayout, MediaType } from '@/utils/api/banner/banner.enum';
import { BANNER_DEMO_BLOCKED_URI } from './banner-demo.constants';
const safeLink = z.string().refine(value => !BANNER_DEMO_BLOCKED_URI.test(value.replace(/[\u0000-\u0020\u007F]/g, '')), 'Đường dẫn không an toàn.');
const identifier = z.string().min(1);
const status = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);
const metadata = { id: identifier, createdAt: z.string(), updatedAt: z.string() };
export const bannerInputSchema = z.object({
  internalName: z.string().trim().min(1), mediaUrl: z.string().optional(), mediaMobileUrl: z.string().optional(),
  mediaLinkUrl: safeLink.optional(), mediaPosterUrl: z.string().optional(), mediaMobilePosterUrl: z.string().optional(),
  mediaFit: z.enum(['cover', 'contain', 'fill', 'none']).optional(), mediaType: z.enum(MediaType).optional(),
  layout: z.enum(BannerLayout).optional(), title: z.string().optional(), subtitle: z.string().optional(),
  titleColor: z.string().optional(), actionsLayout: z.enum(['STACK', 'INLINE']).optional(),
  actions: z.array(z.object({ actionType: z.string().optional(), actionTarget: safeLink.optional(),
    ctaText: z.string().optional(), ctaBg: z.string().optional(), ctaColor: z.string().optional() })).optional(),
  overlayOpacity: z.number().min(0).max(1).optional(), status: status.optional(),
});
export const bannerRecordSchema = bannerInputSchema.extend({
  ...metadata, mediaType: z.enum(MediaType), layout: z.enum(BannerLayout),
  actionsLayout: z.enum(['STACK', 'INLINE']), mediaFit: z.enum(['cover', 'contain', 'fill', 'none']),
  overlayOpacity: z.number(), status,
});
export const placementInputSchema = z.object({
  code: z.string().trim().regex(/^[a-zA-Z0-9_-]+$/).optional(), name: z.string().trim().min(1),
  displayType: z.enum(['GRID', 'SLIDER', 'DOUBLE_BANNER', 'CAROUSEL', 'POPUP']),
  platform: z.enum(['ALL', 'WEB', 'APP']).optional(), status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});
export const placementRecordSchema = placementInputSchema.extend({
  ...metadata, code: identifier, platform: z.enum(['ALL', 'WEB', 'APP']), status: z.enum(['ACTIVE', 'INACTIVE']),
});
export const layoutItemInputSchema = z.object({
  slotKey: identifier, bannerId: identifier, isActive: z.boolean().optional(), priority: z.number().optional(),
  displayMetadata: z.object({ x: z.number(), y: z.number(), width: z.number().positive(), height: z.number().positive(),
    order: z.number().optional(), slotType: z.string().optional(), childBannerIds: z.array(identifier).optional() }).optional(),
});
export const layoutInputSchema = z.object({
  name: z.string().min(1), status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  activeFrom: z.string().optional(), activeTo: z.string().optional(), note: z.string().optional(),
  items: z.array(layoutItemInputSchema),
});
export const layoutItemRecordSchema = layoutItemInputSchema.extend({ ...metadata,
  placementLayoutId: identifier, isActive: z.boolean(), priority: z.number(),
});
export const layoutRecordSchema = layoutInputSchema.extend({ ...metadata, placementId: identifier,
  revision: z.number(), status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'INACTIVE', 'ARCHIVED']),
  items: z.array(layoutItemRecordSchema),
});
export const bannerStoreSchema = z.object({ banners: z.array(bannerRecordSchema),
  placements: z.array(placementRecordSchema), layouts: z.array(layoutRecordSchema) });
export const bannerCommandSchema = z.discriminatedUnion('operation', [
  z.object({ operation: z.literal('getPlacementList'), query: z.object({
    code: z.string().optional(), status: z.string().optional(), search: z.string().optional(),
    page: z.number().optional(), take: z.number().optional(), isPagination: z.boolean().optional(),
  }).optional() }),
  z.object({ operation: z.literal('postPlacement'), data: placementInputSchema }),
  z.object({ operation: z.literal('patchPlacement'), id: identifier, data: placementInputSchema.partial() }),
  z.object({ operation: z.literal('deletePlacement'), id: identifier }),
  z.object({ operation: z.literal('getPlacementLayoutList'), placementId: identifier }),
  z.object({ operation: z.literal('getPlacementLayoutDetail'), placementId: identifier, layoutId: identifier }),
  z.object({ operation: z.literal('postPlacementLayout'), placementId: identifier, data: layoutInputSchema }),
  z.object({ operation: z.literal('patchPlacementLayoutItem'), placementId: identifier, layoutId: identifier,
    itemId: identifier, data: layoutItemInputSchema.partial() }),
  z.object({ operation: z.literal('postBanner'), data: bannerInputSchema }),
  z.object({ operation: z.literal('patchBanner'), id: identifier, data: bannerInputSchema.partial() }),
]);
export type BannerDemoStore = z.infer<typeof bannerStoreSchema>;
export type BannerDemoCommand = z.infer<typeof bannerCommandSchema>;
export type DemoPlacement = z.infer<typeof placementRecordSchema>;
export type DemoBanner = z.infer<typeof bannerRecordSchema>;
export type DemoLayout = z.infer<typeof layoutRecordSchema>;
