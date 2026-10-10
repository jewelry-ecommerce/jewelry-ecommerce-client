import { randomUUID } from 'node:crypto';
import { CmsDemoError } from '../cms-demo/cms-demo.service';
import { BANNER_DEMO_DEFAULTS } from './banner-demo.constants';
import { bannerRecordSchema, placementRecordSchema, type BannerDemoStore, type BannerDemoCommand } from './banner-demo.schema';
import { findBanner, findPlacement } from './banner-demo.queries';
type Command<T extends BannerDemoCommand['operation']> = Extract<BannerDemoCommand, { operation: T }>;
export function entityMetadata() { const now = new Date().toISOString(); return { id: randomUUID(), createdAt: now, updatedAt: now }; }
export function postPlacement(store: BannerDemoStore, command: Command<'postPlacement'>) {
  const metadata = entityMetadata();
  const code = command.data.code || 'BANNER-' + metadata.id;
  if (store.placements.some(entry => entry.code === code)) throw new CmsDemoError('PLACEMENT_CODE_TAKEN', 'Mã vị trí banner đã tồn tại.', 409);
  const placement = placementRecordSchema.parse({ ...BANNER_DEMO_DEFAULTS, ...command.data, ...metadata, code });
  store.placements.push(placement);
  return { ...placement, placementLayouts: [] };
}
export function patchPlacement(store: BannerDemoStore, command: Command<'patchPlacement'>) {
  const current = findPlacement(store, command.id);
  if (command.data.code && store.placements.some(entry => entry.code === command.data.code && entry.id !== current.id)) {
    throw new CmsDemoError('PLACEMENT_CODE_TAKEN', 'Mã vị trí banner đã tồn tại.', 409);
  }
  Object.assign(current, command.data, { updatedAt: new Date().toISOString() });
  return { ...current, placementLayouts: [] };
}
export function deletePlacement(store: BannerDemoStore, command: Command<'deletePlacement'>) {
  findPlacement(store, command.id);
  store.placements = store.placements.filter(entry => entry.id !== command.id);
  store.layouts = store.layouts.filter(entry => entry.placementId !== command.id);
  return { success: true };
}
export function postBanner(store: BannerDemoStore, command: Command<'postBanner'>) {
  const banner = bannerRecordSchema.parse({ ...BANNER_DEMO_DEFAULTS, ...command.data, ...entityMetadata() });
  store.banners.push(banner);
  return { ...banner, placementLayoutItems: [] };
}
export function patchBanner(store: BannerDemoStore, command: Command<'patchBanner'>) {
  const banner = findBanner(store, command.id);
  Object.assign(banner, command.data, { updatedAt: new Date().toISOString() });
  return { ...banner, placementLayoutItems: [] };
}
