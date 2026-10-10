import { CmsDemoError } from '../cms-demo/cms-demo.service';
import { entityMetadata } from './banner-demo.mutations';
import { findBanner, findLayout, findPlacement, enrichLayout } from './banner-demo.queries';
import { layoutRecordSchema, type BannerDemoStore, type BannerDemoCommand } from './banner-demo.schema';
type Command<T extends BannerDemoCommand['operation']> = Extract<BannerDemoCommand, { operation: T }>;
export function postPlacementLayout(store: BannerDemoStore, command: Command<'postPlacementLayout'>) {
  findPlacement(store, command.placementId);
  for (const entry of command.data.items) findBanner(store, entry.bannerId);
  if (new Set(command.data.items.map(entry => entry.slotKey)).size !== command.data.items.length) {
    throw new CmsDemoError('DUPLICATE_SLOT', 'Vị trí ô banner không được trùng.', 422);
  }
  const metadata = entityMetadata();
  const previous = store.layouts.filter(entry => entry.placementId === command.placementId);
  const layout = layoutRecordSchema.parse({ ...command.data, ...metadata, placementId: command.placementId,
    status: command.data.status || 'DRAFT', revision: Math.max(0, ...previous.map(entry => entry.revision)) + 1,
    items: command.data.items.map(entry => ({ ...entry, ...entityMetadata(), placementLayoutId: metadata.id,
      isActive: entry.isActive ?? true, priority: entry.priority ?? 0 })),
  });
  if (layout.status === 'ACTIVE') previous.forEach(entry => { if (entry.status === 'ACTIVE') entry.status = 'INACTIVE'; });
  store.layouts.push(layout);
  return enrichLayout(store, layout);
}
export function patchPlacementLayoutItem(store: BannerDemoStore, command: Command<'patchPlacementLayoutItem'>) {
  const layout = findLayout(store, command.placementId, command.layoutId);
  const item = layout.items.find(entry => entry.id === command.itemId);
  if (!item) throw new CmsDemoError('SLOT_NOT_FOUND', 'Không tìm thấy ô banner.', 404);
  if (command.data.bannerId) findBanner(store, command.data.bannerId);
  if (command.data.slotKey && layout.items.some(entry => entry.slotKey === command.data.slotKey && entry.id !== item.id)) {
    throw new CmsDemoError('DUPLICATE_SLOT', 'Vị trí ô banner không được trùng.', 422);
  }
  Object.assign(item, command.data, { updatedAt: new Date().toISOString() });
  layout.updatedAt = item.updatedAt;
  return enrichLayout(store, layout).items.find(entry => entry.id === command.itemId);
}
